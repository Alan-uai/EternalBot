// src/commands/utility/personalizar-persona.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-persona')
    .setDescription('Personalize a personalidade do Gui (ex: amigável, técnico).');

export async function execute(interaction) {
    // Abre o painel focado na seleção de personalidade
    await openAIPanel(interaction, 'persona');
}
