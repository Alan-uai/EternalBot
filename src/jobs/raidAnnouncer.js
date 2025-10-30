// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos para o portal ficar aberto

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firestore, assetService } = services.firebase;

    const now = new Date();
    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const announcerRef = doc(firestore, 'bot_config/raid_announcements/announcer_state');

    try {
        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : {};
        
        let nextRaid = null;
        let minTimeDiff = Infinity;

        // 1. Encontrar qual é a próxima raid
        for (const raid of raids) {
            const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
            let raidStartTime = new Date(now);
            raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

            if (raidStartTime.getTime() < now.getTime() - 60000) { // Se já passou há mais de 1 min
                raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
            }

            const timeDiff = raidStartTime.getTime() - now.getTime();
            if (timeDiff >= -60000 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextRaid = raid;
            }
        }

        if (!nextRaid) {
            // logger.debug('[raidAnnouncer] Nenhuma raid próxima encontrada no ciclo atual.');
            return;
        }

        // 2. Lógica de transição de estados
        const raidId = nextRaid['Dificuldade'];
        const raidStartTime = now.getTime() + minTimeDiff;
        const fiveMinuteMark = raidStartTime - 5 * 60 * 1000;
        const tenSecondMark = raidStartTime + ANNOUNCEMENT_LIFETIME_MS - 10 * 1000;
        const portalCloseTime = raidStartTime + ANNOUNCEMENT_LIFETIME_MS;

        const currentState = announcerState.raidId === raidId ? announcerState.state : 'finished';
        
        const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
        if (!raidChannel || !raidChannel.isTextBased()) {
            logger.error(`[raidAnnouncer] Canal de raid configurado é inválido ou não é um canal de texto.`);
            return;
        }
        
        // --- TRANSIÇÕES DE ESTADO ---
        
        // FINISHED -> NEXT_UP: A raid atual é diferente da última anunciada.
        if (currentState === 'finished') {
            const gifUrl = assetService.getAsset(`${raidId}PR`);
            const webhook = await client.getOrCreateWebhook(raidChannel, 'Anunciador de Raids', announcerState.webhookUrl);
            if (!webhook) return;

            await webhook.edit({ name: `Próxima Raid: ${raidId}`, avatar: assetService.getAsset('BotAvatar') });
            const message = await webhook.send({ content: gifUrl || ' ', wait: true });
            
            await setDoc(announcerRef, { state: 'next_up', raidId: raidId, webhookUrl: webhook.url, messageId: message.id });
            logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
        }
        // NEXT_UP -> STARTING_SOON: Faltam 5 minutos.
        else if (currentState === 'next_up' && now.getTime() >= fiveMinuteMark) {
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            const gifUrl = assetService.getAsset(`${raidId}5m`);
            if (gifUrl) {
                await webhook.edit({ name: `Atenção Raid ${raidId} Começando!` });
                await webhook.editMessage(announcerState.messageId, { content: gifUrl });
                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            } else {
                // Se não houver gif de 5m, pulamos direto para o próximo estado relevante
                await updateDoc(announcerRef, { state: 'starting_soon' });
            }
        }
        // STARTING_SOON -> OPEN: A raid começou.
        else if (currentState === 'starting_soon' && now.getTime() >= raidStartTime) {
            // Deleta a mensagem/webhook antigo
            if(announcerState.webhookUrl && announcerState.messageId) {
                const oldWebhook = new WebhookClient({ url: announcerState.webhookUrl });
                await oldWebhook.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Falha ao deletar mensagem antiga: ${e.message}`));
            }

            const openWebhook = await raidChannel.createWebhook({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: assetService.getAsset('BotAvatar'), reason: 'Anúncio de raid aberta.' });
            const gifUrl = assetService.getAsset(`${raidId}A`);
            
            const embed = new EmbedBuilder()
                .setColor(0xFF4B4B)
                .addFields(
                    { name: 'Dificuldade', value: raidId, inline: true },
                    { name: 'Vida do Chefe', value: `\`${nextRaid['Vida Último Boss']}\``, inline: true },
                    { name: 'Dano Recomendado', value: `\`${nextRaid['Dano Recomendado']}\``, inline: true },
                    { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                )
                .setTimestamp(raidStartTime)
                .setFooter({ text: 'O portal fechará em 2 minutos.' });
            
            if (gifUrl) embed.setImage(gifUrl);

            const roleMention = nextRaid.roleId ? `<@&${nextRaid.roleId}>` : '@everyone';
            const openMessage = await openWebhook.send({ content: roleMention, embeds: [embed], wait: true });

            await updateDoc(announcerRef, { state: 'open', tempWebhookUrl: openWebhook.url, tempMessageId: openMessage.id });
            logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
        }
        // OPEN -> CLOSING_SOON: Faltam 10 segundos.
        else if (currentState === 'open' && now.getTime() >= tenSecondMark) {
            const webhook = new WebhookClient({ url: announcerState.tempWebhookUrl });
            const gifUrl = assetService.getAsset(`${raidId}F`);

            if (gifUrl) {
                await webhook.edit({ name: `Raid ${raidId} fechando em 10s!` });
                const message = await webhook.fetchMessage(announcerState.tempMessageId);
                const originalEmbed = message.embeds[0];
                const updatedEmbed = EmbedBuilder.from(originalEmbed).setImage(gifUrl).setFooter({ text: 'O portal está fechando!' });
                await webhook.editMessage(announcerState.tempMessageId, { embeds: [updatedEmbed] });
            }
             await updateDoc(announcerRef, { state: 'closing_soon' });
             logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
        }
        // CLOSING_SOON -> FINISHED: O portal fechou.
        else if (currentState === 'closing_soon' && now.getTime() >= portalCloseTime) {
            const webhook = new WebhookClient({ url: announcerState.tempWebhookUrl });
            await webhook.delete().catch(e => logger.warn(`[${raidId}] Falha ao deletar webhook temporário: ${e.message}`));
            
            await updateDoc(announcerRef, { state: 'finished', tempWebhookUrl: null, tempMessageId: null });
            logger.info(`[${raidId}] Ciclo da raid finalizado.`);
        }

    } catch (error) {
        logger.error('[raidAnnouncer] Erro no ciclo de vida da raid:', error);
    }
}


export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    await handleRaidLifecycle(container);
}
