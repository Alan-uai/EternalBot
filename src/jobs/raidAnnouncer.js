// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient, ChannelType } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos para o portal ficar aberto

async function getOrCreateWebhook(channel, name, firestoreRef, logger, assetService) {
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
        logger.error(`[getOrCreateWebhook] Canal fornecido para "${name}" é inválido.`);
        return null;
    }
    const { firestore } = channel.client.container.services.firebase;
    const docSnap = await getDoc(firestoreRef);
    const existingUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;

    if (existingUrl) {
        try {
            const webhook = new WebhookClient({ url: existingUrl });
            await webhook.fetch(); // Verifica se o webhook ainda existe
            return webhook;
        } catch (error) {
            logger.warn(`[getOrCreateWebhook] Webhook para "${name}" inválido ou deletado. Criando um novo.`);
        }
    }
    try {
        const newWebhook = await channel.createWebhook({
            name: name,
            avatar: assetService.getAsset('BotAvatar'),
            reason: `Webhook para ${name}`,
        });
        await setDoc(firestoreRef, { webhookUrl: newWebhook.url }, { merge: true });
        logger.info(`[getOrCreateWebhook] Webhook "${name}" criado e salvo no Firestore.`);
        return newWebhook;
    } catch (error) {
        logger.error(`[getOrCreateWebhook] Falha crítica ao criar webhook para "${name}":`, error);
        return null;
    }
}

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
        let currentRaid = null;

        for (const raid of raids) {
            const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
            let raidStartTime = new Date(now);
            raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

            if (raidStartTime.getTime() < now.getTime() - ANNOUNCEMENT_LIFETIME_MS) {
                raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
            }
            
            const timeDiff = raidStartTime.getTime() - now.getTime();

            // Identifica a raid que está aberta agora
            if (timeDiff <= 0 && timeDiff > -ANNOUNCEMENT_LIFETIME_MS) {
                currentRaid = { ...raid, startTime: raidStartTime };
            }

            // Identifica a próxima raid
            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextRaid = { ...raid, startTime: raidStartTime };
            }
        }
        
        const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
        if (!raidChannel) {
             logger.error(`[raidAnnouncer] Canal de raid configurado é inválido.`);
             return;
        }
        
        // --- GERENCIAMENTO DA RAID ATUAL (SE HOUVER) ---
        if (currentRaid) {
            const raidId = currentRaid.Dificuldade;
            const raidStartTimeMs = currentRaid.startTime.getTime();
            const portalCloseTime = raidStartTimeMs + ANNOUNCEMENT_LIFETIME_MS;
            const tenSecondMark = portalCloseTime - 10 * 1000;
            const currentState = announcerState.raidId === raidId ? announcerState.state : 'new';

            // ESTADO 'NEW' -> 'OPEN'
            if (currentState === 'new') {
                const openWebhook = await raidChannel.createWebhook({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: assetService.getAsset('BotAvatar'), reason: 'Anúncio de raid aberta.' });
                const gifUrl = assetService.getAsset(`${raidId}A`);
                const embed = new EmbedBuilder()
                    .setColor(0xFF4B4B).addFields(
                        { name: 'Dificuldade', value: raidId, inline: true },
                        { name: 'Vida do Chefe', value: `\`${currentRaid['Vida Último Boss']}\``, inline: true },
                        { name: 'Dano Recomendado', value: `\`${currentRaid['Dano Recomendado']}\``, inline: true },
                        { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                    ).setTimestamp(raidStartTimeMs).setFooter({ text: 'O portal fechará em 2 minutos.' });
                
                const roleMention = currentRaid.roleId ? `<@&${currentRaid.roleId}>` : '@everyone';
                const messagePayload = { content: roleMention, embeds: [embed] };
                if (gifUrl) messagePayload.content = `${gifUrl}\n${roleMention}`;
                
                const openMessage = await openWebhook.send({ ...messagePayload, wait: true });
                
                await setDoc(doc(firestore, `bot_config/raid_announcements/messages/${openMessage.id}`), { webhookUrl: openWebhook.url, messageId: openMessage.id, expiresAt: new Date(portalCloseTime) });
                await updateDoc(announcerRef, { state: 'open', raidId: raidId, webhookUrl: openWebhook.url, messageId: openMessage.id });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
            }
            // ESTADO 'OPEN' -> 'CLOSING_SOON'
            else if (currentState === 'open' && now.getTime() >= tenSecondMark) {
                 const webhook = new WebhookClient({ url: announcerState.webhookUrl });
                 await webhook.edit({ name: `Raid ${raidId} fechando em 10s!` });
                 const gifUrl = assetService.getAsset(`${raidId}F`);
                 if(gifUrl) {
                    const message = await webhook.fetchMessage(announcerState.messageId);
                    const originalEmbed = message.embeds[0];
                    const updatedPayload = { content: `${gifUrl}\n${message.content.split('\n').pop()}`, embeds: [EmbedBuilder.from(originalEmbed).setFooter({ text: 'O portal está fechando!' })] };
                    await webhook.editMessage(announcerState.messageId, updatedPayload);
                 }
                 await updateDoc(announcerRef, { state: 'closing_soon' });
                 logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
            }
        }
        // --- NENHUMA RAID ATIVA, GERENCIAR PRÓXIMA RAID ---
        else if (nextRaid) {
            const raidId = nextRaid.Dificuldade;
            const raidStartTimeMs = nextRaid.startTime.getTime();
            const fiveMinuteMark = raidStartTimeMs - 5 * 60 * 1000;
            const currentState = announcerState.raidId === raidId ? announcerState.state : 'finished';

            if (currentState === 'finished' && now.getTime() < fiveMinuteMark) {
                 const webhook = await getOrCreateWebhook(raidChannel, `Próxima Raid: ${raidId}`, announcerRef, logger, assetService);
                 if (!webhook) return;
                 const gifUrl = assetService.getAsset(`${raidId}PR`);
                 const payload = { content: gifUrl || ' ' };
                 let message;
                 if (announcerState.messageId) message = await webhook.editMessage(announcerState.messageId, payload).catch(() => null);
                 if (!message) message = await webhook.send({ ...payload, wait: true });
                 
                 await setDoc(announcerRef, { state: 'next_up', raidId: raidId, webhookUrl: webhook.url, messageId: message.id }, { merge: true });
                 logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            }
            else if (currentState === 'next_up' && now.getTime() >= fiveMinuteMark) {
                const webhook = new WebhookClient({ url: announcerState.webhookUrl });
                await webhook.edit({ name: `Atenção Raid ${raidId} Começando!` });
                const gifUrl = assetService.getAsset(`${raidId}5m`);
                if (gifUrl) await webhook.editMessage(announcerState.messageId, { content: gifUrl });

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        }
        // --- LIMPEZA APÓS O CICLO ---
        else if (announcerState.state && announcerState.state !== 'finished') {
            logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado, limpando estado.`);
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            await webhook.delete().catch(e => logger.warn(`[${announcerState.raidId}] Falha ao deletar webhook da raid anterior: ${e.message}`));
            await updateDoc(announcerRef, { state: 'finished', messageId: null, webhookUrl: null });
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
