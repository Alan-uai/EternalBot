// src/commands/utility/personalizar-estilo.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-estilo')
    .setDescription('Personalize o estilo das respostas do Gui (ex: detalhada, curta).');

export async function execute(interaction) {
    // Abre o painel focado na seleção de estilo
    await openAIPanel(interaction, 'style');
}
