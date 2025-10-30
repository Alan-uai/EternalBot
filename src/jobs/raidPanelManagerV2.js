// src/jobs/raidPanelManagerV2.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const name = 'raidPanelManagerV2';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

const PANEL_DOC_ID = 'raidStatusPanelV2';
const WEBHOOK_NAME = 'Painel de Status das Raids (V2)';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60;

async function getOrCreatePanelMessage(client) {
    const { config, logger, services } = client.container;
    const { firestore } = services.firebase;
    const channel = await client.channels.fetch(config.RAID_CHANNEL_ID);
    const panelDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
    const panelDocSnap = await getDoc(panelDocRef);
    let messageId;
    let webhookUrl;

    if (panelDocSnap.exists()) {
        messageId = panelDocSnap.data().messageId;
        webhookUrl = panelDocSnap.data().webhookUrl;
    }

    const webhook = await client.getOrCreateWebhook(channel, WEBHOOK_NAME, client.user.displayAvatarURL());
    if (!webhook) {
        logger.error('Não foi possível criar ou obter o webhook para o painel de raids V2.');
        return { webhook: null, messageId: null };
    }
    
    if (webhook.url !== webhookUrl) {
        await setDoc(panelDocRef, { webhookUrl: webhook.url }, { merge: true });
        messageId = null;
    }

    if (messageId) {
        try {
            const webhookClient = new WebhookClient({ url: webhook.url });
            await webhookClient.fetchMessage(messageId);
        } catch (error) {
             logger.warn(`Mensagem do painel V2 (ID: ${messageId}) não encontrada. Criando uma nova.`);
             messageId = null;
        }
    }
    
    return { webhook, messageId };
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
            inline: false, 
        });
    }
    
    return statuses;
}

export async function run(container) {
    const { client, logger, services } = container;
    
    if (!services.firebase) { 
        logger.debug('Serviço Firebase não encontrado. Pulando atualização do painel V2.');
        return;
    }
    
    try {
        const { webhook, messageId: initialMessageId } = await getOrCreatePanelMessage(client);
        if (!webhook) return;
        
        let messageId = initialMessageId;
        const statuses = getRaidStatus();

        const embed = new EmbedBuilder()
            .setColor(0x2F3136)
            .setAuthor({ name: '🗺️ Painel de Status das Raids do Lobby' })
            .setDescription(`*Atualizado <t:${Math.floor(Date.now() / 1000)}:R>*\n_ _`)
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });

        // Adiciona um separador invisível
        const addSeparator = () => embed.addFields({ name: '\u200B', value: '\u200B' });

        statuses.forEach((status, index) => {
            embed.addFields(status);
            if (index < statuses.length - 1) {
                addSeparator();
            }
        });
            
        const webhookClient = new WebhookClient({ url: webhook.url });

        if (messageId) {
            await webhookClient.editMessage(messageId, { embeds: [embed] });
        } else {
            const channel = await client.channels.fetch(container.config.RAID_CHANNEL_ID);
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
        logger.error('Erro ao atualizar o painel de raids V2:', error);
    }
}
