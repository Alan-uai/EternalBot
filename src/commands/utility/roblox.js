// src/commands/utility/roblox.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import axios from 'axios';

export const data = new SlashCommandBuilder()
    .setName('roblox')
    .setDescription('Gera um link para o perfil Roblox de um usuário verificado.')
    .addUserOption(option => 
        option.setName('usuario')
              .setDescription('O usuário para buscar (padrão: você mesmo).')
              .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id);
    const displayName = member.displayName;

    // Extrai o nome de usuário do Roblox do formato "Nome (@RobloxUsername)"
    const match = displayName.match(/@(\w+)/);
    if (!match) {
        return interaction.editReply({
            content: `Não foi possível extrair um nome de usuário Roblox do apelido de ${targetUser.username}. O formato esperado é "Nome (@username)".`
        });
    }

    const robloxUsername = match[1];

    try {
        // A API correta requer um método POST
        const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
            "usernames": [robloxUsername],
            "excludeBannedUsers": true
        });

        if (!response.data.data || response.data.data.length === 0) {
            return interaction.editReply({
                content: `Não foi possível encontrar um jogador na Roblox com o nome de usuário "${robloxUsername}".`
            });
        }

        const userId = response.data.data[0].id;
        const userProfileUrl = `https://www.roblox.com/users/${userId}/profile`;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`Ver Perfil de ${robloxUsername}`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(userProfileUrl)
                    .setEmoji('👤')
            );

        await interaction.editReply({
            content: `Aqui está o link para o perfil de ${robloxUsername}:`,
            components: [row]
        });

    } catch (error) {
        console.error('Erro ao buscar API da Roblox:', error.response ? error.response.data : error.message);
        await interaction.editReply({
            content: 'Ocorreu um erro ao tentar se comunicar com a API da Roblox. Tente novamente mais tarde.'
        });
    }
}
