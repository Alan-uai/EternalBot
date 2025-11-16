// src/commands/utility/perfil.js
import { SlashCommandBuilder } from 'discord.js';
import { openAIPanel } from '../../interactions/buttons/personalizar-gui.js';

export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Gerencie seu perfil e a forma como a IA interage com seus dados.');

export async function execute(interaction) {
    // Reutiliza o openAIPanel para abrir a visualização de perfil e contexto
    await openAIPanel(interaction, 'profile');
}
