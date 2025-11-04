// src/interactions/selects/farming.js
import { ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
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


// Handle Day Selection
async function handleDaySelect(interaction) {
    const selectedDay = interaction.values[0];
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, { day: selectedDay });

    // Time options - Part 1 (00:00 - 12:00)
    const timeOptions1 = [];
     for (let i = 0; i <= 12; i++) {
        const hour = i.toString().padStart(2, '0');
        timeOptions1.push({ label: `${hour}:00`, value: `${hour}:00` });
        if (i < 12) { // Adiciona os :30 para as horas antes das 12:00
            timeOptions1.push({ label: `${hour}:30`, value: `${hour}:30` });
        }
    }


    // Time options - Part 2 (12:30 - 23:30)
    const timeOptions2 = [];
     for (let i = 12; i < 24; i++) {
        timeOptions2.push({ label: `${i}:30`, value: `${i}:30` });
        if (i < 23) {
            timeOptions2.push({ label: `${i + 1}:00`, value: `${i + 1}:00` });
        }
    }


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
                .addOptions(raids.slice(0, 25)); // Garante que não ultrapasse o limite
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
    
     const quantityOptions1 = Array.from({ length: 25 }, (_, i) => ({
        label: `${i + 1} vez(es)`,
        value: String(i + 1),
    }));

    const quantityOptions2 = Array.from({ length: 25 }, (_, i) => ({
        label: `${i + 26} vez(es)`,
        value: String(i + 26),
    }));

    const quantityMenu1 = new StringSelectMenuBuilder()
        .setCustomId('farming_select_quantity_1')
        .setPlaceholder('Quantidade (1-25)')
        .addOptions(quantityOptions1);

    const quantityMenu2 = new StringSelectMenuBuilder()
        .setCustomId('farming_select_quantity_2')
        .setPlaceholder('Quantidade (26-50)')
        .addOptions(quantityOptions2);


    await interaction.update({
        content: `Raid selecionada: **${selectedRaidLabel}**. Agora, informe a quantidade média de raids que farão.`,
        components: [
            new ActionRowBuilder().addComponents(quantityMenu1),
            new ActionRowBuilder().addComponents(quantityMenu2)
        ],
    });
}


// Handle Final Quantity Selection
async function handleQuantitySelect(interaction) {
    const selectedQuantity = parseInt(interaction.values[0], 10);
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    
    if (!flowData) {
        return interaction.update({ content: 'Sua sessão expirou. Por favor, comece novamente.', components: [] });
    }

    const { firestore } = initializeFirebase();
    // Fetch the user's settings to get the webhook URL
    const userSnap = await getDoc(doc(firestore, 'users', interaction.user.id));
    const webhookUrl = userSnap.exists() ? userSnap.data()?.dungeonSettings?.farmWebhookUrl : null;
    
    const newFarm = {
        hostId: interaction.user.id,
        hostUsername: interaction.user.username,
        dayOfWeek: flowData.day,
        time: flowData.time,
        raidName: flowData.raidName,
        quantity: selectedQuantity,
        participants: [interaction.user.id],
        createdAt: serverTimestamp(),
        webhookUrl: webhookUrl || null, // Ensure it's null if not found
    };

    try {
        await addDoc(collection(firestore, 'scheduled_farms'), newFarm);

        await interaction.update({
            content: `✅ **Farm agendado com sucesso!**\nO painel de farms será atualizado em breve com seu agendamento.\n\n- **Dia:** ${WEEKDAYS_PT[newFarm.dayOfWeek]}\n- **Horário:** ${newFarm.time}\n- **Raid:** ${newFarm.raidName}\n- **Quantidade:** ${newFarm.quantity}`,
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

    const farmRef = doc(firestore, 'scheduled_farms', farmId);

    try {
        const farmSnap = await getDoc(farmRef);
        if (!farmSnap.exists()) {
            return interaction.reply({ content: 'Este farm não existe mais.', ephemeral: true });
        }

        const farmData = farmSnap.data();
        let participants = farmData.participants || [];
        
        let message;
        if (participants.includes(userId)) {
            // User is already in, so remove them
            participants = participants.filter(pId => pId !== userId);
            message = `Você não está mais participando do farm de **${farmData.raidName}**.`;
        } else {
            // User is not in, so add them
            participants.push(userId);
            message = `✅ Presença confirmada no farm de **${farmData.raidName}** com ${farmData.hostUsername}!`;
        }

        await updateDoc(farmRef, { participants });
        await interaction.reply({ content: message, ephemeral: true });
        // The panel will be updated by the job automatically.
    } catch (error) {
        console.error("Erro ao atualizar participação no farm:", error);
        await interaction.reply({ content: 'Ocorreu um erro ao processar sua solicitação.', ephemeral: true });
    }
}

export async function handleInteraction(interaction) {
    if (interaction.isStringSelectMenu()) {
        const [prefix, action, subAction, category, index] = interaction.customId.split('_');

        if (prefix !== customIdPrefix) return;

        switch (action) {
            case 'select':
                if (subAction === 'day') await handleDaySelect(interaction);
                else if (subAction.startsWith('time')) await handleTimeSelect(interaction);
                else if (subAction === 'raid') await handleRaidSelect(interaction);
                else if (subAction.startsWith('quantity')) await handleQuantitySelect(interaction);
                break;
            case 'participate':
                 await handleParticipationToggle(interaction);
                break;
            default:
                break;
        }
    }
}
