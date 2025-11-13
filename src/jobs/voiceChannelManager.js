// src/jobs/voiceChannelManager.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { customIdPrefix as voiceCustomIdPrefix } from '../interactions/buttons/voice-channel.js';

const PANEL_DOC_ID = 'voiceChannelPanel';
const PERSISTENT_WEBHOOK_NAME = 'Gerenciador de Voz';

// Função para limpar canais órfãos
async function cleanupOrphanChannels(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    const guild = await client.guilds.fetch(config.GUILD_ID).catch(() => null);
    if (!guild) return;

    const channelsRef = collection(firestore, 'temp_voice_channels');
    const snapshot = await getDocs(channelsRef);

    for (const channelDoc of snapshot.docs) {
        const channelId = channelDoc.id;
        const channelData = channelDoc.data();
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        // Se o canal não existe mais no Discord, ou se está vazio há mais de 5 minutos
        if (!channel || (channel.members.size === 0 && (Date.now() - channel.createdAt) > 5 * 60 * 1000)) {
            if (channel) {
                await channel.delete('Limpeza de canal de voz temporário inativo.').catch(e => logger.error(`[VoiceManagerJob] Falha ao deletar canal ${channelId}:`, e));
            }
            await deleteDoc(doc(firestore, 'temp_voice_channels', channelId));
            logger.info(`[VoiceManagerJob] Canal de voz órfão/inativo limpo: ${channelData.channelName} (ID: ${channelId})`);
        }
    }
}


export const name = 'voiceChannelPanelManager';
export const schedule = '0 */1 * * *'; // Roda a cada hora para garantir que o painel está lá

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    try {
        await cleanupOrphanChannels(container);
        
        const panelChannel = await client.channels.fetch(config.VOICE_PANEL_CHANNEL_ID).catch(() => null);
        if (!panelChannel) {
            logger.error(`[voicePanel] Canal do painel de voz (${config.VOICE_PANEL_CHANNEL_ID}) não encontrado.`);
            return;
        }

        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        if (!webhookUrl) {
             const webhook = await panelChannel.createWebhook({
                name: PERSISTENT_WEBHOOK_NAME,
                avatar: client.user.displayAvatarURL(),
                reason: 'Webhook para o painel de gerenciamento de voz.'
            });
            webhookUrl = webhook.url;
            await setDoc(panelWebhookDocRef, { webhookUrl }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const embed = new EmbedBuilder()
            .setColor(0x99AAB5)
            .setTitle('🔊 Gerenciador de Canais de Voz Temporários')
            .setDescription('Crie e gerencie seus próprios canais de voz para você e seus amigos.')
            .addFields(
                { name: '🎙️ Criar Canal', value: 'Cria um novo canal de voz onde você é o administrador.', inline: false },
                { name: '⚙️ Meus Canais', value: 'Gerencie os canais que você criou (renomear, convidar, excluir).', inline: false }
            )
            .setFooter({ text: 'Canais vazios são excluídos automaticamente após um tempo.' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId(`${voiceCustomIdPrefix}_create`).setLabel('Criar Canal').setStyle(ButtonStyle.Success).setEmoji('🎙️'),
                new ButtonBuilder().setCustomId(`${voiceCustomIdPrefix}_manage`).setLabel('Meus Canais').setStyle(ButtonStyle.Primary).setEmoji('⚙️')
            );

        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed],
            components: [row],
        };

        if (messageId) {
            try {
                await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                logger.warn(`[voicePanel] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                const newMessage = await webhookClient.send({ ...payload, wait: true });
                await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
            }
        } else {
            const newMessage = await webhookClient.send({ ...payload, wait: true });
            await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de gerenciamento de voz:', error);
    }
}
