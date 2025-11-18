// src/commands/utility/interesse-remove.js
import { SlashCommandBuilder } from 'discord.js';
import { executeRemoveInterest } from '../../interactions/buttons/dungeonconfig.js';


export const data = new SlashCommandBuilder()
    .setName('interesse-remove')
    .setDescription('Remove um ou mais dos seus interesses de raid registrados.');

export async function execute(interaction) {
    // Reutiliza a lógica já implementada no handler do botão
    await executeRemoveInterest(interaction);
}
