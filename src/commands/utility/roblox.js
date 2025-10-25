// src/commands/utility/roblox.js
import { SlashCommandBuilder } from 'discord.js';
import { usernameToId } from '../../utils/roblox.js';

export const data = new SlashCommandBuilder()
    .setName('roblox')
    .setDescription('Testa a extração de ID do Roblox a partir do nickname de um usuário.')
    .addUserOption(option =>
        option.setName('usuario')
            .setDescription('O usuário para testar. Se não for especificado, usa você mesmo.')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
        return interaction.editReply(`Não foi possível encontrar o membro ${targetUser.tag} no servidor.`);
    }

    const nickname = member.nickname;

    if (!nickname) {
        return interaction.editReply(`O usuário **${member.displayName}** não possui um nickname configurado neste servidor.`);
    }

    const match = nickname.match(/(.*) \(@(.+)\)/);
    
    if (!match) {
        return interaction.editReply(`O nickname do usuário **${member.displayName}** (\`${nickname}\`) não está no formato esperado "DisplayName (@RobloxUsername)".`);
    }

    const robloxUsername = match[2];
    
    if (!robloxUsername) {
        return interaction.editReply('Não foi possível extrair um nome de usuário Roblox do nickname.');
    }

    await interaction.editReply(`Nickname encontrado: \`${nickname}\`. Extraído o Roblox Username: \`${robloxUsername}\`. Buscando ID...`);

    try {
        const robloxId = await usernameToId(robloxUsername);

        if (robloxId) {
            await interaction.followUp({ content: `✅ Sucesso! O ID do Roblox para **${robloxUsername}** é: \`${robloxId}\``, ephemeral: true });
        } else {
            await interaction.followUp({ content: `❌ Não foi possível encontrar um ID do Roblox para o usuário **${robloxUsername}**. Verifique se o nome de usuário está correto.`, ephemeral: true });
        }
    } catch (error) {
        console.error('Erro ao chamar a API do Roblox:', error);
        await interaction.followUp({ content: 'Ocorreu um erro ao tentar se comunicar com a API do Roblox.', ephemeral: true });
    }
}
