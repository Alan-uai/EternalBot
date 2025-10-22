// src/bot.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { initializeFirebase } from './firebase/index.js';
import { loadKnowledgeBase } from './knowledge-base.js';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { lobbyDungeonsArticle } from './data/wiki-articles/lobby-dungeons.js';
import { generateSolution } from './ai/flows/generate-solution.js';
import axios from 'axios';

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
    // Skip the chat command as it's being handled by mentions
    if (path.basename(filePath) === 'chat.js') continue;
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
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

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
        const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';

        // Check for 5-minute warning
        if (currentMinute === (raidMinute - 5 + 60) % 60) {
            if (!notifiedRaids.has(`${raidIdentifier}-warning`)) {
                const channel = await client.channels.fetch(RAID_CHANNEL_ID);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor(0xFFD700) // Gold
                        .setTitle(`🚨 Alerta de Raid: ${raid['Dificuldade']} começa em 5 minutos!`)
                        .setDescription(`Preparem-se para a batalha! A dungeon do lobby está prestes a abrir.`)
                        .addFields(
                            { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                            { name: 'Horário', value: `Começa às HH:${raidMinute.toString().padStart(2, '0')}`, inline: true },
                            { name: 'Entrar no Jogo', value: `[Clique aqui para jogar](${GAME_LINK})` }
                        )
                        .setTimestamp();
                    
                    const sentMessage = await channel.send({ content: roleMention, embeds: [embed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), TEN_MINUTES_IN_MS);
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

                    const sentMessage = await channel.send({ content: roleMention, embeds: [embed] });
                    setTimeout(() => sentMessage.delete().catch(console.error), TEN_MINUTES_IN_MS);
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


// Evento para responder a menções
client.on(Events.MessageCreate, async (message) => {
    const CHAT_CHANNEL_ID = '1429309293076680744';

    if (message.channel.id !== CHAT_CHANNEL_ID || message.author.bot || !message.mentions.has(client.user.id) || message.mentions.everyone) {
        return;
    }

    const question = message.content.replace(/<@!?(\d+)>/g, '').trim();
    const imageAttachment = message.attachments.find(att => att.contentType?.startsWith('image/'));

    if (!question && !imageAttachment) {
        await message.reply('Olá! Meu nome é Gui. Em que posso ajudar sobre o Anime Eternal?');
        return;
    }

    await message.channel.sendTyping();
    
    let imageDataUri = null;
    if (imageAttachment) {
        try {
            const response = await axios.get(imageAttachment.url, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            imageDataUri = `data:${imageAttachment.contentType};base64,${base64}`;
        } catch (error) {
            console.error("Erro ao processar a imagem anexada:", error);
            // Continua sem a imagem se o download falhar
        }
    }


    const history = [];
    let currentMessage = message;
    const historyLimit = 10; // Limite de 5 trocas (5 user, 5 assistant)

    try {
        // Loop para construir o histórico da conversa, subindo pelas respostas.
        while (currentMessage.reference && history.length < historyLimit) {
            const repliedToMessage = await message.channel.messages.fetch(currentMessage.reference.messageId);
            
            const role = repliedToMessage.author.id === client.user.id ? 'assistant' : 'user';
            const content = repliedToMessage.content.replace(/<@!?(\d+)>/g, '').trim();
            
            // Adiciona a mensagem anterior no início do array de histórico
            history.unshift({ role, content });
            
            currentMessage = repliedToMessage; // Move para a próxima mensagem na cadeia de respostas
        }
    } catch (error) {
        console.warn("Não foi possível buscar o histórico completo da conversa:", error);
    }


    try {
        const result = await generateSolution({
            problemDescription: question,
            imageDataUri: imageDataUri,
            wikiContext: client.wikiContext,
            history: history.length > 0 ? history : undefined,
        });

        if (result && result.structuredResponse) {
            const parsedResponse = JSON.parse(result.structuredResponse);
            
            let replyContent = '';
            parsedResponse.forEach((section) => {
                replyContent += `**${section.titulo}**\n${section.conteudo}\n\n`;
            });
            
            if (replyContent.length > 2000) {
                replyContent = replyContent.substring(0, 1997) + '...';
            }

            const feedbackRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`feedback_like_${message.id}`)
                        .setLabel('👍')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`feedback_dislike_${message.author.id}_${message.id}`)
                        .setLabel('👎')
                        .setStyle(ButtonStyle.Danger)
                );

            const replyMessage = await message.reply({ content: replyContent, components: [feedbackRow] });

            client.interactions.set(`question_${message.id}`, question);
            client.interactions.set(`answer_${message.id}`, replyContent);
            client.interactions.set(`history_${message.id}`, history); // Armazena o histórico para re-geração
            client.interactions.set(`replyMessageId_${message.id}`, replyMessage.id);

        } else {
            await message.reply('Desculpe, não consegui obter uma resposta. Meu sistema pode estar sobrecarregado. Tente novamente em alguns instantes.');
        }
    } catch (error) {
        console.error('Erro ao chamar o fluxo generateSolution via menção:', error);
        await message.reply('Ocorreu um erro ao processar sua pergunta. A equipe já foi notificada.');
    }
});


// Evento de interação para executar comandos e interações
client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }

        try {
            // A maioria dos comandos terá um 'execute'
            if (command.execute) {
              await command.execute(interaction, { client });
            }
            // Comandos com lógica de interação mais complexa (botões, modais) usam 'handleInteraction'
            // O próprio comando `updlog` chama seu handleInteraction, então não precisamos chamar aqui.
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

    if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
        const customIdParts = interaction.customId.split('_');
        const commandName = customIdParts[0]; 
        
        const interactionHandler = client.interactions.get(commandName);

        if (interactionHandler) {
            try {
                await interactionHandler(interaction, { client });
            } catch (error) {
                console.error(`Erro ao lidar com interação para ${commandName}:`, error);
                 if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                }
            }
        } else if (interaction.isButton() && interaction.customId.startsWith('feedback_')) {
             await handleFeedbackButton(interaction);
        } else if (interaction.isButton() && interaction.customId.startsWith('mod_')) {
             await handleModButton(interaction);
        }
    }
});


async function handleFeedbackButton(interaction) {
    const [,, userId, originalMessageId] = interaction.customId.split('_');

    if (interaction.customId.startsWith('feedback_dislike')) {
        await interaction.deferUpdate();
        
        const originalQuestion = client.interactions.get(`question_${originalMessageId}`);
        const badResponse = client.interactions.get(`answer_${originalMessageId}`);
        const replyMessageId = client.interactions.get(`replyMessageId_${originalMessageId}`);
        const conversationHistory = client.interactions.get(`history_${originalMessageId}`);
        
        const MOD_CHANNEL_ID = '1429314152928641118';
        const modChannel = await client.channels.fetch(MOD_CHANNEL_ID);

        if (modChannel && originalQuestion && badResponse) {
            const feedbackEmbed = new EmbedBuilder()
                .setColor(0xFF4B4B)
                .setTitle('👎 Novo Feedback Negativo')
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: 'Usuário', value: `<@${interaction.user.id}>` },
                    { name: 'Pergunta Original', value: `\`\`\`${originalQuestion}\`\`\`` },
                    { name: 'Resposta Negativa', value: `\`\`\`${badResponse.substring(0, 1020)}...\`\`\`` }
                )
                .setTimestamp();
            
            const modActionsRow = new ActionRowBuilder()
                .addComponents(
                     new ButtonBuilder()
                        .setCustomId(`mod_seen_${userId}`)
                        .setLabel('Visto')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`mod_solving_${userId}`)
                        .setLabel('Visto e Resolvendo')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`mod_solved_${userId}`)
                        .setLabel('Resolvido')
                        .setStyle(ButtonStyle.Success)
                );

            await modChannel.send({ embeds: [feedbackEmbed], components: [modActionsRow] });
        }

        try {
            const newResult = await generateSolution({
                problemDescription: originalQuestion,
                wikiContext: client.wikiContext,
                history: conversationHistory, // Usa o histórico armazenado
            });
            
            if (newResult && newResult.structuredResponse) {
                const newParsedResponse = JSON.parse(newResult.structuredResponse);
                let newReplyContent = '🔄 **Resposta regenerada:**\n\n';
                newParsedResponse.forEach((section) => {
                    newReplyContent += `**${section.titulo}**\n${section.conteudo}\n\n`;
                });

                if (newReplyContent.length > 2000) {
                    newReplyContent = newReplyContent.substring(0, 1997) + '...';
                }

                const originalChannel = await client.channels.fetch(interaction.channelId);
                const replyMessage = await originalChannel.messages.fetch(replyMessageId);

                if(replyMessage) {
                    await replyMessage.edit({ content: newReplyContent });
                    client.interactions.set(`answer_${originalMessageId}`, newReplyContent);
                }
            }

        } catch (error) {
             console.error('Erro ao regenerar resposta:', error);
        }

    } else if (interaction.customId.startsWith('feedback_like')) {
        await interaction.reply({ content: 'Obrigado pelo seu feedback positivo!', ephemeral: true });
    }
}

async function handleModButton(interaction) {
    const [_, status, userId] = interaction.customId.split('_');
    const user = await client.users.fetch(userId);
    if (!user) {
        return interaction.reply({ content: 'Não foi possível encontrar o usuário original.', ephemeral: true });
    }

    const guild = interaction.guild;
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const userChannel = guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
         return interaction.reply({ content: `O canal de perfil para ${user.tag} não foi encontrado. Use /atualizar-perfil para criar.`, ephemeral: true });
    }
    
    const existingThreads = await userChannel.threads.fetch();
    let notificationThread = existingThreads.threads.find(t => t.name === 'notificações');

    if (!notificationThread) {
         notificationThread = await userChannel.threads.create({
            name: 'notificações',
            autoArchiveDuration: 10080,
            reason: `Tópico de notificações para ${user.tag}`
        });
    }
    
    let message;
    switch(status) {
        case 'seen':
            message = 'Seu feedback foi visto por um moderador, obrigado!';
            break;
        case 'solving':
             message = 'Seu feedback foi visto por um moderador e está em desenvolvimento, obrigado!';
            break;
        case 'solved':
             message = 'Seu feedback resolveu um problema, obrigado!';
            break;
        default:
            return;
    }

    await notificationThread.send(`<@${userId}>, ${message}`);
    await interaction.reply({ content: `Notificação de status '${status}' enviada para ${user.tag}.`, ephemeral: true });
    
    const originalMessage = interaction.message;
    const disabledRow = new ActionRowBuilder();
    originalMessage.components[0].components.forEach(component => {
        disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
    });
    await originalMessage.edit({ components: [disabledRow] });
}


const ALL_RAIDS_ROLE_ID = '1429360300594958397';
const RAID_NOTIFICATION_ROLES = [
    '1429357175373041786', // Easy
    '1429357351906967562', // Medium
    '1429357358303150200', // Hard
    '1429357528168271894', // Insane
    '1429357529044877312', // Crazy
    '1429357530106298428'  // Leaf
];

// Evento para gerenciar cargos
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    // --- Lógica para Cargo de Verificado (Bloxlink) ---
    const verifiedRoleId = '1429278854874140734';
    const hadVerifiedRole = oldMember.roles.cache.has(verifiedRoleId);
    const hasVerifiedRole = newMember.roles.cache.has(verifiedRoleId);

    if (!hadVerifiedRole && hasVerifiedRole) {
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

    // --- Lógica para Cargo "ALL" de Raids ---
    const hadAllRaidsRole = oldMember.roles.cache.has(ALL_RAIDS_ROLE_ID);
    const hasAllRaidsRole = newMember.roles.cache.has(ALL_RAIDS_ROLE_ID);

    if (!hadAllRaidsRole && hasAllRaidsRole) {
        console.log(`Usuário ${newMember.user.tag} recebeu o cargo ALL. Verificando e adicionando cargos de raid...`);
        const rolesToAdd = [];
        for (const roleId of RAID_NOTIFICATION_ROLES) {
            if (!newMember.roles.cache.has(roleId)) {
                rolesToAdd.push(roleId);
            }
        }

        if (rolesToAdd.length > 0) {
            try {
                await newMember.roles.add(rolesToAdd, 'Atribuição automática pelo cargo ALL Raids');
                console.log(`Adicionados ${rolesToAdd.length} cargos de raid para ${newMember.user.tag}.`);
            } catch (error) {
                console.error(`Falha ao adicionar cargos de raid para ${newMember.user.tag}:`, error);
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
