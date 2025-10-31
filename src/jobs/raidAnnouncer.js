// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';
const PERSISTENT_WEBHOOK_NAME = 'Anunciador de Raids';

async function getOrCreatePersistentWebhook(client, config, logger, assetService) {
    const channel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!channel) {
        logger.error(`[raidAnnouncer] Canal de raid (ID: ${config.RAID_CHANNEL_ID}) não foi encontrado.`);
        return null;
    }
    const webhooks = await channel.fetchWebhooks().catch(() => new Map());
    let webhook = webhooks.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME);

    if (!webhook) {
        try {
            const avatarURL = await assetService.getAsset('BotAvatar');
            webhook = await channel.createWebhook({
                name: PERSISTENT_WEBHOOK_NAME,
                avatar: avatarURL,
                reason: 'Webhook persistente para todos os anúncios de raid.'
            });
            logger.info(`[raidAnnouncer] Webhook persistente '${PERSISTENT_WEBHOOK_NAME}' criado.`);
        } catch (error) {
            logger.error(`[raidAnnouncer] Falha crítica ao criar o webhook persistente:`, error);
            return null;
        }
    }
    return webhook;
}

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    const { currentRaid, nextRaid } = getRaidTimings();
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const webhook = await getOrCreatePersistentWebhook(client, config, logger, assetService);
        if (!webhook) return;

        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };
        
        if (announcerState.webhookUrl !== webhook.url) {
            await setDoc(announcerRef, { webhookId: webhook.id, webhookUrl: webhook.url }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        if (currentRaid) {
            const { raid, raidId, avatarPrefix, startTimeMs, tenSecondMark } = currentRaid;
            const isNewCycle = announcerState.raidId !== raidId || announcerState.state !== 'open';

            if (isNewCycle && announcerState.state !== 'closing_soon') {
                if (announcerState.messageId) {
                    await webhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Não foi possível deletar a mensagem de 'próxima/5min': ${e.message}`));
                }

                const openAvatar = await assetService.getAsset(`${avatarPrefix}A`);
                await webhook.edit({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: openAvatar });

                const embed = new EmbedBuilder()
                    .setColor(0xFF4B4B)
                    .setImage(await assetService.getAsset('Open'))
                    .addFields(
                        { name: 'Dificuldade', value: raidId, inline: true },
                        { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true },
                        { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true },
                        { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                    )
                    .setTimestamp(startTimeMs)
                    .setFooter({ text: 'O portal fechará em 2 minutos.' });
                
                const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '';
                const message = await webhookClient.send({ content: roleMention, embeds: [embed], wait: true });
                
                await setDoc(announcerRef, { state: 'open', raidId, messageId: message.id, startTimeMs }, { merge: true });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);

            } else if (announcerState.state === 'open' && Date.now() >= tenSecondMark) {
                 const closingAvatar = await assetService.getAsset(`${avatarPrefix}F`);
                 await webhook.edit({ name: `Raid ${raidId} fechando em 10s!`, avatar: closingAvatar });
                
                try {
                    const closingEmbed = new EmbedBuilder()
                        .setColor(0x000000)
                        .setImage(await assetService.getAsset('Closing'))
                        .setFooter({ text: 'O portal está fechando!' });
                    await webhookClient.editMessage(announcerState.messageId, { embeds: [closingEmbed] });
                } catch(e) {
                     logger.error(`[${raidId}] Falha ao editar mensagem para 10s: ${e.message}`);
                }
                 
                await updateDoc(announcerRef, { state: 'closing_soon' });
                logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
            }
        } else if (nextRaid) {
            const { raid, raidId, avatarPrefix, fiveMinuteMark } = nextRaid;
            const isDifferentRaid = announcerState.raidId !== raidId || announcerState.state === 'finished';

            if (isDifferentRaid) {
                const nextAvatar = await assetService.getAsset(`${avatarPrefix}PR`);
                await webhook.edit({ name: `Próxima Raid: ${raidId}`, avatar: nextAvatar });
                 
                 const embed = new EmbedBuilder()
                    .setColor(0x2F3136)
                    .setImage(await assetService.getAsset('Next'));

                let message;
                if (announcerState.messageId) {
                    try {
                        message = await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] });
                    } catch {
                        message = await webhookClient.send({ embeds: [embed], wait: true });
                    }
                } else {
                    message = await webhookClient.send({ embeds: [embed], wait: true });
                }

                await setDoc(announcerRef, { state: 'next_up', raidId, messageId: message.id }, { merge: true });
                logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            
            } else if (announcerState.state === 'next_up' && Date.now() >= fiveMinuteMark) {
                const fiveMinAvatar = await assetService.getAsset(`${avatarPrefix}5m`);
                await webhook.edit({ name: `Atenção! Raid ${raidId} em 5 Min!`, avatar: fiveMinAvatar });

                 const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setImage(await assetService.getAsset('5Min'));

                await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem para 5min: ${e.message}`));

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        } else if (announcerState.state && announcerState.state !== 'finished') {
             const timeSinceStart = Date.now() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > (2 * 60 * 1000) + 10000) { // 2 minutos + 10s de margem
                logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado. Preparando para o próximo.`);
                await updateDoc(announcerRef, { state: 'finished' });
             }
        }
    } catch (error) {
        logger.error('[raidAnnouncer] Erro crítico no ciclo de vida da raid:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *';

export async function run(container) {
    await handleRaidLifecycle(container);
}
