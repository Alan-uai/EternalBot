// src/interactions/selects/farming.js
import { ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

// Handle Day Selection
async function handleDaySelect(interaction) {
    const selectedDay = interaction.values[0];
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, { day: selectedDay });

    // Create time options (00:00 to 23:00)
    const timeOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return { label: `${hour}:00`, value: `${hour}:00` };
    });

    const timeMenu = new StringSelectMenuBuilder()
        .setCustomId('farming_select_time')
        .setPlaceholder('Selecione o horário de início...')
        .addOptions(timeOptions);

    const row = new ActionRowBuilder().addComponents(timeMenu);

    await interaction.update({
        content: `Dia selecionado: **${WEEKDAYS_PT[selectedDay]}**. Agora, escolha o horário de início do farm.`,
        components: [row],
    });
}

// Handle Time Selection
async function handleTimeSelect(interaction) {
    const selectedTime = interaction.values[0];
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    flowData.time = selectedTime;
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);
    
    const raids = getAvailableRaids();
    const raidOptions = raids.map(raid => ({ label: raid.label, value: raid.value }));

    const raidMenu = new StringSelectMenuBuilder()
        .setCustomId('farming_select_raid')
        .setPlaceholder('Selecione a raid para farmar...')
        .addOptions(raidOptions.slice(0, 25)); // Max 25 options

    const row = new ActionRowBuilder().addComponents(raidMenu);

    await interaction.update({
        content: `Horário: **${selectedTime}**. Agora, escolha qual raid vocês irão farmar.`,
        components: [row],
    });
}

// Handle Raid Selection
async function handleRaidSelect(interaction) {
    const selectedRaidValue = interaction.values[0];
    const raids = getAvailableRaids();
    const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    flowData.raidName = selectedRaidLabel;
    interaction.client.container.interactions.set(`farming_flow_${interaction.user.id}`, flowData);
    
    // Create quantity options
    const quantityOptions = Array.from({ length: 10 }, (_, i) => {
        const quantity = (i + 1) * 5;
        return { label: `${quantity} raids`, value: String(quantity) };
    });

    const quantityMenu = new StringSelectMenuBuilder()
        .setCustomId('farming_select_quantity')
        .setPlaceholder('Selecione a quantidade média de raids...')
        .addOptions(quantityOptions);

    const row = new ActionRowBuilder().addComponents(quantityMenu);

    await interaction.update({
        content: `Raid: **${selectedRaidLabel}**. Por último, informe a quantidade média de raids que planejam fazer.`,
        components: [row],
    });
}

// Handle Quantity Selection and Finalize
async function handleQuantitySelect(interaction) {
    const selectedQuantity = parseInt(interaction.values[0], 10);
    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    
    const newFarm = {
        hostId: interaction.user.id,
        hostUsername: interaction.user.username,
        dayOfWeek: flowData.day,
        time: flowData.time,
        raidName: flowData.raidName,
        quantity: selectedQuantity,
        participants: [interaction.user.id], // Host is automatically a participant
        createdAt: serverTimestamp(),
    };

    try {
        const { firestore } = initializeFirebase();
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
        // Clean up the temporary data
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
    if (!interaction.isStringSelectMenu()) return;

    const [prefix, action] = interaction.customId.split('_');

    if (prefix !== customIdPrefix) return;

    switch (action) {
        case 'select':
            const subAction = interaction.customId.split('_')[2];
            if (subAction === 'day') await handleDaySelect(interaction);
            if (subAction === 'time') await handleTimeSelect(interaction);
            if (subAction === 'raid') await handleRaidSelect(interaction);
            if (subAction === 'quantity') await handleQuantitySelect(interaction);
            break;
        case 'participate':
             await handleParticipationToggle(interaction);
            break;
        default:
            break;
    }
}
