// src/commands/utility/farmpanel.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } from 'discord.js';

const ADMIN_ROLE_ID = '1429318984716521483';
const FARMING_CHANNEL_ID = '1429295728379039756';

export const data = new SlashCommandBuilder()
    .setName('farmpanel')
    .setDescription('Posta o painel de controle de farming no canal.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    if (interaction.channelId !== FARMING_CHANNEL_ID) {
        return interaction.reply({
            content: `Este comando só pode ser usado no canal <#${FARMING_CHANNEL_ID}>.`,
            ephemeral: true,
        });
    }

    await interaction.deferReply();

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'long' });

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`Painel de Farm - ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`)
        .setDescription('Use os botões abaixo para ver os farms agendados, se inscrever ou gerenciar seus grupos.')
        .setImage('https://via.placeholder.com/800x200.png?text=Farms+de+Hoje') // Placeholder image
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('farm_nav_prev')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('farm_subscribe')
                .setEmoji('📝')
                .setLabel('Inscrever')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('farm_groups')
                .setEmoji('👥')
                .setLabel('Grupos')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('farm_nav_next')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.editReply({ embeds: [embed], components: [row] });
}

async function handleInteraction(interaction) {
    // Logic for handling panel buttons will go here
}

export { handleInteraction };

    