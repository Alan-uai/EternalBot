// src/commands/utility/personalizar-idioma.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-idioma')
    .setDescription('Escolha um idioma oficial ou divertido para as respostas do Gui.');

export async function execute(interaction) {
    // Abre o painel focado na seleção de ambos os tipos de idioma
    await openAIPanel(interaction, 'language');
}
