// src/commands/utility/demandas.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('demandas')
    .setDescription('Veja e gerencie os interesses de farm/soling que foram enviados para você.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const hostId = interaction.user.id;

    const notificationsRef = collection(firestore, 'host_notifications');
    const q = query(
        notificationsRef, 
        where("hostId", "==", hostId), 
        where("status", "==", "pending"),
        limit(25) // Limita a 25 para não sobrecarregar o menu
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return interaction.editReply({ content: 'Você não tem nenhuma demanda de interesse pendente no momento.' });
    }

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('📢 Suas Demandas de Interesse Pendentes')
        .setDescription('Selecione uma demanda abaixo para gerenciá-la (iniciar o grupo, ver a lista de interessados ou rejeitar).');

    const options = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const requester = await interaction.client.users.fetch(data.requesterId).catch(() => ({ username: data.requesterUsername }));
        return {
            label: `${data.purpose === 'farm' ? '🌾 Farm' : '🆘 Soling'} de ${data.raidName}`,
            description: `Solicitado por: ${requester.username}`,
            value: doc.id // O ID do documento de notificação
        };
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('hostaction_manage_demand')
        .setPlaceholder('Selecione uma demanda para gerenciar...')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.editReply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
    });
}
