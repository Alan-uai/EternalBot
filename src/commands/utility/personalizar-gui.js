// src/commands/utility/personalizar-gui.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import {
    CUSTOMIZE_AI_BUTTON_ID
} from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-gui')
    .setDescription('Personalize a forma como o Gui interage com você.');

export async function execute(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(CUSTOMIZE_AI_BUTTON_ID)
                .setLabel('Abrir Painel de Personalização')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🤖')
        );

    await interaction.reply({
        content: 'Clique no botão abaixo para abrir o painel e personalizar sua experiência com o Gui, nosso assistente de IA.',
        components: [row],
        ephemeral: true,
    });
}
