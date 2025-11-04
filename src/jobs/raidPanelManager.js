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

        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.debug(`[raidPanelManager] Webhook '${PANEL_DOC_ID}' não encontrado no Firestore. O painel não será atualizado.`);
            return;
        }
        
        const webhookUrl = docSnap.data().webhookUrl;
        const messageId = docSnap.data().messageId;
        const webhookClient = new WebhookClient({ url: webhookUrl });

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
            
        let sentMessage;
        if (messageId) {
            try {
                sentMessage = await webhookClient.editMessage(messageId, { embeds: [embed] });
            } catch(e) {
                 logger.warn(`[raidPanelManager] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                 sentMessage = await webhookClient.send({
                    username: PERSISTENT_WEBHOOK_NAME,
                    avatarURL: avatarUrl,
                    embeds: [embed],
                    wait: true
                });
                await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
            }
        } else {
             sentMessage = await webhookClient.send({
                username: PERSISTENT_WEBHOOK_NAME,
                avatarURL: avatarUrl,
                embeds: [embed],
                wait: true,
            });
            await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de raids:', error);
    }
}
