// src/commands/utility/personalizar-idioma.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-idioma')
    .setDescription('Escolha o idioma em que o Gui deve responder.');

export async function execute(interaction) {
    // Abre o painel focado na seleção de idioma
    await openAIPanel(interaction, 'language');
}
