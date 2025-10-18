// src/bot.ts
import { config } from 'dotenv';
config();

import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { initializeFirebase } from './firebase';
import { loadKnowledgeBase } from './lib/knowledge-base';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as any;

// Carregar a base de conhecimento (artigos da wiki)
const wikiContext = loadKnowledgeBase();
client.wikiContext = wikiContext;

// Carregar comandos
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: string) => file.endsWith('.ts'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} não possui a propriedade "data" ou "execute".`
      );
    }
  }
}

// Evento de interação para executar comandos
client.on(Events.InteractionCreate, async (interaction: any) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
    return;
  }

  try {
    // Passar o contexto da wiki para o comando
    await command.execute(interaction, { wikiContext: client.wikiContext });
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Ocorreu um erro ao executar este comando!',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Ocorreu um erro ao executar este comando!',
        ephemeral: true,
      });
    }
  }
});

// Evento de Ready
client.once(Events.ClientReady, (readyClient: any) => {
  console.log(`Pronto! Logado como ${readyClient.user.tag}`);
  // Inicializar o Firebase
  initializeFirebase();
  console.log('Firebase inicializado.');
});

// Login
client.login(process.env.DISCORD_TOKEN);
