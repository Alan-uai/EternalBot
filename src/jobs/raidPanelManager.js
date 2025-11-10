// src/jobs/raidPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js'; // Importa a lógica de tempo unificada

const PANEL_DOC_ID = 'raidPanel';
const PERSISTENT_WEBHOOK_NAME = 'Painel de Status das Raids';

async function getRaidStatusPanelData(container) {
    const { services } = container;
    const { assetService } = services;
    
    // Usa a lógica de tempo unificada para obter os status
    const { statuses } = getRaidTimings();
    
    return { statuses };
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
        let { webhookUrl, messageId } = webhookData;

        // Se não tivermos as informações completas do webhook, o job ready deve ter criado.
        // Se ainda não existir, logamos o erro e esperamos a próxima execução.
        if (!webhookUrl) {
            logger.warn(`[raidPanelManager] URL do webhook para '${PANEL_DOC_ID}' ainda não está no Firestore. O job 'ready' deve criá-la.`);
            return;
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const { statuses } = await getRaidStatusPanelData(container);
        
        const avatarUrl = assetService ? await assetService.getAsset('DungeonLobby') : client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
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
