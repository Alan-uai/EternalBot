// src/events/client/ready.js
import { Events, REST, Routes, WebhookClient, Collection, ChannelType } from 'discord.js';
import { doc, getDocs, collection, query, where, writeBatch, setDoc, getDoc } from 'firebase/firestore';

// Função para garantir que os webhooks necessários existam
async function initializeWebhooks(client) {
    const { logger, config, services } = client.container;
    const { firebase } = services;
    const { firestore, assetService } = firebase;
    logger.info('Inicializando e verificando Webhooks...');

    // Validação do AssetService e CLOUDINARY_URL
    if (!assetService || !assetService.isBaseUrlValid()) {
        logger.error("[WebhookManager] A CLOUDINARY_URL não está configurada ou é inválida! Assets visuais como GIFs não funcionarão.");
    } else {
        logger.info("[WebhookManager] CLOUDINARY_URL validada com sucesso.");
    }

    const requiredWebhooks = [
        { name: 'Anunciador de Raids', channelId: config.RAID_CHANNEL_ID, docId: 'raidAnnouncer' },
        { name: 'Painel de Status das Raids', channelId: config.RAID_CHANNEL_ID, docId: 'raidPanel' },
        { name: 'Update Log', channelId: config.UPDLOG_CHANNEL_ID, docId: 'updlog' },
        { name: 'Códigos Ativos do Jogo', channelId: config.CODES_CHANNEL_ID, docId: 'gameCodes' }
    ];

    for (const webhookConfig of requiredWebhooks) {
        const webhookDocRef = doc(firestore, 'bot_config', webhookConfig.docId);
        
        try {
            const channel = await client.channels.fetch(webhookConfig.channelId);
            if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
                logger.error(`[WebhookManager] Canal com ID ${webhookConfig.channelId} para '${webhookConfig.name}' não é um canal de texto ou anúncio válido.`);
                continue;
            }

            const webhooksInChannel = await channel.fetchWebhooks();
            let webhook = webhooksInChannel.find(wh => wh.name === webhookConfig.name && wh.owner.id === client.user.id);
            
            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: webhookConfig.name,
                    avatar: await assetService.getAsset('BotAvatar'),
                    reason: `Webhook necessário para ${webhookConfig.name}`
                });
                logger.info(`[WebhookManager] Webhook '${webhookConfig.name}' criado no canal #${channel.name}.`);
            }
            
            await setDoc(webhookDocRef, { webhookUrl: webhook.url }, { merge: true });
            logger.info(`[WebhookManager] URL do webhook '${webhookConfig.name}' salva/verificada no Firestore.`);

        } catch (error) {
            logger.error(`[WebhookManager] Falha crítica ao inicializar o webhook '${webhookConfig.name}':`, error);
        }
    }
     logger.info('Gerenciador de Webhooks inicializado com sucesso.');
}

async function cleanupExpiredRaidMessages(client) {
    const { logger, services } = client.container;
    const { firestore } = services.firebase;

    logger.info('Verificando anúncios de raid expirados...');

    const now = new Date();
    const q = query(collection(firestore, 'bot_config/raid_announcements/messages'), where('expiresAt', '<=', now));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            logger.info('Nenhum anúncio de raid expirado encontrado.');
            return;
        }

        const batch = writeBatch(firestore);
        let deletedCount = 0;

        for (const messageDoc of querySnapshot.docs) {
            const { webhookUrl, messageId } = messageDoc.data();

            if (!webhookUrl || !messageId) {
                batch.delete(messageDoc.ref);
                continue;
            }

            try {
                 const webhookClient = new WebhookClient({ url: webhookUrl });
                await webhookClient.deleteMessage(messageId);
                logger.info(`Mensagem de raid expirada (${messageId}) deletada com sucesso.`);
                deletedCount++;
            } catch (error) {
                if (error.code === 10008) { // Unknown Message
                    logger.warn(`Mensagem de raid (${messageId}) não encontrada no Discord. Provavelmente já foi deletada.`);
                } else {
                    logger.error(`Falha ao deletar mensagem de raid expirada (${messageId}):`, error.message);
                }
            } finally {
                batch.delete(messageDoc.ref);
            }
        }

        await batch.commit();
        if (deletedCount > 0) {
            logger.info(`${deletedCount} anúncios de raid expirados foram limpos.`);
        }

    } catch (error) {
        logger.error('Erro crítico durante a limpeza de mensagens de raid:', error);
    }
}


export const name = Events.ClientReady;
export const once = true;

export async function execute(client, container) {
    const { logger, commands, config } = container;
    
    logger.info(`Pronto! Logado como ${client.user.tag}`);

    // Inicializa Webhooks
    await initializeWebhooks(client);

    // Deploy de comandos
    const rest = new REST().setToken(config.DISCORD_TOKEN);
    const commandData = Array.from(commands.values()).map(c => c.data.toJSON ? c.data.toJSON() : c.data);

    try {
        logger.info(`Iniciada a atualização de ${commandData.length} comandos de aplicação (/).`);
        const data = await rest.put(
            Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
            { body: commandData },
        );
        logger.info(`Recarregados com sucesso ${data.length} comandos de aplicação (/).`);
    } catch (error) {
        logger.error('Erro ao registrar comandos de aplicação:', error);
    }

    // Limpeza de mensagens na inicialização
    await cleanupExpiredRaidMessages(client);
}
