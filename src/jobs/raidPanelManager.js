// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const name = 'raidPanelManager';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

const PANEL_DOC_ID = 'raidStatusPanel';
const WEBHOOK_NAME = 'Painel de Status das Raids do Lobby';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos em segundos

async function getOrCreatePanelMessage(client) {
    const { config, logger, services } = client.container;
    const { firestore } = services.firebase;
    
    let channel;
    try {
        channel = await client.channels.fetch(config.RAID_CHANNEL_ID);
    } catch (fetchError) {
        logger.error(`[raidPanelManager] Não foi possível encontrar o canal de raid (ID: ${config.RAID_CHANNEL_ID})`, fetchError);
        return { webhook: null, messageId: null };
    }

    if (!channel) {
        logger.error(`[raidPanelManager] O canal de raid com ID ${config.RAID_CHANNEL_ID} retornou nulo.`);
        return { webhook: null, messageId: null };
    }

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
        logger.error('[raidPanelManager] Não foi possível criar ou obter o webhook para o painel de raids.');
        return { webhook: null, messageId: null };
    }
    
    // Se a URL do webhook mudou ou é a primeira vez, atualiza no DB
    if (webhook.url !== webhookUrl) {
        await setDoc(panelDocRef, { webhookUrl: webhook.url }, { merge: true });
        messageId = null; // Força a criação de uma nova mensagem
    }

    if (messageId) {
        try {
            const webhookClient = new WebhookClient({ url: webhook.url });
            await webhookClient.fetchMessage(messageId);
        } catch (error) {
             logger.warn(`[raidPanelManager] Mensagem do painel (ID: ${messageId}) não encontrada. Criando uma nova.`);
             messageId = null;
        }
    }
    
    return { webhook, messageId };
}


function getRaidStatus(config) {
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    const currentSecond = now.getUTCSeconds();
    
    const totalSecondsInHour = (currentMinute * 60) + currentSecond;

    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const statuses = [];
    
    let nextRaidInfo = { raidName: null, secondsUntilNextOpen: Infinity };

    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < 0) {
            secondsUntilOpen += 3600; 
        }
        if (secondsUntilOpen < nextRaidInfo.secondsUntilNextOpen) {
            nextRaidInfo = { raidName: raid['Dificuldade'], secondsUntilNextOpen: secondsUntilOpen };
        }
    }
    
    for (const raid of raids) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidStartSecondInHour = raidStartMinute * 60;
        const portalCloseSecondInHour = raidStartSecondInHour + PORTAL_OPEN_DURATION_SECONDS;
        
        let secondsUntilOpen = raidStartSecondInHour - totalSecondsInHour;
        if (secondsUntilOpen < 0) secondsUntilOpen += 3600;

        let statusText, details, gifId = null;

        const isCurrentlyOpen = (totalSecondsInHour >= raidStartSecondInHour) && (totalSecondsInHour < portalCloseSecondInHour);

        if (isCurrentlyOpen) {
            const secondsUntilClose = portalCloseSecondInHour - totalSecondsInHour;
            const closeMinutes = Math.floor(secondsUntilClose / 60);
            const closeSeconds = secondsUntilClose % 60;
            statusText = '✅ **ABERTA**';
            details = `Fecha em: \`${closeMinutes}m ${closeSeconds.toString().padStart(2, '0')}s\``;
            if (raid['Dificuldade'] === 'Easy') {
                 gifId = (secondsUntilClose <= 10) ? 'EasyF' : 'EasyA';
            }
        } else {
            statusText = '❌ Fechada';
            const minutesPart = Math.floor(secondsUntilOpen / 60);
            const secondsPart = secondsUntilOpen % 60;
            details = `Abre em: \`${minutesPart}m ${secondsPart.toString().padStart(2, '0')}s\``;
            if (raid['Dificuldade'] === 'Easy' && raid['Dificuldade'] === nextRaidInfo.raidName) {
                gifId = (secondsUntilOpen <= 300) ? 'Easy5m' : 'EasyPR';
            }
        }
        
        let imageUrl = null;
        if (config.CLOUDINARY_URL && gifId) {
             imageUrl = `${config.CLOUDINARY_URL}${gifId}.gif`;
        }
        
        statuses.push({
            name: `> ${raid['Dificuldade']}`,
            value: `${statusText}\n> ${details}`,
            inline: true,
            imageUrl: imageUrl 
        });
    }

    const nextRaidImageUrl = statuses.find(s => s.imageUrl && (s.value.includes('Abre em') || s.value.includes('ABERTA')) )?.imageUrl || null;
    
    return { statuses, nextRaidImageUrl };
}

export async function run(container) {
    const { client, logger, services, config } = container;
    
    if (!services.firebase) { 
        logger.debug('[raidPanelManager] Serviço Firebase não encontrado. Pulando atualização.');
        return;
    }
    
    try {
        const { webhook, messageId: initialMessageId } = await getOrCreatePanelMessage(client);
        if (!webhook) return;
        
        let messageId = initialMessageId;

        const { statuses, nextRaidImageUrl } = getRaidStatus(config);

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('Painel de Status das Raids do Lobby')
            .setDescription('Este painel é atualizado automaticamente a cada 10 segundos.')
            .addFields(statuses.map(s => ({ name: s.name, value: s.value, inline: s.inline })))
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        if(nextRaidImageUrl) {
            embed.setImage(nextRaidImageUrl);
        }
            
        const webhookClient = new WebhookClient({ url: webhook.url });

        if (messageId) {
            await webhookClient.editMessage(messageId, { embeds: [embed] });
        } else {
            const channel = await client.channels.fetch(config.RAID_CHANNEL_ID);
            const oldMessages = await channel.messages.fetch({ limit: 10 });
            const oldBotPanel = oldMessages.find(m => m.webhookId === webhook.id && m.embeds[0]?.title === 'Painel de Status das Raids do Lobby');
            if (oldBotPanel) await oldBotPanel.delete().catch(() => {});

            const sentMessage = await webhookClient.send({
                username: webhook.name,
                avatarURL: client.user.displayAvatarURL(),
                embeds: [embed],
                wait: true,
            });
            messageId = sentMessage.id;
            
            try {
                const newMessage = await channel.messages.fetch(messageId);
                await newMessage.pin().catch(err => logger.error("[raidPanelManager] Não foi possível fixar a nova mensagem do painel.", err));
            } catch(pinError) {
                 logger.error("[raidPanelManager] Erro ao buscar ou fixar a mensagem do painel.", pinError);
            }
            
            const panelDocRef = doc(services.firestore, 'bot_config', PANEL_DOC_ID);
            await setDoc(panelDocRef, { messageId: messageId, webhookUrl: webhook.url }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
