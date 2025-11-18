// src/commands/utility/interesse.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('interesse')
    .setDescription('Registra seu interesse em participar de uma raid (Farm ou Soling).');

export async function execute(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('interesse_purpose_farm')
                .setLabel('Grupo de Farm')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🌾'),
            new ButtonBuilder()
                .setCustomId('interesse_purpose_soling')
                .setLabel('Ajuda para Solar')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🆘')
        );

    await interaction.reply({
        content: '**Em qual tipo de grupo você tem interesse?**\n\n- **Grupo de Farm:** Para farmar a mesma raid repetidamente.\n- **Ajuda para Solar:** Para receber ajuda para completar uma raid específica.',
        components: [row],
        ephemeral: true,
    });
}
