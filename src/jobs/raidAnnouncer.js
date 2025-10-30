// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos para o portal ficar aberto

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase } = services;
    const { firestore, assetService } = firebase;

    const now = new Date();
    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const announcerRef = doc(firestore, 'bot_config', 'raidAnnouncer');

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

            // Se o horário já passou na hora atual, avança para a próxima hora
            if (raidStartTime.getTime() < now.getTime() - 60000) { 
                raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
            }

            const timeDiff = raidStartTime.getTime() - now.getTime();
            if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextRaid = raid;
            }
        }

        if (!nextRaid) {
            logger.debug('[raidAnnouncer] Nenhuma raid próxima encontrada no ciclo atual.');
            return;
        }

        const raidId = nextRaid['Dificuldade'];
        const raidStartTimeMs = now.getTime() + minTimeDiff;
        const fiveMinuteMark = raidStartTimeMs - 5 * 60 * 1000;
        const portalCloseTime = raidStartTimeMs + ANNOUNCEMENT_LIFETIME_MS;
        const tenSecondMark = portalCloseTime - 10 * 1000;
        
        const currentState = announcerState.raidId === raidId ? announcerState.state : 'finished';
        
        const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
        if (!raidChannel || !raidChannel.isTextBased()) {
            logger.error(`[raidAnnouncer] Canal de raid configurado é inválido ou não é um canal de texto.`);
            return;
        }
        
        // --- TRANSIÇÕES DE ESTADO ---
        
        // ESTADO 'FINISHED': A raid atual é diferente da última anunciada (ou é a primeira execução).
        // Ação: Posta o anúncio de "Próxima Raid".
        if (currentState === 'finished') {
            const webhook = await client.getOrCreateWebhook(raidChannel, 'Anunciador de Raids', announcerState.webhookUrl);
            if (!webhook) return;

            await webhook.edit({ name: `Próxima Raid: ${raidId}`, avatar: assetService.getAsset('BotAvatar') });
            const gifUrl = assetService.getAsset(`${raidId}PR`);
            const message = await webhook.send({ content: gifUrl || ' ', wait: true });
            
            await setDoc(announcerRef, { state: 'next_up', raidId: raidId, webhookUrl: webhook.url, messageId: message.id });
            logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
        }
        // ESTADO 'NEXT_UP': Esperando a marca de 5 minutos.
        // Ação: Edita a mensagem para o GIF de 5 minutos.
        else if (currentState === 'next_up' && now.getTime() >= fiveMinuteMark) {
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            const gifUrl = assetService.getAsset(`${raidId}5m`);
            if (gifUrl) {
                await webhook.edit({ name: `Atenção Raid ${raidId} Começando!` });
                await webhook.editMessage(announcerState.messageId, { content: gifUrl });
            }
            await updateDoc(announcerRef, { state: 'starting_soon' });
            logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
        }
        // ESTADO 'STARTING_SOON': Esperando a hora de início.
        // Ação: Deleta o webhook antigo e cria um novo para a raid aberta.
        else if (currentState === 'starting_soon' && now.getTime() >= raidStartTimeMs) {
            // Deleta a mensagem/webhook antigo
            if(announcerState.webhookUrl) {
                const oldWebhook = new WebhookClient({ url: announcerState.webhookUrl });
                await oldWebhook.delete().catch(e => logger.warn(`[${raidId}] Falha ao deletar webhook de anúncio antigo: ${e.message}`));
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
                .setTimestamp(raidStartTimeMs)
                .setFooter({ text: 'O portal fechará em 2 minutos.' });
            
            const roleMention = nextRaid.roleId ? `<@&${nextRaid.roleId}>` : '@everyone';
            const messagePayload = { content: roleMention, embeds: [embed] };
            if (gifUrl) {
                messagePayload.content = `${gifUrl}\n${roleMention}`;
            }
            
            const openMessage = await openWebhook.send({ ...messagePayload, wait: true });

            await updateDoc(announcerRef, { state: 'open', webhookUrl: openWebhook.url, messageId: openMessage.id });
            logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
        }
        // ESTADO 'OPEN': Esperando a marca de 10 segundos antes de fechar.
        // Ação: Edita a mensagem para o GIF de "Fechando".
        else if (currentState === 'open' && now.getTime() >= tenSecondMark) {
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            const gifUrl = assetService.getAsset(`${raidId}F`);

            if (gifUrl) {
                await webhook.edit({ name: `Raid ${raidId} fechando em 10s!` });
                const message = await webhook.fetchMessage(announcerState.messageId);
                const originalEmbed = message.embeds[0];
                 const updatedPayload = { content: `${gifUrl}\n${message.content.split('\n').pop()}`, embeds: [originalEmbed.setFooter({ text: 'O portal está fechando!' })] };
                await webhook.editMessage(announcerState.messageId, updatedPayload);
            }
             await updateDoc(announcerRef, { state: 'closing_soon' });
             logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
        }
        // ESTADO 'CLOSING_SOON': Esperando a hora de fechamento.
        // Ação: Deleta o webhook da raid aberta e reseta o estado para "finished".
        else if (currentState === 'closing_soon' && now.getTime() >= portalCloseTime) {
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            await webhook.delete().catch(e => logger.warn(`[${raidId}] Falha ao deletar webhook temporário: ${e.message}`));
            
            await updateDoc(announcerRef, { state: 'finished' });
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
