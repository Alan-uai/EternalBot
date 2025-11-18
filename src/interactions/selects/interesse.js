// src/interactions/selects/interesse.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../utils/raid-data.js';

export const customIdPrefix = 'interesse';

const CATEGORY_NAMES = {
    'w1-19': 'Raids (Mundos 1-19)',
    'w20plus': 'Raids (Mundos 20+)',
    'event': 'Raids de Evento'
};

async function handlePurposeSelect(interaction, purpose) {
    interaction.client.container.interactions.set(`interesse_flow_${interaction.user.id}`, { purpose });

    const categorizedRaids = getAvailableRaids();
    const components = [];

    Object.entries(categorizedRaids).forEach(([category, raids]) => {
        if (raids.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`interesse_raid_${category}`)
                .setPlaceholder(CATEGORY_NAMES[category])
                .addOptions(raids.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(menu));
        }
    });

    await interaction.update({
        content: `Você selecionou **${purpose === 'farm' ? 'Grupo de Farm' : 'Ajuda para Solar'}**. Agora, escolha a raid de interesse:`,
        components,
    });
}

async function handleRaidSelect(interaction) {
    const selectedRaidValue = interaction.values[0];
    const categorizedRaids = getAvailableRaids();
    const allRaidsFlat = Object.values(categorizedRaids).flat();
    const selectedRaidLabel = allRaidsFlat.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;
    
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    flowData.raidName = selectedRaidLabel;
    interaction.client.container.interactions.set(`interesse_flow_${interaction.user.id}`, flowData);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('interesse_target_geral')
                .setLabel('Geral')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('interesse_target_host')
                .setLabel('Host Específico')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.update({
        content: `Raid selecionada: **${selectedRaidLabel}**. \nOnde você quer registrar seu interesse?\n\n- **Geral:** Aparecerá em um painel público para todos verem.\n- **Host Específico:** Notificará um host que você segue.`,
        components: [row],
    });
}

async function handleTargetSelect(interaction, target) {
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    if (!flowData) return interaction.update({ content: 'Sua sessão expirou.', components: [] });

    if (target === 'geral') {
        const { firestore } = initializeFirebase();
        const interestRef = doc(collection(firestore, 'raid_interests'));
        
        await setDoc(interestRef, {
            ...flowData,
            userId: interaction.user.id,
            username: interaction.user.username,
            createdAt: serverTimestamp(),
        });

        await interaction.update({
            content: `✅ Seu interesse em **${flowData.raidName}** para **${flowData.purpose}** foi registrado no painel público!`,
            components: [],
        });
        interaction.client.container.interactions.delete(`interesse_flow_${interaction.user.id}`);
    } else if (target === 'host') {
        // Lógica para selecionar um host
        const { firestore } = initializeFirebase();
        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        const following = userSnap.exists() ? userSnap.data().following || [] : [];
        
        if (following.length === 0) {
            return interaction.update({ content: 'Você não segue nenhum host. Use o comando `/perfil` no perfil de alguém para seguir.', components: [] });
        }

        const hostOptions = await Promise.all(following.map(async (hostId) => {
            const hostUser = await interaction.client.users.fetch(hostId).catch(() => null);
            return {
                label: hostUser ? hostUser.username : `Usuário (ID: ${hostId})`,
                value: hostId,
            };
        }));
        
        const hostMenu = new StringSelectMenuBuilder()
            .setCustomId('interesse_select_host')
            .setPlaceholder('Selecione o host para notificar...')
            .addOptions(hostOptions.slice(0, 25));
            
        await interaction.update({
            content: 'Selecione qual host você quer notificar sobre seu interesse.',
            components: [new ActionRowBuilder().addComponents(hostMenu)],
        });
    }
}

async function handleHostSelect(interaction) {
    const selectedHostId = interaction.values[0];
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    if (!flowData) return interaction.update({ content: 'Sua sessão expirou.', components: [] });

    const { firestore } = initializeFirebase();
    const hostNotificationRef = doc(collection(firestore, 'host_notifications'));

    await setDoc(hostNotificationRef, {
        ...flowData,
        requesterId: interaction.user.id,
        requesterUsername: interaction.user.username,
        hostId: selectedHostId,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    const hostUser = await interaction.client.users.fetch(selectedHostId).catch(()=>null);
    if (hostUser) {
        try {
            await hostUser.send(`🔔 **${interaction.user.username}** registrou interesse em seu grupo de **${flowData.purpose}** para a raid **${flowData.raidName}**!`);
        } catch (e) {
            console.warn(`Não foi possível notificar o host ${hostUser.tag} por DM.`);
        }
    }

    await interaction.update({
        content: `✅ O host **${hostUser?.username || 'selecionado'}** foi notificado sobre seu interesse!`,
        components: [],
    });
    interaction.client.container.interactions.delete(`interesse_flow_${interaction.user.id}`);
}


export async function handleInteraction(interaction, container) {
    const [prefix, action, param] = interaction.customId.split('_');
    if (prefix !== customIdPrefix) return;

    if (interaction.isButton()) {
        if (action === 'purpose') {
            await handlePurposeSelect(interaction, param);
        } else if (action === 'target') {
            await handleTargetSelect(interaction, param);
        }
    } else if (interaction.isStringSelectMenu()) {
        if (action === 'raid') {
            await handleRaidSelect(interaction);
        } else if (action === 'select' && param === 'host') {
            await handleHostSelect(interaction);
        }
    }
}
