// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient, ChannelType } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos para o portal ficar aberto

async function getOrCreateWebhook(channel, name, firestoreRef, logger) {
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
        logger.error(`[getOrCreateWebhook] Canal fornecido para "${name}" é inválido.`);
        return null;
    }

    const { firestore, assetService } = channel.client.container.services.firebase;
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

        // 1. Encontrar qual é a próxima raid
        for (const raid of raids) {
            const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
            let raidStartTime = new Date(now);
            raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

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
        if (!raidChannel) {
             logger.error(`[raidAnnouncer] Canal de raid configurado é inválido.`);
             return;
        }

        // ESTADO 'FINISHED'
        if (currentState === 'finished' && now.getTime() < fiveMinuteMark) {
            const webhook = await getOrCreateWebhook(raidChannel, `Próxima Raid: ${raidId}`, announcerRef, logger);
            if (!webhook) return;

            const gifUrl = assetService.getAsset(`${raidId}PR`);
            const payload = { content: gifUrl || ' ' };
            
            let message;
            if (announcerState.messageId) {
                message = await webhook.editMessage(announcerState.messageId, payload).catch(() => null);
            }
            if (!message) {
                 message = await webhook.send({ ...payload, wait: true });
            }
            
            await setDoc(announcerRef, { state: 'next_up', raidId: raidId, webhookUrl: webhook.url, messageId: message.id }, { merge: true });
            logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
        }
        // ESTADO 'NEXT_UP'
        else if (currentState === 'next_up' && now.getTime() >= fiveMinuteMark && now.getTime() < raidStartTimeMs) {
            const webhook = new WebhookClient({ url: announcerState.webhookUrl });
            await webhook.edit({ name: `Atenção Raid ${raidId} Começando!` });
            const gifUrl = assetService.getAsset(`${raidId}5m`);
            if (gifUrl) {
                await webhook.editMessage(announcerState.messageId, { content: gifUrl });
            }
            await updateDoc(announcerRef, { state: 'starting_soon' });
            logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
        }
        // ESTADO 'STARTING_SOON'
        else if (currentState === 'starting_soon' && now.getTime() >= raidStartTimeMs) {
            if(announcerState.webhookUrl && announcerState.messageId) {
                const oldWebhook = new WebhookClient({ url: announcerState.webhookUrl });
                await oldWebhook.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Falha ao deletar mensagem de anúncio antiga: ${e.message}`));
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
            
            const announcementMessagesRef = doc(firestore, `bot_config/raid_announcements/messages/${openMessage.id}`);
            await setDoc(announcementMessagesRef, {
                webhookUrl: openWebhook.url,
                messageId: openMessage.id,
                expiresAt: new Date(portalCloseTime)
            });

            await updateDoc(announcerRef, { state: 'open', tempWebhookUrl: openWebhook.url, tempMessageId: openMessage.id });
            logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
        }
        // ESTADO 'OPEN'
        else if (currentState === 'open' && now.getTime() >= tenSecondMark) {
            const webhook = new WebhookClient({ url: announcerState.tempWebhookUrl });
            const gifUrl = assetService.getAsset(`${raidId}F`);

            if (gifUrl) {
                await webhook.edit({ name: `Raid ${raidId} fechando em 10s!` });
                const message = await webhook.fetchMessage(announcerState.tempMessageId);
                const originalEmbed = message.embeds[0];
                const updatedPayload = { content: `${gifUrl}\n${message.content.split('\n').pop()}`, embeds: [originalEmbed.setFooter({ text: 'O portal está fechando!' })] };
                await webhook.editMessage(announcerState.tempMessageId, updatedPayload);
            }
             await updateDoc(announcerRef, { state: 'closing_soon' });
             logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
        }
        // ESTADO 'CLOSING_SOON'
        else if (currentState === 'closing_soon' && now.getTime() >= portalCloseTime) {
            const webhook = new WebhookClient({ url: announcerState.tempWebhookUrl });
            await webhook.delete().catch(e => logger.warn(`[${raidId}] Falha ao deletar webhook temporário da raid aberta: ${e.message}`));
            
            // Deleta o registro da mensagem para não ser limpa pelo ready.js
            const announcementMessagesRef = doc(firestore, `bot_config/raid_announcements/messages/${announcerState.tempMessageId}`);
            await deleteDoc(announcementMessagesRef);

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

    