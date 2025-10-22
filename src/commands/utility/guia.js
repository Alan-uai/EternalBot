// src/commands/utility/guia.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('guia')
    .setDescription('Lista todos os comandos disponíveis e suas funções.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { commands } = interaction.client;
    
    // Filtra comandos que não devem ser mostrados ao usuário
    const visibleCommands = commands.filter(cmd => 
        cmd.data.name !== 'gerenciar' && 
        cmd.data.name !== 'chat' &&
        cmd.data.default_member_permissions === undefined // Esconde comandos de admin
    );

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('Guia de Comandos do Bot')
        .setDescription('Aqui estão todos os comandos que você pode usar:');

    visibleCommands.forEach(command => {
        embed.addFields({
            name: `\`/${command.data.name}\``,
            value: command.data.description || 'Sem descrição.',
            inline: false
        });
    });
    
    embed.addFields({
       name: '`@Gui [sua pergunta]`',
       value: 'Faça qualquer pergunta para a IA sobre o jogo no canal de chat.',
       inline: false
    });

    await interaction.editReply({ embeds: [embed] });
}
