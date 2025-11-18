// src/interactions/selects/forming-groups.js
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, getDocs, collection, query, where, arrayUnion, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { handleTypeSelection as startSolingFlow } from '../buttons/helpers.js';

export const customIdPrefix = ['formingfarm', 'formingsoling'];

// Handle "Quero Participar"
async function handleParticipate(interaction, purpose) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const selectedRaidName = interaction.values[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Convert back from value
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Find all interest documents for this raid and purpose
    const q = query(
        collection(firestore, 'raid_interests'),
        where("purpose", "==", purpose),
        where("raidName", "==", selectedRaidName)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return interaction.editReply({ content: 'Este grupo de interesse não existe mais. Ele pode já ter sido iniciado por um host.' });
    }

    // Since we are not creating a new doc but checking existence, we check all docs found.
    let alreadyJoined = false;
    snapshot.forEach(doc => {
        if (doc.data().userId === userId) {
            alreadyJoined = true;
        }
    });

    if (alreadyJoined) {
        return interaction.editReply({ content: `Você já demonstrou interesse para ${purpose} em ${selectedRaidName}.` });
    }

    // If not joined, create a new interest document for this user
    const interestRef = doc(collection(firestore, 'raid_interests'));
    await setDoc(interestRef, {
        purpose: purpose,
        raidName: selectedRaidName,
        userId: userId,
        username: username,
        createdAt: new Date(),
    });

    return interaction.editReply({ content: `✅ Você foi adicionado à lista de interessados para ${purpose} em **${selectedRaidName}**!` });
}

// Handle "Quero ser o Host"
async function handleHost(interaction, purpose) {
    const selectedRaidValue = interaction.values[0]; // e.g., 'crazy' or 'leaf_raid'
    const selectedRaidName = selectedRaidValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const { firestore } = initializeFirebase();

    // Find all users interested in this specific raid and purpose
    const q = query(
        collection(firestore, 'raid_interests'),
        where("purpose", "==", purpose),
        where("raidName", "==", selectedRaidName)
    );

    const snapshot = await getDocs(q);
    const interestedUsers = snapshot.docs.map(doc => doc.data().userId);
    
    // Store data for the next step
    interaction.client.container.interactions.set(`host_flow_${interaction.user.id}`, {
        purpose,
        raidName: selectedRaidName,
        interestedUsers: [...new Set([interaction.user.id, ...interestedUsers])] // Include host and remove duplicates
    });

    const confirmationRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`forming_confirm_host_${purpose}`)
                .setLabel('Sim, quero ser o Host')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`forming_cancel_host`)
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        content: `Você tem certeza que quer ser o host para o grupo de **${selectedRaidName}** (${purpose})? Isso notificará **${interestedUsers.length}** outro(s) jogador(es).`,
        components: [confirmationRow],
        ephemeral: true,
    });
}

// Handle a host confirming their choice
async function handleConfirmHost(interaction, purpose) {
    const flowData = interaction.client.container.interactions.get(`host_flow_${interaction.user.id}`);
    if (!flowData) {
        return interaction.update({ content: 'Sua sessão de hospedagem expirou.', components: [] });
    }

    if (purpose === 'farm') {
        const timeOptions = Array.from({ length: 24 }, (_, i) => {
            const hour = i.toString().padStart(2, '0');
            return { label: `${hour}:00`, value: `${hour}:00` };
        });

        const timeMenu = new StringSelectMenuBuilder()
            .setCustomId('forming_select_farm_time')
            .setPlaceholder('Selecione o horário de início do Farm...')
            .addOptions(timeOptions);

        await interaction.update({
            content: 'Ótimo! Por favor, selecione o horário para agendar este farm.',
            components: [new ActionRowBuilder().addComponents(timeMenu)]
        });

    } else if (purpose === 'soling') {
        await startSolingFlow(interaction, 'hosting');
        // A resposta para a interação é tratada dentro do startSolingFlow, então não precisamos de update aqui.
    }
}

async function handleCancelHost(interaction) {
    interaction.client.container.interactions.delete(`host_flow_${interaction.user.id}`);
    await interaction.update({ content: 'Ação cancelada.', components: [] });
}

export async function handleInteraction(interaction) {
    const [prefix, action] = interaction.customId.split('_');

    // Handle menu selections from the panels
    if (interaction.isStringSelectMenu()) {
        const purpose = prefix.includes('farm') ? 'farm' : 'soling';
        if (action === 'participate') {
            await handleParticipate(interaction, purpose);
        } else if (action === 'host') {
            await handleHost(interaction, purpose);
        }
    }
    // Handle button clicks from the confirmation flow
    else if (interaction.isButton()) {
        const [_, confirmAction, purpose] = interaction.customId.split('_');
        if (confirmAction === 'confirm') {
            await handleConfirmHost(interaction, purpose);
        } else if (confirmAction === 'cancel') {
            await handleCancelHost(interaction);
        }
    }
}
