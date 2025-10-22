// src/commands/utility/saw.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('saw')
    .setDescription('Envia o link para o servidor VIP do TheSaw.');

export async function execute(interaction) {
    const sawLink = 'https://www.roblox.com/share?code=eb40821f59cf2a40b5af63c27730170e&type=Server';
    await interaction.reply({
        content: `Acesse o servidor VIP do TheSaw clicando no link abaixo:\n${sawLink}`
    });
}
