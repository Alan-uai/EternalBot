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
import { getOrCreateWebhook as getOrCreateWebhookUtil } from './utils/webhookManager.js';

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
    
    // Anexa utilitários ao cliente para fácil acesso onde o container não está disponível
    client.container = container;
    client.getOrCreateWebhook = (channel, name, avatar) => getOrCreateWebhookUtil(channel, name, avatar, logger);

    try {
        logger.info('Inicializando serviços...');
        await loadServices(container);

        logger.info('Carregando comandos de barra...');
        await loadCommands(container);

        logger.info('Carregando manipuladores de interação...');
        await loadInteractions(container);
        
        logger.info('Carregando eventos do cliente...');
        await loadEvents(container);
        
        logger.info('Iniciando tarefas agendadas (jobs)...');
        loadJobs(container);

        await client.login(config.DISCORD_TOKEN);
        
        if (config.NODE_ENV === 'development') {
             logger.info('Modo de desenvolvimento ativado. Observando mudanças nos arquivos...');
             const loadersPath = path.resolve(process.cwd(), 'src/loaders');
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

// Web Server
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Rota para health check
    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running!\n');
        return;
    }
    
    // Rota para redirecionamento do Roblox
    if (pathParts[0] === 'roblox' && pathParts[1]) {
        const userId = encodeURIComponent(pathParts[1]);
        const appDeep = `roblox://users/${userId}/profile`;
        const webUrl = `https://www.roblox.com/users/${userId}/profile`;
        const androidIntent = `intent://users/${userId}/profile#Intent;package=com.roblox.client;scheme=roblox;end`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(200);
        res.end(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Abrir Roblox — ${userId}</title>
  <meta http-equiv="refresh" content="4;url=${webUrl}">
  <style>
    :root{--bg:#071028;--card:#091633;--accent:linear-gradient(90deg,#00c6ff,#0072ff);--text:#e6f7ff}
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
    .card{background:var(--card);padding:22px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.5);width:clamp(300px,70vw,480px);text-align:center;color:var(--text)}
    h1{margin:0 0 6px;font-size:20px}
    p{margin:0 0 14px;opacity:.9}
    a.btn{display:inline-block;padding:10px 14px;border-radius:10px;border:0;font-weight:700;cursor:pointer;text-decoration:none;}
    .primary{background:var(--accent);color:#022}
    a.link{display:block;margin-top:10px;color:#9ad3ff;text-decoration:none}
    small{display:block;margin-top:10px;opacity:.75}
  </style>
</head>
<body>
  <div class="card">
    <h1>Redirecionando para o Roblox…</h1>
    <p id="msg">Tentando abrir o aplicativo Roblox no seu dispositivo.</p>
    <a id="openBtn" class="btn primary" href="${appDeep}">Abrir perfil no app</a>
    <a id="fallbackLink" class="link" href="${webUrl}" target="_blank" rel="noopener">Abrir perfil no navegador</a>
    <small>Se nada acontecer, use um dos links acima.</small>
  </div>
  <script>
    const appDeep = "${appDeep}";
    const androidIntent = "${androidIntent}";
    const ua = navigator.userAgent || navigator.vendor || '';
    const isAndroid = /Android/i.test(ua);
    function attemptOpen() {
      if (isAndroid) {
        window.location = androidIntent;
        setTimeout(() => { window.location = appDeep; }, 400);
      } else {
        window.location = appDeep;
      }
    }
    setTimeout(attemptOpen, 250);
  </script>
</body>
</html>`);
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
