// src/commands/utility/personalizar-idioma-oficial.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-idioma-oficial')
    .setDescription('Escolha um idioma oficial para as respostas do Gui.');

export async function execute(interaction) {
    // Abre o painel focado na seleção de idioma oficial
    await openAIPanel(interaction, 'language');
}
