// src/events/client/ready.js
import { Events, REST, Routes, WebhookClient, Collection } from 'discord.js';
import { doc, getDocs, collection, query, where, writeBatch } from 'firebase/firestore';

async function cleanupExpiredRaidMessages(client) {
    const { logger, config, services } = client.container;
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

        const webhooksCache = new Map();
        const batch = writeBatch(firestore);
        let deletedCount = 0;

        for (const messageDoc of querySnapshot.docs) {
            const { webhookUrl, messageId } = messageDoc.data();

            // Pula se a entrada não tiver os dados necessários, apenas limpa do DB
            if (!webhookUrl || !messageId) {
                batch.delete(messageDoc.ref);
                continue;
            }

            if (!webhooksCache.has(webhookUrl)) {
                webhooksCache.set(webhookUrl, new WebhookClient({ url: webhookUrl }));
            }
            const webhookClient = webhooksCache.get(webhookUrl);

            try {
                await webhookClient.deleteMessage(messageId);
                logger.info(`Mensagem de raid expirada (${messageId}) deletada com sucesso.`);
                deletedCount++;
            } catch (error) {
                // Se a mensagem não existe mais no Discord (código 10008), apenas removemos do Firestore.
                if (error.code === 10008) {
                    logger.warn(`Mensagem de raid (${messageId}) não encontrada no Discord. Provavelmente já foi deletada.`);
                } else {
                    logger.error(`Falha ao deletar mensagem de raid expirada (${messageId}):`, error.message);
                }
            } finally {
                // Sempre remove da DB após a tentativa para não tentar novamente
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

export async function execute(client) {
    const { logger, commands, config } = client.container;
    
    logger.info(`Pronto! Logado como ${client.user.tag}`);

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
