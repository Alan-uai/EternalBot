// src/utils/webhookManager.js
import { ChannelType, Collection } from 'discord.js';

export async function getOrCreateWebhook(channel, webhookName, avatarUrl, logger) {
    if (!channel || channel.type !== ChannelType.GuildText) {
        logger.error(`Tentativa de obter webhook em um canal inválido: ${channel?.name || 'canal desconhecido'}`);
        return null;
    }

    try {
        const webhooks = await channel.fetchWebhooks().catch(() => new Collection());
        let webhook = webhooks.find(wh => wh.name === webhookName);

        if (!webhook) {
            logger.info(`Webhook '${webhookName}' não encontrado no canal ${channel.name}. Tentando criar um novo...`);
            webhook = await channel.createWebhook({
                name: webhookName,
                avatar: avatarUrl,
                reason: `Webhook reutilizável para o bot Guia Eterno (${webhookName})`
            });
            logger.info(`Webhook '${webhookName}' criado com sucesso no canal ${channel.name}.`);
        }
        return webhook;
    } catch (error) {
        logger.error(`Erro ao criar ou buscar o webhook '${webhookName}' no canal ${channel.name}:`, error);
        // Common error codes: 50013 (Missing Permissions), 30007 (Maximum number of webhooks reached)
        if(error.code === 30007) {
            logger.error(`O canal ${channel.name} atingiu o número máximo de webhooks (15). Por favor, remova alguns webhooks não utilizados.`);
        }
        return null;
    }
}
