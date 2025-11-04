// src/jobs/supportPanelManager.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SUPPORT_BUTTON_IDS } from '../commands/utility/gerenciar.js';

const PANEL_DOC_ID = 'supportPanel';
const PERSISTENT_WEBHOOK_NAME = 'Suporte | Denúncias | Formulários';

export const name = 'supportPanelManager';
export const schedule = '0 */1 * * *'; // Roda a cada hora para garantir que o painel está lá

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    try {
        const panelChannel = await client.channels.fetch(config.SUPPORT_PANEL_CHANNEL_ID).catch(() => null);
        if (!panelChannel) {
            logger.warn(`[supportPanel] Canal de suporte (${config.SUPPORT_PANEL_CHANNEL_ID}) não encontrado.`);
            return;
        }

        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        if (!webhookUrl) {
            const webhooks = await panelChannel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME && wh.owner.id === client.user.id);
            if (!webhook) {
                 webhook = await panelChannel.createWebhook({ name: PERSISTENT_WEBHOOK_NAME, reason: 'Painel de suporte persistente.'});
            }
            webhookUrl = webhook.url;
            await setDoc(panelWebhookDocRef, { webhookUrl }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('Central de Suporte e Gerenciamento')
            .setDescription('Utilize os botões abaixo para a ação desejada.')
            .addFields(
                { name: '🚨 Abrir Denúncia', value: 'Denuncie um jogador ou comportamento que quebra as regras do servidor. Um tópico privado será criado para você e a moderação.', inline: false },
                { name: '🎫 Abrir Ticket', value: 'Precisa de ajuda com o bot, tem uma dúvida geral ou quer falar com a staff? Abra um ticket.', inline: false },
                { name: '📝 Candidatar-se', value: 'Quer ajudar a comunidade? Candidate-se para uma de nossas equipes de suporte.', inline: false }
            )
            .setFooter({ text: 'As suas interações aqui são confidenciais.' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId(SUPPORT_BUTTON_IDS.REPORT).setLabel('Abrir Denúncia').setStyle(ButtonStyle.Danger).setEmoji('🚨'),
                new ButtonBuilder().setCustomId(SUPPORT_BUTTON_IDS.TICKET).setLabel('Abrir Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫'),
                new ButtonBuilder().setCustomId(SUPPORT_BUTTON_IDS.APPLY).setLabel('Candidatar-se').setStyle(ButtonStyle.Success).setEmoji('📝')
            );

        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed],
            components: [row],
        };

        let sentMessage;
        if (messageId) {
            try {
                sentMessage = await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                logger.warn(`[supportPanel] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                sentMessage = await webhookClient.send(payload);
                await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
            }
        } else {
            sentMessage = await webhookClient.send(payload);
            await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de suporte:', error);
    }
}
