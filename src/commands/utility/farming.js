// src/commands/utility/farming.js
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('farming')
    .setDescription('Agenda ou visualiza farms de raids.');

export async function execute(interaction) {
    const weekdays = [
        { key: 'sunday', label: 'Domingo' },
        { key: 'monday', label: 'Segunda-feira' },
        { key: 'tuesday', label: 'Terça-feira' },
        { key: 'wednesday', label: 'Quarta-feira' },
        { key: 'thursday', label: 'Quinta-feira' },
        { key: 'friday', label: 'Sexta-feira' },
        { key: 'saturday', label: 'Sábado' },
    ];

    const todayIndex = new Date().getDay(); // Domingo = 0, Segunda = 1, etc.
    const reorderedWeekdays = [
        ...weekdays.slice(todayIndex),
        ...weekdays.slice(0, todayIndex)
    ];

    const dayOptions = reorderedWeekdays.map((day, index) => {
        const isToday = index === 0;
        return {
            label: isToday ? `${day.label} (hoje)` : day.label,
            value: day.key,
        };
    });

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
