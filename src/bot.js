// src/bot.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { initializeFirebase } from './firebase/index.js';
import { loadKnowledgeBase } from './knowledge-base.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Carregar a base de conhecimento (artigos da wiki)
const wikiContext = loadKnowledgeBase();
client.wikiContext = wikiContext;

// Carregar comandos
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} não possui a propriedade "data" ou "execute".`
      );
    }
  }
}

// Evento de Ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Pronto! Logado como ${readyClient.user.tag}`);
  
  // Registrar/Atualizar os comandos na API do Discord
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = Array.from(client.commands.values()).map(c => c.data.toJSON());

  try {
    console.log(`Iniciada a atualização de ${commands.length} comandos de aplicação (/).`);
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log(`Recarregados com sucesso ${data.length} comandos de aplicação (/).`);
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }

  // Inicializar o Firebase
  initializeFirebase();
  console.log('Firebase inicializado.');
});


// Evento de interação para executar comandos e interações
client.on(Events.InteractionCreate, async (interaction) => {
    // Se for um comando de chat
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }

        try {
            await command.execute(interaction, { wikiContext: client.wikiContext });
        } catch (error) {
            console.error(error);
            const errorMessage = 'Ocorreu um erro ao executar este comando!';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
        return;
    }

    // Se for uma interação de botão ou modal
    if (interaction.isButton() || interaction.isModalSubmit()) {
        // IDs customizados podem ser `iniciar-perfil_abrir` ou `gerenciar_poderes_equipar`
        const commandName = interaction.customId.split('_')[0]; 
        const command = interaction.client.commands.get(commandName);

        if (command && command.handleInteraction) {
            try {
                await command.handleInteraction(interaction);
            } catch (error) {
                console.error(`Erro ao lidar com interação para ${commandName}:`, error);
                 if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                }
            }
        } else {
            // Fallback para o novo sistema de inventário
             const gerenciarCommand = interaction.client.commands.get('gerenciar');
             if(interaction.customId.startsWith('gerenciar_') && gerenciarCommand && gerenciarCommand.handleInteraction) {
                  try {
                        await gerenciarCommand.handleInteraction(interaction);
                    } catch (error) {
                        console.error(`Erro ao lidar com interação de gerenciamento:`, error);
                    }
             }
        }
    }
});


// Evento para criar perfil ao verificar com Bloxlink
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const verifiedRoleId = '1429278854874140734';
    const hadRole = oldMember.roles.cache.has(verifiedRoleId);
    const hasRole = newMember.roles.cache.has(verifiedRoleId);

    // Se o usuário ACABOU de receber o cargo
    if (!hadRole && hasRole) {
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', newMember.id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            try {
                const newUserProfile = {
                    id: newMember.id,
                    username: newMember.user.username,
                    email: null,
                    reputationPoints: 0,
                    credits: 0,
                    createdAt: serverTimestamp(),
                };
                await setDoc(userRef, newUserProfile);
                console.log(`Perfil criado automaticamente para o usuário verificado: ${newMember.user.tag} (${newMember.id})`);
            } catch (error) {
                console.error(`Falha ao criar perfil automático para ${newMember.id}:`, error);
            }
        }
    }
});


// Login
client.login(process.env.DISCORD_TOKEN);


// Mini Web Server para manter o bot vivo
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!\n');
}).listen(port, () => {
  console.log(`Servidor web ouvindo na porta ${port}`);
});
