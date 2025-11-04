// src/commands/utility/farming.js
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('farming')
    .setDescription('Agenda ou visualiza farms de raids.');

export async function execute(interaction) {
    const dayOptions = [
        { label: 'Segunda-feira', value: 'monday' },
        { label: 'Terça-feira', value: 'tuesday' },
        { label: 'Quarta-feira', value: 'wednesday' },
        { label: 'Quinta-feira', value: 'thursday' },
        { label: 'Sexta-feira', value: 'friday' },
        { label: 'Sábado', value: 'saturday' },
        { label: 'Domingo', value: 'sunday' },
    ];

    const dayMenu = new StringSelectMenuBuilder()
        .setCustomId('farming_select_day')
        .setPlaceholder('Selecione o dia para agendar o farm...')
        .addOptions(dayOptions);

    const row = new ActionRowBuilder().addComponents(dayMenu);

    await interaction.reply({
        content: '🗓️ **Agendamento de Farm**\n\nPor favor, selecione o dia da semana em que você deseja agendar o farm. Apenas farms para a semana atual podem ser criados.',
        components: [row],
        ephemeral: true,
    });
}
