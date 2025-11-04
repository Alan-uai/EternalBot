// src/interactions/buttons/gerenciar.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const customIdPrefix = 'support';

// DEFININDO OS IDs AQUI PARA SEREM EXPORTADOS
export const SUPPORT_BUTTON_IDS = {
    REPORT: `${customIdPrefix}_report`,
    TICKET: `${customIdPrefix}_ticket`,
    APPLY: `${customIdPrefix}_apply`
};


const APPLICATION_MODAL_IDS = {
    FARMING: 'application_farming_modal',
    SOLING: 'application_soling_modal'
};

const APPLICATION_BUTTON_IDS = {
    FARMING: 'apply_farming',
    SOLING: 'apply_soling'
};

const REVIEW_BUTTON_IDS = {
    ACCEPT: 'review_accept',
    REJECT: 'review_reject'
};

// --- Funções para criar Tópicos Privados ---
async function createPrivateThread(interaction, type) {
    const { config, logger } = interaction.client.container;
    const threadChannel = await interaction.client.channels.fetch(config.SUPPORT_THREADS_CHANNEL_ID).catch(() => null);

    if (!threadChannel || threadChannel.type !== ChannelType.GuildText) {
        logger.error(`[Support] Canal de tópicos (${config.SUPPORT_THREADS_CHANNEL_ID}) não encontrado ou não é um canal de texto.`);
        return interaction.reply({ content: 'Ocorreu um erro interno ao criar seu canal de suporte. Por favor, contate um admin.', ephemeral: true });
    }

    try {
        const threadName = `${type === 'Denúncia' ? '🚨' : '🎫'} ${type} - ${interaction.user.username}`;
        const thread = await threadChannel.threads.create({
            name: threadName,
            autoArchiveDuration: 1440, // 24 horas
            type: ChannelType.PrivateThread,
            reason: `${type} aberto por ${interaction.user.tag}`
        });

        await thread.members.add(interaction.user.id);

        const modRole = config.MODERATOR_ROLE_ID;
        // Notificação no canal principal, mencionando o tópico
        await threadChannel.send({ content: `<@&${modRole}>, um novo ${type.toLowerCase()} foi aberto por <@${interaction.user.id}> em <#${thread.id}>.` });
        
        // Envia a mensagem de guia no tópico
        const webhook = await thread.createWebhook({ name: 'Dicas para Seguir', reason: 'Guia para o tópico' });
        await webhook.send({
            content: `**Por favor, para agilizar o atendimento, forneça o máximo de detalhes possível.**\n> Para denúncias: envie o ID do usuário, prints, vídeos e uma descrição clara do ocorrido.\n> Para tickets: descreva seu problema ou dúvida detalhadamente.`,
            username: 'Dicas para Seguir'
        });
        await webhook.delete();

        await interaction.reply({ content: `Seu ${type.toLowerCase()} foi aberto com sucesso! Acesse-o aqui: <#${thread.id}>`, ephemeral: true });

    } catch (error) {
        logger.error(`[Support] Falha ao criar o tópico de ${type.toLowerCase()}:`, error);
        await interaction.reply({ content: `Ocorreu um erro ao criar seu ${type.toLowerCase()}.`, ephemeral: true });
    }
}

// --- Funções para Candidaturas ---
async function handleApplication(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(APPLICATION_BUTTON_IDS.FARMING).setLabel('Equipe de Farming').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(APPLICATION_BUTTON_IDS.SOLING).setLabel('Equipe de Soling').setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        content: 'Qual equipe você gostaria de se candidatar?',
        components: [row],
        ephemeral: true
    });
}

async function openApplicationModal(interaction, type) {
    const modalId = type === 'Farming' ? APPLICATION_MODAL_IDS.FARMING : APPLICATION_MODAL_IDS.SOLING;
    
    const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle(`Candidatura - Equipe de ${type}`);
    
    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel(`Por que você seria um bom membro?`)
        .setPlaceholder(`Descreva sua experiência em ${type.toLowerCase()}, disponibilidade, etc.`)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    await interaction.showModal(modal);
}

async function handleApplicationSubmit(interaction, type) {
    await interaction.deferReply({ ephemeral: true });
    const { config, logger } = interaction.client.container;
    const reason = interaction.fields.getTextInputValue('reason');
    
    const reviewChannel = await interaction.client.channels.fetch(config.APPLICATION_REVIEW_CHANNEL_ID).catch(() => null);

    if (!reviewChannel) {
        logger.error(`[Support] Canal de revisão de candidaturas (${config.APPLICATION_REVIEW_CHANNEL_ID}) não encontrado.`);
        return interaction.editReply({ content: 'Ocorreu um erro interno ao enviar sua candidatura.' });
    }

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle(`📝 Nova Candidatura - Equipe de ${type}`)
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .addFields(
            { name: 'Candidato', value: `<@${interaction.user.id}>` },
            { name: 'Motivação', value: `\`\`\`${reason}\`\`\`` }
        )
        .setTimestamp();
        
    const reviewRow = new ActionRowBuilder()
        .addComponents(
             new ButtonBuilder().setCustomId(`${REVIEW_BUTTON_IDS.ACCEPT}_${type}_${interaction.user.id}`).setLabel('Aceitar').setStyle(ButtonStyle.Success),
             new ButtonBuilder().setCustomId(`${REVIEW_BUTTON_IDS.REJECT}_${type}_${interaction.user.id}`).setLabel('Rejeitar').setStyle(ButtonStyle.Danger)
        );

    await reviewChannel.send({ embeds: [embed], components: [reviewRow] });
    await interaction.editReply({ content: 'Sua candidatura foi enviada com sucesso! Entraremos em contato se for aprovado.' });
}

async function handleReview(interaction) {
    const [_, action, type, userId] = interaction.customId.split('_');
    const member = await interaction.guild.members.fetch(userId).catch(()=>null);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    
    if (action === 'accept') {
        embed.setColor(0x00FF00).setTitle(`✅ Candidatura APROVADA - Equipe de ${type}`);
        if(member) await member.send(`Parabéns! Sua candidatura para a Equipe de ${type} foi **aprovada**. Um administrador entrará em contato em breve.`).catch(()=>{});
    } else {
        embed.setColor(0xFF0000).setTitle(`❌ Candidatura REJEITADA - Equipe de ${type}`);
        if(member) await member.send(`Obrigado pelo seu interesse. Infelizmente, sua candidatura para a Equipe de ${type} não foi aprovada no momento.`).catch(()=>{});
    }
    embed.setFooter({ text: `Ação por: ${interaction.user.tag}` });
    
    // Desativa os botões
    const disabledRow = new ActionRowBuilder().addComponents(
        ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true),
        ButtonBuilder.from(interaction.message.components[0].components[1]).setDisabled(true)
    );

    await interaction.update({ embeds: [embed], components: [disabledRow] });
}


// --- Handler Principal ---
export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        const customId = interaction.customId;

        // Painel Principal
        if (customId === SUPPORT_BUTTON_IDS.REPORT) await createPrivateThread(interaction, 'Denúncia');
        if (customId === SUPPORT_BUTTON_IDS.TICKET) await createPrivateThread(interaction, 'Ticket');
        if (customId === SUPPORT_BUTTON_IDS.APPLY) await handleApplication(interaction);
        
        // Sub-painel de Candidatura
        if (customId === APPLICATION_BUTTON_IDS.FARMING) await openApplicationModal(interaction, 'Farming');
        if (customId === APPLICATION_BUTTON_IDS.SOLING) await openApplicationModal(interaction, 'Soling');
        
        // Revisão de Candidatura
        if (customId.startsWith(REVIEW_BUTTON_IDS.ACCEPT) || customId.startsWith(REVIEW_BUTTON_IDS.REJECT)) {
            await handleReview(interaction);
        }

    } else if (interaction.isModalSubmit()) {
        const modalId = interaction.customId;

        if (modalId === APPLICATION_MODAL_IDS.FARMING) await handleApplicationSubmit(interaction, 'Farming');
        if (modalId === APPLICATION_MODAL_IDS.SOLING) await handleApplicationSubmit(interaction, 'Soling');
    }
}
