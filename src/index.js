// src/index.js
import 'dotenv/config';
import http from 'node:http';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

import { loadConfig } from './config/loader.js';
import { createLogger } from './utils/logger.js';
import { loadCommands } from './loaders/commandLoader.js';
import { loadEvents } from './loaders/eventLoader.js';
import { loadInteractions } from './loaders/interactionLoader.js';
import { loadJobs } from './loaders/jobLoader.js';
import { loadServices } from './loaders/serviceLoader.js';
import { initializeWebhooks } from './utils/webhookManager.js';

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

        // Webhooks são inicializados somente após o cliente estar pronto
        await initializeWebhooks(container);

        logger.info('Iniciando tarefas agendadas (jobs)...');
        loadJobs(container);
        
        if (config.NODE_ENV === 'development') {
             logger.info('Modo de desenvolvimento ativado. Observando mudanças nos arquivos...');
             const commandsPath = path.resolve(process.cwd(), 'src/commands');
             const eventsPath = path.resolve(process.cwd(), 'src/events');
             const interactionsPath = path.resolve(process.cwd(), 'src/interactions');

             fs.watch(commandsPath, { recursive: true }, (eventType, filename) => {
                 if (filename && filename.endsWith('.js')) {
                     logger.debug(`Mudança detectada em ${filename}, recarregando comandos...`);
                     loadCommands(container);
                 }
             });
             fs.watch(eventsPath, { recursive: true }, (eventType, filename) => {
                 if (filename && filename.endsWith('.js')) {
                     logger.debug(`Mudança detectada em ${filename}, recarregando eventos...`);
                     loadEvents(container);
                 }
             });
             fs.watch(interactionsPath, { recursive: true }, (eventType, filename) => {
                 if (filename && filename.endsWith('.js')) {
                     logger.debug(`Mudança detectada em ${filename}, recarregando interações...`);
                     loadInteractions(container);
                 }
             });
        }


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
