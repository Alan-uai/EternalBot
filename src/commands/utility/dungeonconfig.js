// src/commands/utility/dungeonconfig.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// IDs movidos para cá para serem exportados e usados por outros arquivos
export const CUSTOM_ID_PREFIX = 'dungeonconfig';
export const SOLING_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_soling_open`;
export const FARMING_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_farming_open`;
export const TAG_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_tag_open`;
export const NOTIFICATIONS_CONFIG_BUTTON_ID = `${CUSTOM_ID_PREFIX}_notifications_open`;
export const REMOVE_INTEREST_BUTTON_ID = `${CUSTOM_ID_PREFIX}_remove_interest_open`;


export const data = new SlashCommandBuilder()
    .setName('dungeonconfig')
    .setDescription('Abre o painel de configurações para Dungeons, Notificações e mais.');

export async function execute(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(SOLING_CONFIG_BUTTON_ID)
                .setLabel('Opções de Soling')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId(FARMING_CONFIG_BUTTON_ID)
                .setLabel('Gerenciar Farms')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📅'),
            new ButtonBuilder()
                .setCustomId(TAG_CONFIG_BUTTON_ID)
                .setLabel('Definir Tag de Host')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏷️'),
            new ButtonBuilder()
                .setCustomId(NOTIFICATIONS_CONFIG_BUTTON_ID)
                .setLabel('Preferências de Notificação')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔔'),
            new ButtonBuilder()
                .setCustomId(REMOVE_INTEREST_BUTTON_ID)
                .setLabel('Remover Interesses')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
        );

    await interaction.reply({
        content: 'Selecione qual painel de configuração você deseja abrir:',
        components: [row],
        ephemeral: true,
    });
}
