// src/commands/utility/personalizar-emojis.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-emojis')
    .setDescription('Defina com que frequência o Gui deve usar emojis.');

export async function execute(interaction) {
    // Abre o painel focado na seleção de emojis
    await openAIPanel(interaction, 'emoji');
}
