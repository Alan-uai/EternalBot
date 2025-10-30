// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient, ChannelType } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PANEL_DOC_ID = 'raidStatusPanel';
const WEBHOOK_NAME = 'Painel de Status das Raids';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

async function getOrCreatePanelMessage(container) {
    const { client, logger, services } = container;
    const { firestore } = services.firebase;
    const { config } = client.container;

    const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!raidChannel || raidChannel.type !== ChannelType.GuildText) {
        logger.error(`[raidPanelManager] Canal de raid (ID: ${config.RAID_CHANNEL_ID}) é inválido.`);
        return { webhookClient: null, messageId: null, webhook: null };
    }
    
    const webhook = await getOrCreateWebhook(raidChannel, WEBHOOK_NAME, client);
    if (!webhook) {
         logger.error(`[raidPanelManager] Não foi possível criar ou obter o webhook para o painel de raids.`);
         return { webhookClient: null, messageId: null, webhook: null };
    }

    const panelDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
    const panelDocSnap = await getDoc(panelDocRef);
    let messageId = panelDocSnap.exists() ? panelDocSnap.data().messageId : null;
    
    const webhookClient = new WebhookClient({ url: webhook.url });

    if (messageId) {
        try {
            await webhookClient.fetchMessage(messageId);
        } catch (error) {
             logger.warn(`[raidPanelManager] Mensagem do painel (ID: ${messageId}) não encontrada. Será criada uma nova.`);
             messageId = null;
        }
    }
    
    return { webhookClient, messageId, webhook };
}

async function getOrCreateWebhook(channel, webhookName, client) {
    const { logger } = client.container;
    if (!channel || channel.type !== ChannelType.GuildText) {
        logger.error(`[getOrCreateWebhook] Canal fornecido é inválido ou não é de texto.`);
        return null;
    }
    try {
        const webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.find(wh => wh.name === webhookName && wh.owner.id === client.user.id);

        if (!webhook) {
            webhook = await channel.createWebhook({
                name: webhookName,
                avatar: client.user.displayAvatarURL(),
                reason: `Webhook para ${webhookName}`,
            });
            logger.info(`[getOrCreateWebhook] Webhook '${webhookName}' criado no canal #${channel.name}.`);
        }
        return webhook;
    } catch (error) {
        logger.error(`[getOrCreateWebhook] Falha ao criar ou obter o webhook '${webhookName}' no canal #${channel.name}:`, error);
        return null;
    }
}


function getRaidStatus() {
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];
    
    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < 0) secondsUntilOpen += 3600;

        let statusText, details;
        const isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);

        if (isCurrentlyOpen) {
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
        } else {
            statusText = '❌ Fechada';
            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
        }
        
        const raidEmojis = {
            'Easy': '🟢', 'Medium': '🟡', 'Hard': '🔴', 'Insane': '⚔️', 'Crazy': '🔥', 'Nightmare': '💀', 'Leaf Raid (1800)': '🌿'
        };

        statuses.push({
            name: `${raidEmojis[raid['Dificuldade']] || '⚔️'} ${raid['Dificuldade']}`,
            value: `${statusText}\n${details}`,
            inline: true, 
        });
    }
    
    return statuses;
}

export const name = 'raidPanelManager';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const { client, logger, services } = container;
    
    if (!services.firebase) { 
        logger.debug('[raidPanelManager] Serviços essenciais não encontrados. Pulando atualização.');
        return;
    }
    
    try {
        const { webhookClient, messageId: initialMessageId, webhook } = await getOrCreatePanelMessage(container);
        if (!webhookClient) return;
        
        let messageId = initialMessageId;

        const statuses = getRaidStatus();

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: '🗺️ Painel de Status das Raids do Lobby' })
            .setDescription(`*Atualizado <t:${Math.floor(Date.now() / 1000)}:R>*`)
            .addFields(statuses)
            .addFields({ name: '\u200B', value: '----------------------------------------' })
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        if (messageId) {
            await webhookClient.editMessage(messageId, { embeds: [embed] });
        } else {
            const sentMessage = await webhookClient.send({
                username: webhook.name,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
                wait: true,
            });
            messageId = sentMessage.id;
            
            const panelDocRef = doc(services.firestore, 'bot_config', PANEL_DOC_ID);
            await setDoc(panelDocRef, { messageId: messageId, webhookUrl: webhook.url }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
