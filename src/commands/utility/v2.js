// src/commands/utility/v2.js
import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';

const ADMIN_ROLE_ID = '1429318984716521483';

export const data = new SlashCommandBuilder()
    .setName('v2')
    .setDescription('Posta uma mensagem customizada em um painel moderno (embed). [Admin]')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('v2_modal')
        .setTitle('Criar Painel V2');

    const titleInput = new TextInputBuilder()
        .setCustomId('v2_title')
        .setLabel("Título do Painel")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Digite o título principal aqui.")
        .setRequired(true);

    const contentInput = new TextInputBuilder()
        .setCustomId('v2_content')
        .setLabel("Conteúdo do Painel")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Digite a mensagem principal aqui. Você pode usar formatação Markdown.")
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
}

async function handleInteraction(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'v2_modal') return;

    await interaction.deferReply({ ephemeral: true });

    const title = interaction.fields.getTextInputValue('v2_title');
    const content = interaction.fields.getTextInputValue('v2_content');

    const embed = new EmbedBuilder()
        .setColor(0x3498DB) // Uma cor azul moderna
        .setTitle(title)
        .setDescription(content)
        .setTimestamp()
        .setFooter({ text: `Postado por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    try {
        await interaction.channel.send({ embeds: [embed] });
        await interaction.editReply({ content: 'Sua mensagem foi postada com sucesso!', ephemeral: true });
    } catch (error) {
        console.error("Erro ao postar mensagem V2:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao tentar postar sua mensagem.', ephemeral: true });
    }
}

export { handleInteraction };
