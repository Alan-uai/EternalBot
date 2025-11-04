// src/commands/utility/updlog.js
import { SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

const ADMIN_ROLE_ID = '1429318984716521483';

export const data = new SlashCommandBuilder()
    .setName('updlog')
    .setDescription('Lança um novo log de atualização para o jogo.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('updlog_modal')
        .setTitle('Novo Log de Atualização');

    const titleInput = new TextInputBuilder()
        .setCustomId('updlog_title')
        .setLabel("Título da Atualização (em Inglês)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Update 20, Part 3")
        .setRequired(true);

    const contentInput = new TextInputBuilder()
        .setCustomId('updlog_content')
        .setLabel("Conteúdo do Log (Markdown, em Inglês)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Cole o log de atualização aqui. Ele será traduzido.")
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
}
