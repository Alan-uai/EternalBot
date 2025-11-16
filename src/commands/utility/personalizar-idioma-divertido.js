// src/commands/utility/personalizar-idioma-divertido.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-idioma-divertido')
    .setDescription('Escolha um idioma fictício ou divertido para o Gui.');

export async function execute(interaction) {
    // Abre o painel focado na seleção de idioma divertido
    await openAIPanel(interaction, 'fun_language');
}
