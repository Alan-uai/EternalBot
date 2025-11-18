// src/interactions/selects/interesse.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp, collection, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../utils/raid-data.js';

export const customIdPrefix = 'interesse';

const CATEGORY_NAMES = {
    'w1-19': 'Raids (Mundos 1-19)',
    'w20plus': 'Raids (Mundos 20+)',
    'event': 'Raids de Evento'
};

// Handle initial purpose selection (Farm or Soling)
async function handlePurposeSelect(interaction, purpose) {
    interaction.client.container.interactions.set(`interesse_flow_${interaction.user.id}`, { purpose });

    const categorizedRaids = getAvailableRaids();
    const components = [];

    Object.entries(categorizedRaids).forEach(([category, raids]) => {
        if (raids.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`interesse_raid_${category}`)
                .setPlaceholder(CATEGORY_NAMES[category])
                .setMinValues(1)
                .setMaxValues(Math.min(raids.length, 25)) // Allow multi-select
                .addOptions(raids.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(menu));
        }
    });

    await interaction.update({
        content: `Você selecionou **${purpose === 'farm' ? 'Grupo de Farm' : 'Ajuda para Solar'}**. Agora, escolha a(s) raid(s) de interesse (você pode selecionar mais de uma):`,
        components,
    });
}

// Handle raid selection (now potentially multiple)
async function handleRaidSelect(interaction) {
    const selectedRaidValues = interaction.values;
    const categorizedRaids = getAvailableRaids();
    const allRaidsFlat = Object.values(categorizedRaids).flat();
    
    const selectedRaidLabels = selectedRaidValues.map(value => {
        return allRaidsFlat.find(r => r.value === value)?.label || value;
    });
    
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    flowData.raidNames = selectedRaidLabels; // Store array of names
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
        content: `Raids selecionadas: **${selectedRaidLabels.join(', ')}**. \nOnde você quer registrar seu interesse?\n\n- **Geral:** Aparecerá em um painel público para todos verem.\n- **Host Específico:** Notificará um host que você segue.`,
        components: [row],
    });
}

// Handle target selection (Geral or Host)
async function handleTargetSelect(interaction, target) {
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    if (!flowData) return interaction.update({ content: 'Sua sessão expirou.', components: [] });

    if (target === 'geral') {
        const { firestore } = initializeFirebase();
        const batch = writeBatch(firestore);
        
        // Create a separate interest document for each selected raid
        flowData.raidNames.forEach(raidName => {
            const interestRef = doc(collection(firestore, 'raid_interests'));
            batch.set(interestRef, {
                purpose: flowData.purpose,
                raidName: raidName, // Save one raid name per document
                userId: interaction.user.id,
                username: interaction.user.username,
                createdAt: serverTimestamp(),
            });
        });
        
        await batch.commit();

        await interaction.update({
            content: `✅ Seu interesse em **${flowData.raidNames.join(', ')}** para **${flowData.purpose}** foi registrado no painel público!`,
            components: [],
        });
        interaction.client.container.interactions.delete(`interesse_flow_${interaction.user.id}`);
    
    } else if (target === 'host') {
        // A interação será atualizada pela função handleHostSelect
        await handleHostSelect(interaction, true);
    }
}

// Handle specific host selection
async function handleHostSelect(interaction, isInitialCall = false) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const following = userSnap.exists() ? userSnap.data().following || [] : [];
    
    if (following.length === 0) {
        const responseOptions = { content: 'Você não segue nenhum host. Use o comando `/perfil` no perfil de alguém para seguir.', components: [] };
        // Se for a chamada inicial do botão, atualiza. Se for do menu, responde.
        return isInitialCall ? interaction.update(responseOptions) : interaction.reply(responseOptions);
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
        
    const responseOptions = {
        content: 'Selecione qual host você quer notificar sobre seu interesse.',
        components: [new ActionRowBuilder().addComponents(hostMenu)],
    };

    // Apenas atualiza a interação. A resposta final virá do handler do menu.
    await interaction.update(responseOptions);
}


async function handleHostNotification(interaction) {
    const selectedHostId = interaction.values[0];
    const flowData = interaction.client.container.interactions.get(`interesse_flow_${interaction.user.id}`);
    if (!flowData) return interaction.update({ content: 'Sua sessão expirou.', components: [] });

    const { firestore } = initializeFirebase();
    const { logger } = interaction.client.container;
    const batch = writeBatch(firestore);
    
    const requesterMember = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
    const requesterDisplayName = requesterMember ? requesterMember.displayName : interaction.user.username;

    // Create a notification for each selected raid
    flowData.raidNames.forEach(raidName => {
        const hostNotificationRef = doc(collection(firestore, 'host_notifications'));
        batch.set(hostNotificationRef, {
            purpose: flowData.purpose,
            raidName: raidName,
            requesterId: interaction.user.id,
            requesterUsername: requesterDisplayName, // Usando displayName
            hostId: selectedHostId,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();

    const hostUser = await interaction.client.users.fetch(selectedHostId).catch(()=>null);
    if (hostUser) {
        try {
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('🔔 Novo Interesse Registrado!')
                .setDescription(`**${requesterDisplayName}** registrou interesse em seu grupo de **${flowData.purpose}** para a(s) raid(s): **${flowData.raidNames.join(', ')}**!`)
                .setTimestamp();
            
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`hostaction_start_${flowData.purpose}_${flowData.raidNames.join(',')}_${interaction.user.id}`)
                        .setLabel('🚀 Iniciar Grupo Agora')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`hostaction_view_${flowData.purpose}_${flowData.raidNames.join(',')}`)
                        .setLabel('👀 Ver Interessados')
                        .setStyle(ButtonStyle.Secondary)
                );

            await hostUser.send({ embeds: [embed], components: [actionRow] });
        } catch (e) {
            logger.warn(`Não foi possível notificar o host ${hostUser.tag} por DM.`);
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
            await handleHostNotification(interaction);
        }
    }
}