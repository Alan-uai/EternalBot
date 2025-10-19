// src/commands/utility/clean.js
import { SlashCommandBuilder, PermissionsBitField, ChannelType } from 'discord.js';

const ADMIN_ROLE_ID = '1429318984716521483';

export const data = new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Apaga uma quantidade específica de mensagens (máx 100).')
    .addIntegerOption(option =>
        option.setName('quantidade')
            .setDescription('O número de mensagens para apagar (1-100).')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages); // Restrição inicial para quem pode ver o comando

export async function execute(interaction) {
    // Verificação final do cargo específico
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    const quantidade = interaction.options.getInteger('quantidade');

    if (interaction.channel.type === ChannelType.DM) {
        return interaction.reply({
            content: 'Este comando não pode ser usado em DMs.',
            ephemeral: true
        });
    }

    try {
        await interaction.deferReply({ ephemeral: true });
        
        const deleted = await interaction.channel.bulkDelete(quantidade, true); // O `true` filtra mensagens com mais de 14 dias

        await interaction.editReply({
            content: `Foram apagadas ${deleted.size} mensagens com sucesso!`,
        });

    } catch (error) {
        console.error('Erro ao tentar apagar mensagens em massa:', error);
        await interaction.editReply({
            content: 'Ocorreu um erro ao tentar apagar as mensagens. Eu não posso apagar mensagens com mais de 14 dias.',
        });
    }
}
