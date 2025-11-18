// src/interactions/buttons/hostaction.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { handleTypeSelection } from './helpers.js';

export const customIdPrefix = 'hostaction';

async function showManagementOptions(interaction, notificationId) {
    const { firestore } = initializeFirebase();
    const notificationRef = doc(firestore, 'host_notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
        return interaction.update({ content: 'Esta demanda não existe mais.', components: [] });
    }

    const data = notificationSnap.data();
    const requester = await interaction.client.users.fetch(data.requesterId).catch(() => ({ username: data.requesterUsername }));
    const purposeText = data.purpose === 'farm' ? 'Grupo de Farm' : 'Ajuda para Solar';

    const embed = new EmbedBuilder()
        .setColor(0x1ABC9C)
        .setTitle(`Gerenciar Demanda: ${purposeText}`)
        .setDescription(`**Raid:** ${data.raidName}\n**Solicitado por:** ${requester.username}`)
        .setFooter({ text: `ID da Demanda: ${notificationId}` });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`hostaction_start_${notificationId}`)
                .setLabel('Iniciar Grupo')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
            new ButtonBuilder()
                .setCustomId(`hostaction_view_${notificationId}`)
                .setLabel('Ver Interessados')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('👀'),
            new ButtonBuilder()
                .setCustomId(`hostaction_reject_${notificationId}`)
                .setLabel('Rejeitar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

    await interaction.update({ embeds: [embed], components: [row] });
}

async function handleStartGroup(interaction, notificationId) {
    const { firestore } = initializeFirebase();
    const notificationRef = doc(firestore, 'host_notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
        return interaction.update({ content: 'Esta demanda não existe mais.', components: [] });
    }

    const { purpose, raidName, requesterId } = notificationSnap.data();
    
    // Marcar a notificação como 'accepted'
    await updateDoc(notificationRef, { status: 'accepted' });

    // Iniciar o fluxo correspondente
    if (purpose === 'farm') {
        // Redireciona para o fluxo de agendamento de farm
        // (Isso precisa de uma implementação futura mais complexa para pré-preencher dados)
         await interaction.update({ content: 'Função de iniciar farm a partir daqui será implementada. Por enquanto, use `/farming` para criar o grupo.', components: [] });
    } else { // soling
        // O host está ajudando. Inicia o fluxo de /soling para o host
        await handleTypeSelection(interaction, 'hosting');
    }
}

async function handleViewInterested(interaction, notificationId) {
    const { firestore } = initializeFirebase();
    const notificationRef = doc(firestore, 'host_notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
        return interaction.reply({ content: 'Esta demanda não existe mais.', ephemeral: true });
    }
    
    const { raidName, purpose } = notificationSnap.data();

    // Busca todos os interessados para essa raid/propósito
    const interestQuery = query(
        collection(firestore, 'raid_interests'),
        where("purpose", "==", purpose),
        where("raidName", "==", raidName)
    );
    
    const snapshot = await getDocs(interestQuery);
    if (snapshot.empty) {
        return interaction.reply({ content: `Ninguém mais registrou interesse em ${purpose} de ${raidName} no momento.`, ephemeral: true });
    }

    const userList = snapshot.docs.map(doc => `• <@${doc.data().userId}> (${doc.data().username})`);

    const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle(`👥 Lista de Interessados para ${raidName} (${purpose})`)
        .setDescription(userList.join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleReject(interaction, notificationId) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const { logger } = interaction.client.container;
    
    const notificationRef = doc(firestore, 'host_notifications', notificationId);
    const notificationSnap = await getDoc(notificationRef);

    if (!notificationSnap.exists()) {
        return interaction.editReply({ content: 'Esta demanda já foi resolvida.', components: [], embeds: [] });
    }

    const { requesterId, raidName, purpose } = notificationSnap.data();
    const requester = await interaction.client.users.fetch(requesterId).catch(() => null);

    if (requester) {
        try {
            await requester.send(`Sua solicitação de interesse para **${raidName}** (${purpose}) foi rejeitada pelo host **${interaction.user.username}** no momento.`);
        } catch (e) {
            logger.warn(`Não foi possível notificar ${requester.tag} sobre a rejeição.`);
        }
    }
    
    // Deleta a notificação do banco de dados
    await deleteDoc(notificationRef);
    
    // Edita a mensagem original da interação para confirmar a ação
    await interaction.editReply({ content: 'A demanda foi rejeitada com sucesso.', components: [], embeds: [] });
}


export async function handleInteraction(interaction, container) {
    const customId = interaction.customId;
    const [prefix, action, param] = customId.split('_');

    if (prefix !== customIdPrefix) return;

    if (interaction.isButton()) {
        const notificationId = param;
        if (action === 'start') {
            await handleStartGroup(interaction, notificationId);
        } else if (action === 'view') {
            await handleViewInterested(interaction, notificationId);
        } else if (action === 'reject') {
            await handleReject(interaction, notificationId);
        }
    } else if (interaction.isStringSelectMenu()) {
        if (action === 'manage' && param === 'demand') {
            const notificationId = interaction.values[0];
            await showManagementOptions(interaction, notificationId);
        }
    }
}
