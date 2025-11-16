// src/commands/utility/seguir.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('seguir')
    .setDescription('Segue ou deixa de seguir um usuário para receber notificações.')
    .addUserOption(option => 
        option.setName('usuario')
            .setDescription('O usuário que você deseja seguir ou deixar de seguir.')
            .setRequired(true)
    );

export async function execute(interaction) {
    const target = interaction.options.getUser('usuario');

    if (target.id === interaction.user.id) {
        return interaction.reply({ content: 'Você não pode seguir a si mesmo.', ephemeral: true });
    }
    if (target.bot) {
        return interaction.reply({ content: 'Você não pode seguir um bot.', ephemeral: true });
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`seguir_confirm_${target.id}`) // Custom ID mais específico
            .setLabel(`Confirmar Seguir ${target.username}`)
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
        content: `Você tem certeza que deseja seguir **${target.username}**?`,
        components: [row],
        ephemeral: true
    });
}
