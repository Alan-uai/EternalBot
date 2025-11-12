// src/events/guild/messageCreate.js
import { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import axios from 'axios';
import { generateSolution } from '../../ai/flows/generate-solution.js';
import { createTableImage } from '../../utils/createTableImage.js';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';


// Função para enviar respostas, dividindo se necessário
async function sendReply(message, parts) {
    const feedbackRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`feedback_like_${message.id}`).setLabel('👍').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`feedback_dislike_${message.author.id}_${message.id}`).setLabel('👎').setStyle(ButtonStyle.Danger)
        );

    let replyMessage;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;
        const options = {
            content: part.content || null,
            files: part.attachments,
            components: isLastPart ? [feedbackRow] : []
        };

        if (i === 0) {
            // A primeira mensagem é uma resposta direta
            replyMessage = await message.reply(options);
        } else {
            // As mensagens subsequentes são enviadas no canal
            await message.channel.send(options);
        }
    }
    return replyMessage; // Retorna a primeira mensagem para referência
}


// Função para iniciar o fluxo de curadoria quando a IA não sabe a resposta
async function handleUnansweredQuestion(message, question, imageAttachment) {
    const { client, config, logger } = message.client.container;
    
    const unansweredQuestionEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❓ Pergunta Sem Resposta')
        .setDescription(`**Usuário:** <@${message.author.id}>\n**Pergunta:**\n\`\`\`${question}\`\`\``)
        .setTimestamp();
    
    if (imageAttachment) {
        unansweredQuestionEmbed.setImage(imageAttachment.url);
    }
     
    // Enviar para o canal de ajuda da comunidade
    const helpChannel = await client.channels.fetch(config.COMMUNITY_HELP_CHANNEL_ID);
    const helpMessage = await helpChannel.send({
        content: `Alguém consegue responder a esta pergunta de <@${message.author.id}>?\n> ${question}`,
        files: imageAttachment ? [new AttachmentBuilder(imageAttachment.url)] : []
    });

    // Enviar para o canal de curadoria dos moderadores
    const modChannel = await client.channels.fetch(config.MOD_CURATION_CHANNEL_ID);
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
    client.container.interactions.set(`curation_id_for_help_${helpMessage.id}`, curationMessage.id);
    
    // Não precisa mais responder ao usuário aqui, pois o fallback da IA já faz isso.
}

// Função principal do evento
export const name = Events.MessageCreate;

export async function execute(message) {
    const { client, config, logger, services } = message.client.container;
    const { wikiContext, firebase } = services;
    const { firestore } = firebase;

    if (message.author.bot) return;

    // --- Impede que o bot responda a si mesmo ou a outras respostas no fio ---
    if (message.reference) {
        return;
    }

    // --- Processamento de Respostas da Comunidade ---
    if (message.channel.id === config.COMMUNITY_HELP_CHANNEL_ID && message.reference) {
        try {
            const repliedToMessage = await message.channel.messages.fetch(message.reference.messageId);
            const originalCurationMessageId = client.container.interactions.get(`curation_id_for_help_${repliedToMessage.id}`);
            
            if (repliedToMessage.author.id === client.user.id && originalCurationMessageId) {
                const modChannel = await client.channels.fetch(config.MOD_CURATION_CHANNEL_ID);
                const questionMessageInModChannel = await modChannel.messages.fetch(originalCurationMessageId);

                if (questionMessageInModChannel) {
                    let suggestedAnswers = client.container.interactions.get(`suggested_answers_${originalCurationMessageId}`) || [];
                    suggestedAnswers.push({
                        user: message.author.username,
                        userId: message.author.id,
                        content: message.content
                    });
                    client.container.interactions.set(`suggested_answers_${originalCurationMessageId}`, suggestedAnswers);
                    
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId(`curate_select_${originalCurationMessageId}`)
                        .setPlaceholder('Analisar uma resposta sugerida...')
                        .addOptions(suggestedAnswers.map((answer, index) => ({
                            label: `Resposta de: ${answer.user}`,
                            description: answer.content.substring(0, 50) + '...',
                            value: `answer_${index}`
                        })));
                    
                    const menuRow = new ActionRowBuilder().addComponents(selectMenu);
                    const buttonRow = questionMessageInModChannel.components[0];
                    
                    const updatedEmbed = EmbedBuilder.from(questionMessageInModChannel.embeds[0])
                         .setColor(0xFFA500)
                         .setFooter({ text: `${suggestedAnswers.length} resposta(s) da comunidade aguardando análise.`});

                    await questionMessageInModChannel.edit({ embeds: [updatedEmbed], components: [menuRow, buttonRow] });
                    await message.react('👍');
                }
            }
        } catch (error) {
            logger.error("Erro ao processar resposta da comunidade:", error);
        }
        return; 
    }
    
    // --- Processamento de Menções ao Bot (Comando de Chat) ---
    if (message.channel.id !== config.CHAT_CHANNEL_ID || !message.mentions.has(client.user.id) || message.mentions.everyone) {
        return;
    }

    const question = message.content.replace(/<@!?(\d+)>/g, '').trim();
    const imageAttachment = message.attachments.find(att => att.contentType?.startsWith('image/'));

    if (!question && !imageAttachment) {
        await message.reply(`Olá! Meu nome é Gui. Em que posso ajudar sobre o Anime Eternal?`);
        return;
    }

    await message.channel.sendTyping();
    
    const userRef = doc(firestore, 'users', message.author.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    
    const responseStyleKey = userData.aiResponsePreference || 'detailed';
    const personaKey = userData.aiPersonality || 'amigavel';
    const languageKey = userData.aiLanguage || 'pt_br';
    const emojiKey = userData.aiEmojiPreference || 'moderate';
    const useProfileContext = userData.aiUseProfileContext || false;

    const userTitle = userData.userTitle || undefined;
    const userName = userData.customName || message.author.username;

    const responseStyleInstruction = responseStyles[responseStyleKey]?.instruction || '';
    const personaInstruction = personas[personaKey]?.instruction || '';
    const languageInstruction = languages[languageKey]?.instruction || '';
    const emojiInstruction = emojiStyles[emojiKey]?.instruction || '';
    
    let userProfileContext = undefined;
    if (useProfileContext && userSnap.exists()) {
        const { currentWorld, rank, dps } = userData;
        userProfileContext = `Mundo Atual: ${currentWorld || 'N/D'}, Rank: ${rank || 'N/D'}, DPS: ${dps || 'N/D'}`;
    }

    const userGoals = userData.goals || [];
    const userGoalsContext = userGoals.length > 0 ? `Metas do Usuário: ${userGoals.join(', ')}` : undefined;

    let imageDataUri = null;
    if (imageAttachment) {
        try {
            const response = await axios.get(imageAttachment.url, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            imageDataUri = `data:${imageAttachment.contentType};base64,${base64}`;
        } catch (error) {
            logger.error("Erro ao processar a imagem anexada:", error);
        }
    }

    const history = [];
    let currentMessage = message;
    const historyLimit = 10;
    try {
        while (currentMessage.reference && history.length < historyLimit) {
            const repliedToMessage = await currentMessage.channel.messages.fetch(currentMessage.reference.messageId);
            const role = repliedToMessage.author.id === client.user.id ? 'assistant' : 'user';
            const content = repliedToMessage.content.replace(/<@!?(\d+)>/g, '').trim();
            history.unshift({ role, content });
            currentMessage = repliedToMessage;
        }
    } catch (error) {
        logger.warn("Não foi possível buscar o histórico completo da conversa:", error);
    }

    try {
        const result = await generateSolution({
            problemDescription: question,
            imageDataUri: imageDataUri || undefined,
            wikiContext: wikiContext.getContext(),
            userProfileContext,
            userGoalsContext,
            history: history.length > 0 ? history : undefined,
            responseStyleInstruction,
            personaInstruction,
            languageInstruction,
            emojiInstruction,
            userName,
            userTitle,
        });

        if (result?.structuredResponse?.[0]?.titulo === 'Resposta não encontrada') {
            await handleUnansweredQuestion(message, question, imageAttachment);
            await message.reply(result.structuredResponse[0].conteudo);
        } else {
            const messageParts = [];
            for (const section of result.structuredResponse) {
                let textContent = '';
                if (section.titulo) textContent += `**${section.titulo}**\n`;
                if (section.conteudo) textContent += `${section.conteudo}\n\n`;

                if (textContent.trim()) {
                    messageParts.push({ content: textContent, attachments: [] });
                }

                if (section.table && section.table.rows && section.table.rows.length > 0) {
                    try {
                        const tableImage = await createTableImage(section.table.headers, section.table.rows);
                        const attachment = new AttachmentBuilder(tableImage, { name: `table-${section.titulo?.toLowerCase().replace(/ /g, '-') || 'data'}.png` });
                        messageParts.push({ content: null, attachments: [attachment] });
                    } catch (tableError) {
                        logger.error("Erro ao gerar imagem da tabela:", tableError);
                        messageParts.push({ content: `*(Erro ao renderizar a tabela ${section.titulo} como imagem.)*`, attachments: [] });
                    }
                }
            }
            
            const replyMessage = await sendReply(message, messageParts);
            
            client.container.interactions.set(`question_${message.id}`, question);
            client.container.interactions.set(`answer_${message.id}`, messageParts[0]?.content || 'Resposta em imagem.');
            client.container.interactions.set(`history_${message.id}`, history);
            client.container.interactions.set(`replyMessageId_${message.id}`, replyMessage.id);
        }
    } catch (error) {
        logger.error('Erro na execução do evento messageCreate:', error);
        await handleUnansweredQuestion(message, question, imageAttachment);
        await message.reply('Ocorreu um erro inesperado ao processar sua pergunta. Um especialista foi notificado.').catch(() => {});
    }
}
