// src/interactions/buttons/curate.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { updateKnowledgeBase } from '../../ai/flows/update-knowledge-base.js';

export const customIdPrefix = 'curate';

async function handleFixed(interaction, { client }) {
    const { logger } = client.container;
    const helpMessageId = interaction.customId.split('_')[2];
    const curationMessageId = client.container.interactions.get(`curation_id_for_help_${helpMessageId}`);
    
    if (!curationMessageId) {
        return interaction.reply({ content: "Não foi possível encontrar a mensagem de curadoria original associada a esta resposta.", ephemeral: true });
    }
    
    const suggestedAnswers = client.container.interactions.get(`suggested_answers_${curationMessageId}`);
    
    if (!suggestedAnswers || suggestedAnswers.length === 0) {
        return interaction.reply({ content: "Não há respostas da comunidade para aprovar para este tópico.", ephemeral: true });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`curate_select_${curationMessageId}`)
        .setPlaceholder('Selecione a melhor resposta para aprovar...')
        .addOptions(suggestedAnswers.map((answer, index) => ({
            label: `Resposta de: ${answer.user}`,
            description: answer.content.substring(0, 50) + '...',
            value: `answer_${index}`
        })));
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({
        content: "Por favor, selecione qual das respostas da comunidade você gostaria de aprovar para ensinar a IA.",
        components: [row],
        ephemeral: true
    });
}

async function handleSelect(interaction, { client }) {
    const { logger, services } = client.container;
    const curationMessageId = interaction.customId.split('_')[2];
    const selectedAnswerIndex = parseInt(interaction.values[0].split('_')[1], 10);
    
    const suggestedAnswers = client.container.interactions.get(`suggested_answers_${curationMessageId}`);
    const selectedAnswer = suggestedAnswers[selectedAnswerIndex];
    
    if (!selectedAnswer) {
        return interaction.update({ content: "A resposta selecionada não foi encontrada.", components: [] });
    }

    // Armazena a resposta selecionada para o próximo passo
    client.container.interactions.set(`selected_answer_for_${curationMessageId}`, selectedAnswer);

    const actionMenu = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`curate_learn_${curationMessageId}`).setLabel('Aprovar e Ensinar IA').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`curate_approve_${curationMessageId}`).setLabel('Apenas Aprovar').setStyle(ButtonStyle.Primary)
        );

    await interaction.update({
        content: `**Resposta de ${selectedAnswer.user}:**\n\`\`\`${selectedAnswer.content}\`\`\`\n\nO que você deseja fazer com esta resposta?`,
        components: [actionMenu]
    });
}


async function handleApproveAndLearn(interaction, { client }) {
    const curationMessageId = interaction.customId.split('_')[2];
    const { logger, services } = client.container;

    const modal = new ModalBuilder()
        .setCustomId(`curate_modal_${curationMessageId}`)
        .setTitle('Ensinar a IA');
    
    const instructionsInput = new TextInputBuilder()
        .setCustomId('moderator_instructions')
        .setLabel("Instruções para a IA (Opcional)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Ex: 'Crie um novo artigo em src/data/wiki-articles/guia-x.js'. 'Adicione esta informação na tabela de pets do mundo 20'.")
        .setRequired(false);

    await interaction.showModal(modal.addComponents(new ActionRowBuilder().addComponents(instructionsInput)));
}


async function handleApproveOnly(interaction, { client }) {
     await interaction.update({ content: "✅ Resposta aprovada! O usuário recebeu o mérito. O conhecimento da IA não foi alterado.", components: [] });
    // Futuramente, adicionar lógica de pontos de reputação para `selectedAnswer.userId`
}


async function handleLearnSubmit(interaction, { client }) {
    await interaction.deferReply({ ephemeral: true });

    const { logger, services, config } = client.container;
    const curationMessageId = interaction.customId.split('_')[2];

    try {
        const modChannel = await client.channels.fetch(config.MOD_CURATION_CHANNEL_ID);
        const curationMessage = await modChannel.messages.fetch(curationMessageId);
        
        const originalEmbed = curationMessage.embeds[0];
        const questionMatch = originalEmbed.description.match(/\*\*Pergunta:\*\*\n\`\`\`([\s\S]*?)\`\`\`/);
        const originalQuestion = questionMatch ? questionMatch[1] : 'Pergunta não encontrada';

        const selectedAnswer = client.container.interactions.get(`selected_answer_for_${curationMessageId}`);
        const moderatorInstructions = interaction.fields.getTextInputValue('moderator_instructions');
        
        const updateResult = await updateKnowledgeBase({
            question: originalQuestion,
            approvedAnswers: [selectedAnswer.content],
            currentKnowledgeBase: services.wikiContext.getContext(),
            moderatorInstructions: moderatorInstructions || undefined
        });

        if (updateResult && updateResult.filePath && updateResult.fileContent) {
            // TODO: Salvar o arquivo no sistema. Isso requer uma nova capacidade do bot.
            // Por enquanto, apenas exibimos o resultado para o moderador.
            await interaction.editReply({ 
                content: `A IA sugere a seguinte atualização de arquivo. Por favor, aplique manualmente:\n\n**Arquivo:** \`${updateResult.filePath}\`\n\n**Conteúdo:**\n\`\`\`javascript\n${updateResult.fileContent}\n\`\`\``
            });

             // Limpa os dados temporários
            client.container.interactions.delete(`selected_answer_for_${curationMessageId}`);
            client.container.interactions.delete(`suggested_answers_${curationMessageId}`);

        } else {
            throw new Error("A IA não conseguiu gerar a atualização da base de conhecimento.");
        }

    } catch (error) {
        logger.error("Erro ao executar o fluxo de aprendizado da IA:", error);
        await interaction.editReply({ content: "Ocorreu um erro ao tentar ensinar a IA. Verifique os logs." });
    }
}


export async function handleInteraction(interaction, container) {
    const [prefix, action, ...params] = interaction.customId.split('_');

    if (prefix !== 'curate') return;

    if (interaction.isButton()) {
        if (action === 'fixed') {
            await handleFixed(interaction, container);
        } else if (action === 'learn') {
            const curationMessageId = params[0];
            await handleApproveAndLearn(interaction, container);
        } else if (action === 'approve') {
            await handleApproveOnly(interaction, container);
        }
    } else if (interaction.isStringSelectMenu()) {
        if (action === 'select') {
            await handleSelect(interaction, container);
        }
    } else if (interaction.isModalSubmit()) {
        if (action === 'modal') {
            await handleLearnSubmit(interaction, container);
        }
    }
}
