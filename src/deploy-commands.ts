// src/deploy-commands.ts
import { config } from 'dotenv';
config();

import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`);
    }
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log(`Iniciada a atualização de ${commands.length} comandos de aplicação (/).`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commands },
    ) as any;

    console.log(`Recarregados com sucesso ${data.length} comandos de aplicação (/).`);
  } catch (error) {
    console.error(error);
  }
})();
