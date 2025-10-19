// src/bot.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { initializeFirebase } from './firebase/index.js';
import { loadKnowledgeBase } from './knowledge-base.js';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Carregar a base de conhecimento (artigos da wiki)
const wikiContext = loadKnowledgeBase();
client.wikiContext = wikiContext;

// Carregar comandos
client.commands = new Collection();
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    // Use dynamic import with file:// protocol for ES Modules
    const command = await import(`file://${filePath}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} não possui a propriedade "data" ou "execute".`
      );
    }
  }
}

// Registrar os comandos na API do Discord
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Iniciada a atualização de ${commands.length} comandos de aplicação (/).`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`Recarregados com sucesso ${data.length} comandos de aplicação (/).`);
  } catch (error) {
    console.error(error);
  }
})();


// Evento de interação para executar comandos
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
    return;
  }

  try {
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
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Pronto! Logado como ${readyClient.user.tag}`);
  // Inicializar o Firebase
  initializeFirebase();
  console.log('Firebase inicializado.');
});

// Login
client.login(process.env.DISCORD_TOKEN);
