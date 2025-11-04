// src/commands/utility/dungeonconfig.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const CUSTOM_ID_PREFIX = 'dungeonconfig';
export const SOLING_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_soling_open`;
export const FARMING_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_farming_open`;


export const data = new SlashCommandBuilder()
    .setName('dungeonconfig')
    .setDescription('Abre o painel de configurações para Dungeons (Soling, Farming, etc).');

export async function execute(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(SOLING_CONFIG_BUTTON_ID)
                .setLabel('Configurações de Soling')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId(FARMING_CONFIG_BUTTON_ID)
                .setLabel('Gerenciar Farms')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📅')
        );

    await interaction.reply({
        content: 'Selecione qual painel de configuração você deseja abrir:',
        components: [row],
        ephemeral: true,
    });
}
