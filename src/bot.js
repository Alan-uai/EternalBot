// src/bot.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Client, Collection, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, StringSelectMenuBuilder } from 'discord.js';
import { initializeFirebase } from './firebase/index.js';
import { loadKnowledgeBase } from './knowledge-base.js';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { lobbyDungeonsArticle } from './data/wiki-articles/lobby-dungeons.js';
import { generateSolution } from './ai/flows/generate-solution.js';
import { updateKnowledgeBase } from './ai/flows/update-knowledge-base.js';
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
    const MOD_CURATION_CHANNEL_ID = '1426968477482225716';
    const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';

    if (message.author.bot) return;

    // Se a mensagem for um reply a uma pergunta do Gui no canal de ajuda
    if (message.channel.id === COMMUNITY_HELP_CHANNEL_ID && message.reference) {
        try {
            const repliedToMessage = await message.channel.messages.fetch(message.reference.messageId);
            const originalCurationMessageId = client.interactions.get(`curation_id_for_help_${repliedToMessage.id}`);
            
            if (repliedToMessage.author.id === client.user.id && originalCurationMessageId) {
                const modChannel = await client.channels.fetch(MOD_CURATION_CHANNEL_ID);
                const questionMessageInModChannel = await modChannel.messages.fetch(originalCurationMessageId);

                if (questionMessageInModChannel) {
                    // Armazena múltiplas respostas sugeridas
                    let suggestedAnswers = client.interactions.get(`suggested_answers_${originalCurationMessageId}`) || [];
                    suggestedAnswers.push({
                        user: message.author.username,
                        userId: message.author.id,
                        content: message.content,
                        approved: false // Novo estado
                    });
                    client.interactions.set(`suggested_answers_${originalCurationMessageId}`, suggestedAnswers);

                    // Cria ou atualiza o menu de seleção
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId(`curate_select_${originalCurationMessageId}`)
                        .setPlaceholder('Analisar uma resposta sugerida...')
                        .addOptions(suggestedAnswers.map((answer, index) => ({
                            label: `Resposta de: ${answer.user}`,
                            description: answer.content.substring(0, 50) + '...',
                            value: `answer_${index}`
                        })));
                    
                    const menuRow = new ActionRowBuilder().addComponents(selectMenu);
                    
                    const originalEmbed = questionMessageInModChannel.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                         .setColor(0xFFA500) // Laranja para "respostas pendentes"
                         .setFooter({ text: `${suggestedAnswers.length} resposta(s) da comunidade aguardando análise.`});

                    // Adiciona o botão de "Corrigido" se for a primeira resposta
                    const components = questionMessageInModChannel.components.length > 1 
                        ? [menuRow, questionMessageInModChannel.components[1]] 
                        : [menuRow, questionMessageInModChannel.components[0]]; // Mantém o botão 'Corrigido'
                    
                    await questionMessageInModChannel.edit({ embeds: [updatedEmbed], components: components });
                    await message.react('👍'); // React to the helpful message
                }
            }
        } catch (error) {
            console.error("Erro ao processar resposta da comunidade:", error);
        }
        return; 
    }
    
    // Continuar apenas se for no canal de chat e mencionar o bot
    if (message.channel.id !== CHAT_CHANNEL_ID || !message.mentions.has(client.user.id) || message.mentions.everyone) {
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
        }
    }

    const history = [];
    let currentMessage = message;
    const historyLimit = 10;

    try {
        while (currentMessage.reference && history.length < historyLimit) {
            const repliedToMessage = await message.channel.messages.fetch(currentMessage.reference.messageId);
            const role = repliedToMessage.author.id === client.user.id ? 'assistant' : 'user';
            const content = repliedToMessage.content.replace(/<@!?(\d+)>/g, '').trim();
            history.unshift({ role, content });
            currentMessage = repliedToMessage;
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
        
        const parsedResponse = JSON.parse(result.structuredResponse);
        const firstSection = parsedResponse[0];

        // Se a IA não encontrou uma resposta
        if (firstSection.titulo === 'Resposta não encontrada') {
            const unansweredQuestionEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❓ Pergunta Sem Resposta')
                .setDescription(`**Usuário:** <@${message.author.id}>\n**Pergunta:**\n\`\`\`${question}\`\`\``)
                .setTimestamp();
            
            if (imageAttachment) {
                unansweredQuestionEmbed.setImage(imageAttachment.url);
            }
             
            // Enviar para o canal de ajuda da comunidade
            const helpChannel = await client.channels.fetch(COMMUNITY_HELP_CHANNEL_ID);
            const helpMessage = await helpChannel.send({
                content: `Alguém consegue responder a esta pergunta de <@${message.author.id}>?\n> ${question}`,
                files: imageAttachment ? [imageAttachment.url] : []
            });

            // Enviar para o canal de curadoria dos moderadores
            const modChannel = await client.channels.fetch(MOD_CURATION_CHANNEL_ID);
             const curationActions = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`curate_fixed_${helpMessage.id}`) // Link com o ID da mensagem de ajuda
                        .setLabel('Corrigido')
                        .setStyle(ButtonStyle.Secondary)
                );
            const curationMessage = await modChannel.send({
                embeds: [unansweredQuestionEmbed],
                components: [curationActions]
            });

            // Linkar as mensagens para futuras interações
            client.interactions.set(`curation_id_for_help_${helpMessage.id}`, curationMessage.id);

            // Responder ao usuário
            await message.reply(firstSection.conteudo);

        } else { // Se a IA encontrou uma resposta
            let replyContent = '';
            parsedResponse.forEach((section) => {
                replyContent += `**${section.titulo}**\n${section.conteudo}\n\n`;
            });
            
            if (replyContent.length > 2000) {
                replyContent = replyContent.substring(0, 1997) + '...';
            }

            const feedbackRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`feedback_like_${message.id}`).setLabel('👍').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`feedback_dislike_${message.author.id}_${message.id}`).setLabel('👎').setStyle(ButtonStyle.Danger)
                );

            const replyMessage = await message.reply({ content: replyContent, components: [feedbackRow] });

            client.interactions.set(`question_${message.id}`, question);
            client.interactions.set(`answer_${message.id}`, replyContent);
            client.interactions.set(`history_${message.id}`, history);
            client.interactions.set(`replyMessageId_${message.id}`, replyMessage.id);
        }
    } catch (error) {
        console.error('Erro ao chamar o fluxo generateSolution via menção:', error);
        await message.reply('Ocorreu um erro ao processar sua pergunta. A equipe já foi notificada.');
    }
});


// Evento de interação para executar comandos e interações
client.on(Events.InteractionCreate, async (interaction) => {
    const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
    const MOD_CURATION_CHANNEL_ID = '1426968477482225716';

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
            return;
        }

        try {
            if (command.execute) {
              await command.execute(interaction, { client });
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
        } else if (interaction.customId.startsWith('curate_')) {
            const [_, action, ...idParts] = customIdParts;
            const id = idParts.join('_');
            
            if (action !== 'approve' && action !== 'reject') {
                await interaction.deferUpdate();
            }

            if (action === 'fixed') {
                const helpMessageId = id;
                const curationMessage = interaction.message;
                const curationMessageId = curationMessage.id;
                const helpChannel = await client.channels.fetch(COMMUNITY_HELP_CHANNEL_ID);

                // Recupera as respostas aprovadas antes de limpar
                const suggestedAnswers = client.interactions.get(`suggested_answers_${curationMessageId}`) || [];
                const approvedAnswers = suggestedAnswers.filter(a => a.approved);

                if (approvedAnswers.length > 0) {
                     await interaction.followUp({ content: 'Compilando respostas aprovadas para atualizar a base de conhecimento...', ephemeral: true });
                     const originalQuestion = curationMessage.embeds[0].description.split('```')[1];
                     
                     try {
                        console.log(`Chamando a IA para processar ${approvedAnswers.length} respostas aprovadas.`);
                        const knowledgeUpdate = await updateKnowledgeBase({
                            question: originalQuestion,
                            approvedAnswers: approvedAnswers.map(a => a.content),
                            currentKnowledgeBase: client.wikiContext,
                        });
                        console.log("IA gerou a seguinte atualização:", knowledgeUpdate);
                        // Ação futura: Salvar o `knowledgeUpdate.fileContent` em `knowledgeUpdate.filePath`
                        await interaction.followUp({ content: `A IA processou as respostas!\n**Ação Sugerida:** Salvar conteúdo no arquivo \`${knowledgeUpdate.filePath}\`.`, ephemeral: true });

                     } catch (e) {
                         console.error("Erro ao chamar o fluxo de updateKnowledgeBase:", e);
                         await interaction.followUp({ content: 'Ocorreu um erro ao tentar ensinar a IA.', ephemeral: true });
                     }

                }
                
                try {
                    const helpMessage = await helpChannel.messages.fetch(helpMessageId);
                    await helpMessage.delete().catch(err => console.error("Falha ao deletar msg de ajuda:", err));
                } catch(error) {
                    console.error("Não foi possível encontrar/deletar a mensagem no canal de ajuda:", error.message);
                }

                await interaction.followUp({ content: 'Ação registrada. A mensagem de curadoria será excluída em 5 segundos.', ephemeral: true });
                setTimeout(async () => {
                    await curationMessage.delete().catch(err => console.error("Falha ao deletar msg de curadoria:", err));
                }, 5000);

                 // Limpar dados da memória
                client.interactions.delete(`curation_id_for_help_${helpMessageId}`);
                client.interactions.delete(`suggested_answers_${curationMessageId}`);


            } else if (action === 'approve') {
                await interaction.deferUpdate();
                const [curationMessageId, answerIndexStr] = id.split('-');
                const answerIndex = parseInt(answerIndexStr, 10);
                let suggestedAnswers = client.interactions.get(`suggested_answers_${curationMessageId}`) || [];
                
                if (suggestedAnswers[answerIndex]) {
                    suggestedAnswers[answerIndex].approved = true;
                    client.interactions.set(`suggested_answers_${curationMessageId}`, suggestedAnswers);

                    await interaction.followUp({ content: `Resposta de ${suggestedAnswers[answerIndex].user} marcada como aprovada.`, ephemeral: true });
                    
                    // Desabilitar botões para esta resposta específica para evitar múltiplas ações
                    const originalMessage = interaction.message;
                    const disabledRows = [];
                    originalMessage.components.forEach(row => {
                        const newRow = new ActionRowBuilder();
                        row.components.forEach(component => {
                           if (component.customId === interaction.customId) {
                                newRow.addComponents(ButtonBuilder.from(component).setDisabled(true).setLabel('✅ Aprovada'));
                            } else if (component.customId.startsWith('curate_reject') && component.customId.endsWith(id)) {
                                newRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
                            } else {
                                newRow.addComponents(component.isStringSelectMenu() ? StringSelectMenuBuilder.from(component) : ButtonBuilder.from(component));
                            }
                        });
                        disabledRows.push(newRow);
                    });
                    
                    const originalEmbed = interaction.message.embeds[0];
                    const footerText = originalEmbed.footer.text;
                    const approvedCount = suggestedAnswers.filter(a => a.approved).length;
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setColor(0x00FF00) // Verde para indicar aprovação
                        .setFooter({ text: `${footerText.split(' | ')[0]} | ${approvedCount} resposta(s) aprovada(s).`});

                    await originalMessage.edit({ embeds: [updatedEmbed], components: disabledRows });
                }

            } else if (action === 'reject') {
                 await interaction.deferUpdate();
                 const [curationMessageId, answerIndex] = id.split('-');
                 const suggestedAnswers = client.interactions.get(`suggested_answers_${curationMessageId}`) || [];
                 const selectedAnswer = suggestedAnswers[parseInt(answerIndex, 10)];

                 await interaction.followUp({ content: `Resposta de ${selectedAnswer.user} rejeitada. Nenhuma ação será tomada.`, ephemeral: true });
                 
                 const originalMessage = interaction.message;
                 const disabledRows = [];
                 originalMessage.components.forEach(row => {
                    const newRow = new ActionRowBuilder();
                    row.components.forEach(component => {
                        if (component.customId === interaction.customId) {
                             newRow.addComponents(ButtonBuilder.from(component).setDisabled(true).setLabel('❌ Rejeitada'));
                        } else if (component.customId.startsWith('curate_approve') && component.customId.endsWith(id)) {
                             newRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
                        } else {
                            newRow.addComponents(component.isStringSelectMenu() ? StringSelectMenuBuilder.from(component) : ButtonBuilder.from(component));
                        }
                    });
                    disabledRows.push(newRow);
                });
                await originalMessage.edit({ components: disabledRows });

            } else if (action === 'select' && interaction.isStringSelectMenu()) {
                 const curationMessageId = id;
                 const selectedAnswerIndex = parseInt(interaction.values[0].split('_')[1], 10);
                 const suggestedAnswers = client.interactions.get(`suggested_answers_${curationMessageId}`) || [];
                 const selectedAnswer = suggestedAnswers[selectedAnswerIndex];

                 if (selectedAnswer) {
                     const originalEmbed = interaction.message.embeds[0];
                     const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setFields(
                             { name: 'Usuário Original', value: originalEmbed.description.match(/<@\d+>/)[0], inline: true },
                             { name: 'Pergunta Original', value: `\`\`\`${originalEmbed.description.split('```')[1]}\`\`\``, inline: false },
                             { name: `Resposta Sugerida por: ${selectedAnswer.user}`, value: selectedAnswer.content.substring(0, 1024), inline: false }
                         );

                    const modActionsRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId(`curate_approve_${curationMessageId}-${selectedAnswerIndex}`).setLabel('✅ Aprovar').setStyle(ButtonStyle.Success),
                            new ButtonBuilder().setCustomId(`curate_reject_${curationMessageId}-${selectedAnswerIndex}`).setLabel('❌ Rejeitar').setStyle(ButtonStyle.Danger)
                        );
                    
                    // Manter o menu de seleção e o botão 'Corrigido'
                    const menuRow = interaction.message.components[0];
                    const fixedButtonRow = interaction.message.components.find(c => c.components[0]?.customId?.startsWith('curate_fixed'));

                    const newComponents = [menuRow, modActionsRow];
                    if (fixedButtonRow) {
                        newComponents.push(fixedButtonRow);
                    }

                    await interaction.message.edit({ embeds: [updatedEmbed], components: newComponents });
                 }
            }
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
        
        const MOD_CHANNEL_ID = '1429314152928641118'; // Canal de moderação
        const modChannel = await client.channels.fetch(MOD_CHANNEL_ID);

        // Envia para o canal de moderação
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
                        .setLabel('Resolvendo')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`mod_solved_${userId}`)
                        .setLabel('Resolvido')
                        .setStyle(ButtonStyle.Success)
                );

            await modChannel.send({ embeds: [feedbackEmbed], components: [modActionsRow] });
        }
        
        // Tenta regenerar a resposta para o usuário
        try {
            const newResult = await generateSolution({
                problemDescription: originalQuestion,
                wikiContext: client.wikiContext,
                history: conversationHistory,
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
    
    // Tenta encontrar o tópico de notificações, e se não existir, cria um.
    const existingThreads = await userChannel.threads.fetch().catch(() => ({ threads: new Collection() }));
    let notificationThread = existingThreads.threads.find(t => t.name === 'notificações');

    if (!notificationThread) {
         try {
            notificationThread = await userChannel.threads.create({
                name: 'notificações',
                autoArchiveDuration: 10080,
                reason: `Tópico de notificações para ${user.tag}`
            });
         } catch(error) {
             console.error(`Não foi possível criar o tópico de notificações para ${user.tag}:`, error);
             return interaction.reply({ content: 'Não foi possível criar o tópico de notificações no canal do usuário.', ephemeral: true });
         }
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
             message = 'Seu feedback ajudou a resolver um problema, obrigado! Você recebeu pontos de reputação.';
             // Lógica para dar pontos de reputação ao usuário aqui
            break;
        default:
            return;
    }

    try {
        await notificationThread.send(`<@${userId}>, ${message}`);
        await interaction.reply({ content: `Notificação de status '${status}' enviada para ${user.tag}.`, ephemeral: true });
        
        // Desabilitar botões na mensagem original do moderador
        const originalMessage = interaction.message;
        const disabledRow = new ActionRowBuilder();
        originalMessage.components[0].components.forEach(component => {
            disabledRow.addComponents(ButtonBuilder.from(component).setDisabled(true));
        });
        await originalMessage.edit({ components: [disabledRow] });

    } catch (error) {
        console.error(`Falha ao enviar notificação ou editar mensagem do mod:`, error);
        await interaction.followUp({ content: 'Houve um erro ao processar a ação.', ephemeral: true });
    }
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

