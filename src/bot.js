// src/bot.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes, EmbedBuilder } from 'discord.js';
import { initializeFirebase } from './firebase/index.js';
import { loadKnowledgeBase } from './knowledge-base.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { lobbyDungeonsArticle } from './data/wiki-articles/lobby-dungeons.js';

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

// Carregar comandos e manipuladores de interação
client.commands = new Collection();
client.interactions = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    
    // Configurar comandos de barra
    if ('data' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[AVISO] O comando em ${filePath} não possui a propriedade "data".`
      );
    }

    // Configurar manipuladores de interação (para botões, menus, modais)
    if('handleInteraction' in command) {
        // Usamos o nome do comando como chave para o manipulador
        client.interactions.set(command.data.name, command.handleInteraction);
    }
  }
}

// --- Raid Alert Scheduler ---
const RAID_CHANNEL_ID = '1429260587648417964';
const GAME_LINK = 'https://www.roblox.com/games/90462358603255/15-Min-Anime-Eternal';
const notifiedRaids = new Set();

function checkRaidTimes() {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();

    // Reset notified raids at the beginning of each hour
    if (currentMinute === 0) {
        notifiedRaids.clear();
    }
    
    const raidSchedule = lobbyDungeonsArticle.tables.lobbySchedule.rows;

    raidSchedule.forEach(async (raid) => {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidIdentifier = `${currentHour}:${raidMinute}`;

        // Check for 5-minute warning
        if (currentMinute === (raidMinute - 5 + 60) % 60) {
            if (!notifiedRaids.has(`${raidIdentifier}-warning`)) {
                const channel = await client.channels.fetch(RAID_CHANNEL_ID);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFFD700) // Gold
                        .setTitle(`🚨 Alerta de Raid: ${raid['Dificuldade']} começa em 5 minutos!`)
                        .setDescription(`Prepare-se para a batalha! A dungeon do lobby está prestes a abrir.`)
                        .addFields(
                            { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                            { name: 'Horário', value: `Começa às HH:${raidMinute.toString().padStart(2, '0')}`, inline: true },
                            { name: 'Entrar no Jogo', value: `[Clique aqui para jogar](${GAME_LINK})` }
                        )
                        .setTimestamp();
                    
                    await channel.send({ embeds: [embed] });
                    notifiedRaids.add(`${raidIdentifier}-warning`);
                }
            }
        }

        // Check for raid start
        if (currentMinute === raidMinute) {
             if (!notifiedRaids.has(`${raidIdentifier}-start`)) {
                const channel = await client.channels.fetch(RAID_CHANNEL_ID);
                 if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFF4B4B) // Red
                        .setTitle(`🔥 A Raid Começou: ${raid['Dificuldade']}!`)
                        .setDescription(`O portal está aberto! Entre agora para não perder.`)
                        .addFields(
                            { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                            { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true },
                            { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true },
                            { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${GAME_LINK})**` }
                        )
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                    notifiedRaids.add(`${raidIdentifier}-start`);
                }
            }
        }
    });
}
// ------------------------

// Evento de Ready
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Pronto! Logado como ${readyClient.user.tag}`);
  
  // Registrar/Atualizar os comandos na API do Discord
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  const commands = Array.from(client.commands.values()).map(c => c.data.toJSON ? c.data.toJSON() : c.data);

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

  // Iniciar o agendador de raids
  console.log('Agendador de alertas de raid iniciado.');
  setInterval(checkRaidTimes, 60000); // Executa a cada 60 segundos
});


// Evento de interação para executar comandos e interações
client.on(Events.InteractionCreate, async (interaction) => {
    // Se for um comando de chat
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }

        try {
            if (command.execute) {
              await command.execute(interaction, { wikiContext: client.wikiContext });
            }
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

    // Se for uma interação de botão, menu ou modal
    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        // O customId será formatado como "commandName_action_data"
        const customIdParts = interaction.customId.split('_');
        const commandName = customIdParts[0]; 
        
        const interactionHandler = client.interactions.get(commandName);

        if (interactionHandler) {
            try {
                await interactionHandler(interaction);
            } catch (error) {
                console.error(`Erro ao lidar com interação para ${commandName}:`, error);
                 if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
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
