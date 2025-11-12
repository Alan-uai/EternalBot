// src/interactions/selects/farming.js
import { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, arrayUnion, arrayRemove, getDocs, where, query } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const customIdPrefix = 'farming';

const WEEKDAYS_PT = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

const CATEGORY_NAMES = {
    'w1-19': 'Raids (Mundos 1-19)',
    'w20plus': 'Raids (Mundos 20+)',
    'event': 'Raids de Evento'
};

const OPTIONS_MODAL_ID = `${customIdPrefix}_options_modal`;
const RESTRICTIONS_MODAL_ID = `${customIdPrefix}_restrictions_modal`;
const CUSTOM_TAG_MODAL_ID = `${customIdPrefix}_tag_modal`;

// Função para converter notações (k, M, B, T...) em números
function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const suffixes = { k: 1e3, m: 1e6, b: 1e9, t: 1e12, qd: 1e15, qn: 1e18, sx: 1e21, sp: 1e24, o: 1e27, n: 1e30, de: 1e33, ud: 1e36, dd: 1e39, td: 1e42, qdd: 1e45, qnd: 1e48, sxd: 1e51, spd: 1e54, ocd: 1e57, nvd: 1e60, vgn: 1e63, uvg: 1e66, dvg: 1e69, tvg: 1e72, qtv: 1e75, qnv: 1e78, sev: 1e81, spg: 1e84, ovg: 1e87, nvg: 1e90, tgn: 1e93, utg: 1e96, dtg: 1e99, tstg: 1e102, qtg: 1e105, qntg: 1e108, sstg: 1e111, sptg: 1e114, octg: 1e117, notg: 1e120, qdr: 1e123 };
    const numPart = parseFloat(value);
    const suffix = value.replace(/[\d.-]/g, '').toLowerCase();
    return numPart * (suffixes[suffix] || 1);
}

// Handle Day Selection
async function handleDaySelect(interaction) {
    const selectedDay = interaction.values[0];
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, { day: selectedDay });

    const timeOptions1 = Array.from({ length: 25 }, (_, i) => {
        const hour = Math.floor(i / 2).toString().padStart(2, '0');
        const minute = i % 2 === 0 ? '00' : '30';
        return { label: `${hour}:${minute}`, value: `${hour}:${minute}` };
    });
     const timeOptions2 = Array.from({ length: 23 }, (_, i) => {
        const baseHour = 12;
        const hour = (baseHour + Math.floor((i+1) / 2)).toString().padStart(2, '0');
        const minute = (i+1) % 2 === 0 ? '00' : '30';
        return { label: `${hour}:${minute}`, value: `${hour}:${minute}` };
    });

    const timeMenu1 = new StringSelectMenuBuilder()
        .setCustomId('farming_select_time_1')
        .setPlaceholder('Horário (00:00 - 12:00)')
        .addOptions(timeOptions1);

    const timeMenu2 = new StringSelectMenuBuilder()
        .setCustomId('farming_select_time_2')
        .setPlaceholder('Horário (12:30 - 23:30)')
        .addOptions(timeOptions2);


    await interaction.update({
        content: `Dia selecionado: **${WEEKDAYS_PT[selectedDay]}**. Agora, escolha o horário de início do farm.`,
        components: [new ActionRowBuilder().addComponents(timeMenu1), new ActionRowBuilder().addComponents(timeMenu2)],
    });
}

// Handle Time Selection
async function handleTimeSelect(interaction) {
    const selectedTime = interaction.values[0];
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    flowData.time = selectedTime;
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);
    
    const categorizedRaids = getAvailableRaids();
    const components = [];
    
    Object.entries(categorizedRaids).forEach(([category, raids]) => {
        if (raids.length > 0) {
            const menu = new StringSelectMenuBuilder()
                .setCustomId(`farming_select_raid_${category}`)
                .setPlaceholder(CATEGORY_NAMES[category])
                .addOptions(raids.slice(0, 25));
            components.push(new ActionRowBuilder().addComponents(menu));
        }
    });

    await interaction.update({
        content: `Horário: **${selectedTime}**. Agora, escolha qual raid vocês irão farmar.`,
        components,
    });
}

// Handle Raid Selection
async function handleRaidSelect(interaction) {
    const selectedRaidValue = interaction.values[0];
    
    const categorizedRaids = getAvailableRaids();
    const allRaidsFlat = Object.values(categorizedRaids).flat();
    const selectedRaidLabel = allRaidsFlat.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    flowData.raidName = selectedRaidLabel;
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);
    
    const quantityOptions = Array.from({ length: 25 }, (_, i) => ({
        label: `${i + 1} vez(es)`,
        value: String(i + 1),
    }));

    const quantityMenu = new StringSelectMenuBuilder()
        .setCustomId('farming_select_quantity')
        .setPlaceholder('Quantidade Média de Raids')
        .addOptions(quantityOptions);

    await interaction.update({
        content: `Raid selecionada: **${selectedRaidLabel}**. Agora, informe a quantidade média de raids que farão.`,
        components: [new ActionRowBuilder().addComponents(quantityMenu)],
    });
}

// Handle Quantity Selection -> Show Optional Panel
async function handleQuantitySelect(interaction) {
    const selectedQuantity = parseInt(interaction.values[0], 10);
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    flowData.quantity = selectedQuantity;
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);

    const optionsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`${customIdPrefix}_btn_restrictions`).setLabel('Restrições').setStyle(ButtonStyle.Secondary).setEmoji('🚫'),
        new ButtonBuilder().setCustomId(`${customIdPrefix}_btn_message`).setLabel('Mensagem').setStyle(ButtonStyle.Secondary).setEmoji('💬'),
        new ButtonBuilder().setCustomId(`${customIdPrefix}_btn_tag`).setLabel('Chamada').setStyle(ButtonStyle.Secondary).setEmoji('🏷️'),
        new ButtonBuilder().setCustomId(`${customIdPrefix}_btn_finish`).setLabel('Finalizar e Agendar').setStyle(ButtonStyle.Success).setEmoji('✅')
    );

    await interaction.update({
        content: `**Agendamento Básico Concluído.**\nDia: ${WEEKDAYS_PT[flowData.day]}, Horário: ${flowData.time}, Raid: ${flowData.raidName}, Qtd: ${flowData.quantity}\n\nVocê pode finalizar agora ou adicionar configurações opcionais.`,
        components: [optionsRow]
    });
}

// --- Optional Configuration Handlers ---
async function handleOptionsButtons(interaction) {
    const action = interaction.customId.split('_')[2];
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);

    if (!flowData) {
        return interaction.update({ content: 'Sua sessão expirou.', components: [] });
    }

    switch (action) {
        case 'restrictions': {
            const modal = new ModalBuilder().setCustomId(RESTRICTIONS_MODAL_ID).setTitle('Definir Restrições (Opcional)');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('dps').setLabel("DPS Mínimo").setStyle(TextInputStyle.Short).setRequired(false).setValue(flowData.restrictions?.dps || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('rank').setLabel("Rank Mínimo").setStyle(TextInputStyle.Short).setRequired(false).setValue(flowData.restrictions?.rank || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('world').setLabel("Mundo Mínimo").setStyle(TextInputStyle.Short).setRequired(false).setValue(flowData.restrictions?.world || ''))
            );
            await interaction.showModal(modal);
            break;
        }
        case 'message': {
            const modal = new ModalBuilder().setCustomId(OPTIONS_MODAL_ID).setTitle('Opções de Anúncio');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('customMessage').setLabel("Mensagem Personalizada").setStyle(TextInputStyle.Paragraph).setRequired(false).setValue(flowData.customMessage || ''))
            );
            await interaction.showModal(modal);
            break;
        }
        case 'tag': {
             const { firestore } = initializeFirebase();
             const userSnap = await getDoc(doc(firestore, 'users', interaction.user.id));
             const prefilledTag = userSnap.exists() ? userSnap.data().hostTag || '' : '';

            const modal = new ModalBuilder().setCustomId(CUSTOM_TAG_MODAL_ID).setTitle('Opções de Anúncio');
            modal.addComponents(
                 new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('customTag').setLabel("Nome da Chamada (Cargo)").setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('Ex: Farm dos Campeões').setValue(flowData.customTag || prefilledTag))
            );
             await interaction.showModal(modal);
            break;
        }
        case 'finish':
            await handleFinish(interaction, flowData);
            break;
    }
}

async function handleOptionsModal(interaction) {
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    if (!flowData) {
        return interaction.reply({ content: 'Sua sessão expirou.', ephemeral: true });
    }
    
    if (interaction.customId === OPTIONS_MODAL_ID) {
        flowData.customMessage = interaction.fields.getTextInputValue('customMessage');
    }
    
    if (interaction.customId === CUSTOM_TAG_MODAL_ID) {
        flowData.customTag = interaction.fields.getTextInputValue('customTag');
    }
    
    if(interaction.customId === RESTRICTIONS_MODAL_ID) {
        flowData.restrictions = {
            dps: interaction.fields.getTextInputValue('dps') || null,
            rank: interaction.fields.getTextInputValue('rank') || null,
            world: interaction.fields.getTextInputValue('world') || null,
        };
    }

    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);
    await interaction.update({ content: 'Configuração opcional salva! Você pode adicionar mais ou finalizar.', components: interaction.message.components });
}

// Handle Final Scheduling
async function handleFinish(interaction, flowData) {
    const { firestore } = initializeFirebase();
    
    const newFarm = {
        hostId: interaction.user.id,
        hostUsername: interaction.user.username,
        dayOfWeek: flowData.day,
        time: flowData.time,
        raidName: flowData.raidName,
        quantity: flowData.quantity,
        participants: [interaction.user.id],
        createdAt: serverTimestamp(),
        announced5m: false,
        announcedOpen: false,
        announcementId: null,
        tempRoleId: null,
        // Optional data
        customMessage: flowData.customMessage || null,
        customTag: flowData.customTag || null,
        restrictions: flowData.restrictions || null,
    };

    try {
        await addDoc(collection(firestore, 'scheduled_farms'), newFarm);

        await interaction.update({
            content: `✅ **Farm agendado com sucesso!**\nO painel de farms será atualizado com seu agendamento.\n\n- **Dia:** ${WEEKDAYS_PT[newFarm.dayOfWeek]}\n- **Horário:** ${newFarm.time}\n- **Raid:** ${newFarm.raidName}\n- **Quantidade:** ${newFarm.quantity}`,
            components: [],
        });
    } catch (error) {
        console.error("Erro ao salvar farm agendado:", error);
        await interaction.update({
            content: '❌ Ocorreu um erro ao tentar agendar seu farm. Por favor, tente novamente.',
            components: [],
        });
    } finally {
        interaction.client.container.interactions.delete(`farming_flow_${interaction.user.id}`);
    }
}

// Handle participation toggle from the panel
async function handleParticipationToggle(interaction) {
    const { firestore } = initializeFirebase();
    const farmId = interaction.values[0];
    const userId = interaction.user.id;

    if (farmId === 'none' || farmId === 'no_farm') {
        return interaction.update({ content: 'Nenhum farm disponível para interação.', components: [] });
    }

    const farmRef = doc(firestore, 'scheduled_farms', farmId);
    const farmSnap = await getDoc(farmRef);
    if (!farmSnap.exists()) {
        return interaction.reply({ content: 'Este farm não está mais disponível.', ephemeral: true });
    }

    const farmData = farmSnap.data();

    // Host view: if host clicks their own farm, show participants
    if (userId === farmData.hostId) {
        const participants = farmData.participants || [];
        const participantMentions = participants.length > 0 ? participants.map(pId => `<@${pId}>`).join('\n') : 'Nenhum participante ainda.';
        
        const embed = new EmbedBuilder()
            .setColor(0x1ABC9C)
            .setTitle(`👥 Participantes de ${farmData.raidName} às ${farmData.time}`)
            .setDescription(participantMentions);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // User view: check restrictions and toggle participation
    await interaction.deferReply({ ephemeral: true });

    // Check restrictions
    if (farmData.restrictions && (farmData.restrictions.dps || farmData.restrictions.rank || farmData.restrictions.world)) {
        const userRef = doc(firestore, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return interaction.editReply({ content: 'Você precisa ter um perfil (`/perfil`) para entrar em farms com restrições.' });
        }

        const userData = userSnap.data();
        let meetsRequirements = true;
        let unmetReasons = [];
        let profileIsIncomplete = false;
        
        const requiredDps = farmData.restrictions.dps;
        const requiredRank = farmData.restrictions.rank;
        const requiredWorld = farmData.restrictions.world;

        if (requiredDps && !userData.dps) profileIsIncomplete = true;
        if (requiredRank && !userData.rank) profileIsIncomplete = true;
        if (requiredWorld && !userData.currentWorld) profileIsIncomplete = true;

        if (profileIsIncomplete) {
            return interaction.editReply({ content: 'Seu perfil está incompleto. Por favor, use o comando `/perfil` para adicionar suas informações de DPS, Rank e Mundo antes de entrar neste farm.' });
        }

        if (requiredDps && parseNumber(userData.dps) < parseNumber(requiredDps)) {
            meetsRequirements = false;
            unmetReasons.push(`DPS (Seu: ${userData.dps} | Req: ${requiredDps})`);
        }
        if (requiredRank && (userData.rank || 0) < parseInt(requiredRank)) {
            meetsRequirements = false;
            unmetReasons.push(`Rank (Seu: ${userData.rank || 'N/A'} | Req: ${requiredRank})`);
        }
        if (requiredWorld && (userData.currentWorld || 0) < parseInt(requiredWorld)) {
            meetsRequirements = false;
            unmetReasons.push(`Mundo (Seu: ${userData.currentWorld || 'N/A'} | Req: ${requiredWorld})`);
        }

        if (!meetsRequirements) {
            const hostUser = await interaction.client.users.fetch(farmData.hostId).catch(() => ({ username: 'o host' }));
            
            const farmsRef = collection(firestore, 'scheduled_farms');
            const sameRaidQuery = query(farmsRef, where("raidName", "==", farmData.raidName), where("hostId", "!=", farmData.hostId));
            const otherSameRaidFarmsSnap = await getDocs(sameRaidQuery);
            
            let responseContent = `Perdão🙏, porém o senhor(a) **${hostUser.username}** ativou restrições aos quais você não tem os requeridos.\nMotivos: ${unmetReasons.join(', ')}.`;
            const components = [];

            if (!otherSameRaidFarmsSnap.empty) {
                responseContent += "\n\nTente outro do mesmo Farm:";
                const otherFarmOptions = otherSameRaidFarmsSnap.docs.map(fDoc => ({
                    label: `${fDoc.data().time} - Host: ${fDoc.data().hostUsername}`,
                    value: fDoc.id,
                }));
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('farming_participate')
                    .setPlaceholder('Tente outro farm para esta mesma raid:')
                    .addOptions(otherFarmOptions);
                components.push(new ActionRowBuilder().addComponents(selectMenu));
            } else {
                responseContent += "\n\nTente outro Farm, selecionando algum que te agrade no menu do painel.";
            }

            return interaction.editReply({ content: responseContent, components });
        }
    }

    const isParticipating = farmData.participants.includes(userId);
    if (isParticipating) {
        await updateDoc(farmRef, { participants: arrayRemove(userId) });
        await interaction.editReply({ content: `Você removeu sua presença do farm de **${farmData.raidName}** às ${farmData.time}.` });
    } else {
        await updateDoc(farmRef, { participants: arrayUnion(userId) });
        await interaction.editReply({ content: `Sua presença foi confirmada no farm de **${farmData.raidName}** às ${farmData.time}!` });
    }
}


export async function handleInteraction(interaction, container) {
    if (interaction.isStringSelectMenu()) {
        const [prefix, action, ...rest] = interaction.customId.split('_');
        if (prefix !== customIdPrefix) return;

        switch (action) {
            case 'select':
                const subAction = rest[0];
                if (subAction === 'day') await handleDaySelect(interaction);
                else if (subAction.startsWith('time')) await handleTimeSelect(interaction);
                else if (subAction === 'raid') await handleRaidSelect(interaction);
                else if (subAction === 'quantity') await handleQuantitySelect(interaction);
                break;
            case 'participate':
                 await handleParticipationToggle(interaction);
                break;
        }
    } else if (interaction.isButton()) {
         const [prefix, action] = interaction.customId.split('_');
         if(prefix !== customIdPrefix || action !== 'btn') return;
         await handleOptionsButtons(interaction);
    } else if (interaction.isModalSubmit()) {
        if(interaction.customId === OPTIONS_MODAL_ID || interaction.customId === RESTRICTIONS_MODAL_ID || interaction.customId === CUSTOM_TAG_MODAL_ID) {
            await handleOptionsModal(interaction);
        }
    }
}
