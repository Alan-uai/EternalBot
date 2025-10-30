// src/interactions/buttons/feedback.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { generateSolution } from '../../ai/flows/generate-solution.js';
import { createTableImage } from '../../utils/createTableImage.js';

export const customIdPrefix = 'feedback';

export async function handleInteraction(interaction, { client }) {
    const { logger, config, services } = client.container;
    const [_, action, userId, originalMessageId] = interaction.customId.split('_');

    if (action === 'like') {
        await interaction.reply({ content: 'Obrigado pelo seu feedback positivo!', ephemeral: true });
        return;
    }

    if (action === 'dislike') {
        await interaction.deferUpdate();
        
        const originalQuestion = client.container.interactions.get(`question_${originalMessageId}`);
        const badResponse = client.container.interactions.get(`answer_${originalMessageId}`);
        const replyMessageId = client.container.interactions.get(`replyMessageId_${originalMessageId}`);
        const conversationHistory = client.container.interactions.get(`history_${originalMessageId}`);
        
        const modChannel = await client.channels.fetch(config.FEEDBACK_CHANNEL_ID);

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
                     new ButtonBuilder().setCustomId(`mod-feedback_seen_${userId}`).setLabel('Visto').setStyle(ButtonStyle.Secondary),
                     new ButtonBuilder().setCustomId(`mod-feedback_solving_${userId}`).setLabel('Resolvendo').setStyle(ButtonStyle.Primary),
                     new ButtonBuilder().setCustomId(`mod-feedback_solved_${userId}`).setLabel('Resolvido').setStyle(ButtonStyle.Success)
                );

            await modChannel.send({ embeds: [feedbackEmbed], components: [modActionsRow] });
        }
        
        // Tenta regenerar a resposta para o usuário
        try {
            const newResult = await generateSolution({
                problemDescription: originalQuestion,
                wikiContext: services.wikiContext.getContext(),
                history: conversationHistory,
            });
            
            if (newResult && newResult.structuredResponse) {
                let newReplyContent = '🔄 **Resposta regenerada:**\n\n';
                let attachments = [];
    
                for (const section of newResult.structuredResponse) {
                    newReplyContent += `**${section.titulo}**\n${section.conteudo}\n\n`;
                    if (section.table) {
                         try {
                            const tableImage = await createTableImage(section.table.headers, section.table.rows);
                            attachments.push(new AttachmentBuilder(tableImage, { name: `table-regen-${section.titulo.toLowerCase().replace(/ /g, '-')}.png` }));
                        } catch (tableError) {
                            logger.error("Erro ao gerar imagem da tabela (regeneração):", tableError);
                        }
                    }
                }

                if (newReplyContent.length > 2000) {
                    newReplyContent = newReplyContent.substring(0, 1997) + '...';
                }

                const originalChannel = await client.channels.fetch(interaction.channelId);
                const replyMessage = await originalChannel.messages.fetch(replyMessageId);

                if(replyMessage) {
                    await replyMessage.edit({ content: newReplyContent, files: attachments });
                    client.container.interactions.set(`answer_${originalMessageId}`, newReplyContent);
                }
            }
        } catch (error) {
             logger.error('Erro ao regenerar resposta:', error);
        }
    }
}
