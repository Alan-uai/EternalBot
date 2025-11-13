// src/jobs/commandPanelManager.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PANEL_DOC_ID = 'commandPanel';
const PERSISTENT_WEBHOOK_NAME = 'Comandos do Bot';

export const name = 'commandPanelManager';
export const schedule = '0 */1 * * *'; // Roda a cada hora para garantir que o painel está lá

export async function run(container) {
    const { client, config, logger, services, commands } = container;
    const { firestore } = services.firebase;

    // Este job só precisa rodar uma vez na inicialização para postar/editar.
    // A lógica de schedule é mais um fallback para garantir que a mensagem exista.
    if (client.alreadyRanCommandPanel) return;

    try {
        const panelChannel = await client.channels.fetch(config.COMMANDS_CHANNEL_ID).catch(() => null);
        if (!panelChannel) {
            logger.error(`[commandPanel] Canal de comandos (${config.COMMANDS_CHANNEL_ID}) não encontrado.`);
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
                reason: 'Webhook para o painel de comandos.'
            });
            webhookUrl = webhook.url;
            await setDoc(panelWebhookDocRef, { webhookUrl }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📜 Lista de Comandos do Guia Eterno')
            .setDescription('Aqui estão todos os comandos disponíveis para você usar.')
            .setTimestamp();
            
        // Interação com a IA
        embed.addFields({ 
            name: '🤖 Interação com a IA', 
            value: 'Mencione o bot em qualquer mensagem para fazer uma pergunta sobre o jogo.\n`@Gui qual o melhor pet do mundo 5?`' 
        });

        // Comandos de Barra
        const commandFields = commands.map(cmd => {
            return { name: `/${cmd.data.name}`, value: cmd.data.description || 'Sem descrição.', inline: true };
        });
        
        if (commandFields.length > 0) {
            embed.addFields({ name: '\u200B', value: '**Comandos de Barra (/)**' }); // Separador
            embed.addFields(commandFields);
        }

        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed],
        };

        let sentMessage;
        if (messageId) {
            try {
                sentMessage = await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                logger.warn(`[commandPanel] Não foi possível editar a mensagem do painel (ID: ${messageId}). Criando uma nova.`);
                sentMessage = await webhookClient.send({ ...payload, wait: true });
                await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
            }
        } else {
            sentMessage = await webhookClient.send({ ...payload, wait: true });
            await setDoc(panelWebhookDocRef, { messageId: sentMessage.id }, { merge: true });
        }

        logger.info('[commandPanel] Painel de comandos postado/atualizado com sucesso.');
        client.alreadyRanCommandPanel = true; // Marca que já rodou nesta sessão

    } catch (error) {
        logger.error('Erro ao atualizar o painel de comandos:', error);
    }
}
