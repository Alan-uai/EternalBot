// src/commands/utility/jotinha.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('jotinha')
    .setDescription('Envia o link do convite para o servidor do Jotinha.');

export async function execute(interaction) {
    const jotinhaLink = 'https://discord.gg/YvB3bT5Pdp';
    await interaction.reply({
        content: `Acesse o servidor do Jotinha clicando no link abaixo:\n${jotinhaLink}`
    });
}
