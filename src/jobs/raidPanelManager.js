// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js'; // Importa a lógica de tempo unificada

const PANEL_DOC_ID = 'raidPanel';
const PERSISTENT_WEBHOOK_NAME = 'Painel de Status das Raids';
const RAID_AVATAR_PREFIXES = {
    'Easy': 'Easy',
    'Medium': 'Med',
    'Hard': 'Hd',
    'Insane': 'Isne',
    'Crazy': 'Czy',
    'Nightmare': 'Mare',
    'Leaf Raid': 'Lf'
};

async function getRaidStatusPanelData(container) {
    const { services } = container;
    const { assetService } = services;
    
    // Usa a lógica de tempo unificada para obter os status
    const { statuses, nextRaid } = getRaidTimings();
    
    let gifUrl = null;
    if (nextRaid && assetService) {
        // Busca o GIF da próxima raid
        const assetPrefix = RAID_AVATAR_PREFIXES[nextRaid.raidId] || 'Easy';
        gifUrl = await assetService.getAsset(`${assetPrefix}PR`); 
    }

    return { statuses, gifUrl };
}

export const name = 'raidPanelManager';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const { client, logger, services } = container;
    const { firebase, assetService } = services;
    
    if (!firebase || !firebase.firestore) {
        logger.error('[raidPanelManager] Serviço Firestore não está inicializado.');
        return;
    }
    const { firestore } = firebase;

    try {
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);

        let webhookData = docSnap.exists() ? docSnap.data() : {};
        let { webhookUrl, webhookId, webhookToken, messageId } = webhookData;

        // Se não tivermos as informações completas do webhook, tentamos encontrá-lo ou criá-lo
        if (!webhookId || !webhookToken || !webhookUrl) {
            const channel = await client.channels.fetch(container.config.RAID_CHANNEL_ID);
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME && wh.owner.id === client.user.id);
            
            if (!webhook) {
                 webhook = await channel.createWebhook({ name: PERSISTENT_WEBHOOK_NAME, reason: 'Painel de status das raids.'});
            }
            
            webhookId = webhook.id;
            webhookToken = webhook.token;
            webhookUrl = webhook.url;
            
            // Salva as informações completas no Firestore
            await setDoc(panelWebhookDocRef, { webhookId, webhookToken, webhookUrl }, { merge: true });
            logger.info(`[raidPanelManager] Webhook '${PERSISTENT_WEBHOOK_NAME}' encontrado/criado e informações salvas.`);
            messageId = null; // Força a criação de uma nova mensagem
        }
        
        const webhookClient = new WebhookClient({ id: webhookId, token: webhookToken });

        const { statuses, gifUrl } = await getRaidStatusPanelData(container);
        
        const avatarUrl = assetService ? await assetService.getAsset('DungeonLobby') : client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setImage(gifUrl || null) // Usa a URL do GIF aqui
            .setColor(0x2F3136)
            .setAuthor({ name: '🗺️ Painel de Status das Raids do Lobby' })
            .setDescription(`*Atualizado <t:${Math.floor(Date.now() / 1000)}:R>*`)
            .setFields(statuses)
            .setTimestamp()
            .setFooter({ text: 'Horários baseados no fuso horário do servidor (UTC).' });
            
        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: avatarUrl,
            embeds: [embed],
        };

        if (messageId) {
            try {
                await webhookClient.editMessage(messageId, payload);
            } catch(e) {
                 logger.warn(`[raidPanelManager] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova. Erro: ${e.message}`);
                 const newMessage = await webhookClient.send({ ...payload, wait: true });
                 await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
            }
        } else {
             const newMessage = await webhookClient.send({ ...payload, wait: true });
             await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}

    