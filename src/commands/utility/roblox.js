// src/commands/utility/roblox.js
import { SlashCommandBuilder } from 'discord.js';
import { usernameToId } from '../../utils/roblox.js';

export const data = new SlashCommandBuilder()
    .setName('roblox')
    .setDescription('Extrai e retorna o Roblox ID de um usuário a partir do seu nickname no servidor.')
    .addUserOption(option =>
        option.setName('usuario')
            .setDescription('O usuário para verificar (padrão: você mesmo).')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const guild = await interaction.client.guilds.fetch(interaction.guildId);
    const member = await guild.members.fetch(targetUser.id);

    if (!member) {
        return interaction.editReply({ content: `Não foi possível encontrar o membro ${targetUser.tag} neste servidor.` });
    }

    const nick = member.nickname;
    if (!nick) {
        return interaction.editReply({ content: `O membro ${member.displayName} não possui um nickname no servidor.` });
    }

    const match = nick.match(/(.*) \(@(.+)\)/);
    if (!match || !match[2]) {
        return interaction.editReply({ content: `O nickname "${nick}" não está no formato esperado "Nome (@UsernameRoblox)".` });
    }

    const robloxUsername = match[2].trim();
    const robloxId = await usernameToId(robloxUsername);

    if (robloxId) {
        await interaction.editReply(`O Roblox ID para "${robloxUsername}" (extraído de ${member.displayName}) é: \`${robloxId}\``);
    } else {
        await interaction.editReply(`Não foi possível encontrar um Roblox ID para o nome de usuário "${robloxUsername}".`);
    }
}

    