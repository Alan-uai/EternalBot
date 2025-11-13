
// src/commands/utility/personalizar-gui.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('personalizar-gui')
    .setDescription('Personalize a forma como o Gui interage com você.');

export async function execute(interaction) {
    // Abre diretamente o painel de personalização
    await openAIPanel(interaction);
}
