// src/commands/utility/site.js
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('site')
    .setDescription('Envia o link do site do Guia Eterno.');

export async function execute(interaction) {
    const siteLink = 'https://ewfadom.vercel.app/';
    await interaction.reply({
        content: `Acesse o site oficial do Guia Eterno clicando no link abaixo:\n${siteLink}`,
        ephemeral: true // Apenas o usuário que digitou o comando verá a resposta
    });
}
