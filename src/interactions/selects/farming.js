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
    
    const modal = new ModalBuilder()
        .setCustomId('farming_quantity_modal')
        .setTitle('Quantidade de Raids');

    const quantityInput = new TextInputBuilder()
        .setCustomId('quantity')
        .setLabel("Quantidade média de raids?")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: 10")
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(quantityInput));

    await interaction.showModal(modal);
}

// Handle Modal Submit
async function handleQuantitySubmit(interaction) {
    const selectedQuantityStr = interaction.fields.getTextInputValue('quantity');
    const selectedQuantity = parseInt(selectedQuantityStr, 10);
    
     if (isNaN(selectedQuantity) || selectedQuantity <= 0) {
        return interaction.reply({ content: 'A quantidade deve ser um número positivo.', ephemeral: true });
    }

    const flowData = interaction.client.container.interactions.get(`farming_flow_${interaction.user.id}`);
    
    const { firestore } = initializeFirebase();
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
        webhookUrl: webhookUrl, // Add webhook url to farm data
    };

    try {
        await addDoc(collection(firestore, 'scheduled_farms'), newFarm);

        await interaction.reply({
            content: `✅ **Farm agendado com sucesso!**\nO painel de farms será atualizado em breve com seu agendamento.\n\n- **Dia:** ${WEEKDAYS_PT[newFarm.dayOfWeek]}\n- **Horário:** ${newFarm.time}\n- **Raid:** ${newFarm.raidName}\n- **Quantidade:** ${newFarm.quantity}`,
            ephemeral: true,
        });
    } catch (error) {
        console.error("Erro ao salvar farm agendado:", error);
        await interaction.reply({
            content: '❌ Ocorreu um erro ao tentar agendar seu farm. Por favor, tente novamente.',
            ephemeral: true,
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
        const [prefix, action] = interaction.customId.split('_');

        if (prefix !== customIdPrefix) return;

        switch (action) {
            case 'select':
                const subAction = interaction.customId.split('_')[2];
                if (subAction === 'day') await handleDaySelect(interaction);
                if (subAction === 'time') await handleTimeSelect(interaction);
                if (subAction === 'raid') await handleRaidSelect(interaction);
                break;
            case 'participate':
                 await handleParticipationToggle(interaction);
                break;
            default:
                break;
        }
    } else if (interaction.isModalSubmit()) {
         if (interaction.customId === 'farming_quantity_modal') {
            await handleQuantitySubmit(interaction);
        }
    }
}
