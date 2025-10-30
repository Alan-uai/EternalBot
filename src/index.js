// src/index.js
import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Collection, ChannelType } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

import { loadConfig } from './config/loader.js';
import { createLogger } from './utils/logger.js';
import { loadCommands } from './loaders/commandLoader.js';
import { loadEvents } from './loaders/eventLoader.js';
import { loadInteractions } from './loaders/interactionLoader.js';
import { loadJobs } from './loaders/jobLoader.js';
import { loadServices } from './loaders/serviceLoader.js';
// A inicialização de webhooks agora é feita sob demanda, não mais centralizada na inicialização.

async function start() {
    const logger = createLogger(process.env.NODE_ENV === 'development' ? 'debug' : 'info');

    // Carregar configuração
    const config = loadConfig(logger);
    if (!config) {
        logger.error('Falha ao carregar a configuração. Encerrando.');
        process.exit(1);
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
    });

    // Container de Injeção de Dependência (DI) simplificado
    const container = {
        client,
        config,
        logger,
        commands: new Collection(),
        interactions: new Collection(),
        services: {},
        jobs: [],
    };
    
    // Anexa o container ao cliente para fácil acesso
    client.container = container;

    /**
     * Função getOrCreateWebhook agora centralizada no cliente.
     * Busca ou cria um webhook para um canal específico.
     * @param {TextChannel} channel - O objeto do canal de texto.
     * @param {string} webhookName - O nome desejado para o webhook.
     * @param {string} avatarURL - A URL do avatar para o webhook.
     * @returns {Promise<WebhookClient|null>}
     */
    client.getOrCreateWebhook = async (channel, webhookName, avatarURL) => {
        if (!channel || channel.type !== ChannelType.GuildText) {
             logger.error(`Tentativa de obter webhook em um canal inválido: ${channel?.name || 'desconhecido'}`);
             return null;
        }
        try {
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name === webhookName && wh.owner.id === client.user.id);

            if (!webhook) {
                webhook = await channel.createWebhook({
                    name: webhookName,
                    avatar: avatarURL,
                    reason: `Webhook necessário para ${webhookName}`,
                });
                logger.info(`Webhook '${webhookName}' criado no canal #${channel.name}.`);
            }
            return webhook;
        } catch (error) {
            logger.error(`Não foi possível criar ou obter o webhook '${webhookName}' no canal #${channel.name}:`, error);
            return null;
        }
    };
    
    try {
        logger.info('Inicializando serviços...');
        await loadServices(container);

        logger.info('Carregando comandos de barra...');
        await loadCommands(container);

        logger.info('Carregando manipuladores de interação...');
        await loadInteractions(container);
        
        logger.info('Carregando eventos do cliente...');
        await loadEvents(container);
        
        await client.login(config.DISCORD_TOKEN);

        logger.info('Iniciando tarefas agendadas (jobs)...');
        loadJobs(container);
        
    } catch (err) {
        logger.error('Erro fatal durante a inicialização:', err);
        process.exit(1);
    }
}

// Inicializa o bot
start();

// Web Server para Health Check
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    // Rota para health check
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running!\n');
        return;
    }
    
    // Rota 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found\n');

}).listen(port, () => {
  console.log(`Servidor web de health check ouvindo na porta ${port}`);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
