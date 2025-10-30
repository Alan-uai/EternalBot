// src/index.js
import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Collection } from 'discord.js';

import { loadConfig } from './config/loader.js';
import { createLogger } from './utils/logger.js';
import { loadCommands } from './loaders/commandLoader.js';
import { loadEvents } from './loaders/eventLoader.js';
import { loadInteractions } from './loaders/interactionLoader.js';
import { loadJobs } from './loaders/jobLoader.js';
import { loadServices } from './loaders/serviceLoader.js';
import { getOrCreateWebhook as getOrCreateWebhookUtil } from './utils/webhookManager.js';

async function start() {
    const logger = createLogger();

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
    
    // Anexa utilitários ao cliente para fácil acesso onde o container não está disponível
    client.container = container;
    client.getOrCreateWebhook = (channel, name, avatar) => getOrCreateWebhookUtil(channel, name, avatar, logger);


    try {
        logger.info('Inicializando serviços...');
        await loadServices(container);

        logger.info('Carregando comandos de barra...');
        await loadCommands(container);

        logger.info('Carregando manipuladores de interação...');
        loadInteractions(container);
        
        logger.info('Carregando eventos do cliente...');
        loadEvents(container);
        
        logger.info('Iniciando tarefas agendadas (jobs)...');
        loadJobs(container);

        await client.login(config.DISCORD_TOKEN);

    } catch (err) {
        logger.error('Erro fatal durante a inicialização:', err);
        process.exit(1);
    }
}

// Inicializa o bot
start();

// Mini Web Server para manter o bot vivo em plataformas como Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
}).listen(port, () => {
  console.log(`Servidor web de health check ouvindo na porta ${port}`);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
