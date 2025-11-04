// src/interactions/buttons/dungeonconfig.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { FARMING_CONFIG_BUTTON_ID, SOLING_CONFIG_BUTTON_ID, CUSTOM_ID_PREFIX as DUNGEON_CONFIG_PREFIX } from '../../commands/utility/dungeonconfig.js';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const customIdPrefix = DUNGEON_CONFIG_PREFIX;
const SOLING_MODAL_ID = `${customIdPrefix}_soling_modal`;
const FARMING_SELECT_ID = `${customIdPrefix}_farming_select`;
const FARMING_ACTION_ID = `${customIdPrefix}_farming_action`;
const FARMING_EDIT_MODAL_ID = `${customIdPrefix}_farming_edit_modal`;

const WEEKDAYS_PT = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};


export async function openDungeonSettingsModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const settings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

    const modal = new ModalBuilder()
        .setCustomId(SOLING_MODAL_ID)
        .setTitle('Configurações de Dungeon/Soling');
    
    const serverLinkInput = new TextInputBuilder()
        .setCustomId('server_link')
        .setLabel("Link do seu servidor privado (Opcional)")
        .setStyle(TextInputStyle.Short)
        .setValue(settings.serverLink || '')
        .setRequired(false);

    const alwaysSendInput = new TextInputBuilder()
        .setCustomId('always_send')
        .setLabel("Sempre enviar o link acima? (sim/não)")
        .setStyle(TextInputStyle.Short)
        .setValue(settings.alwaysSendLink ? 'sim' : 'não')
        .setRequired(true);

    const deleteAfterInput = new TextInputBuilder()
        .setCustomId('delete_after')
        .setLabel("Apagar post após X minutos (opcional)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Deixe em branco para não apagar")
        .setValue(String(settings.deleteAfterMinutes || ''))
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(serverLinkInput),
        new ActionRowBuilder().addComponents(alwaysSendInput),
        new ActionRowBuilder().addComponents(deleteAfterInput)
    );

    await interaction.showModal(modal);
}

async function handleDungeonSettingsSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const serverLink = interaction.fields.getTextInputValue('server_link');
    const alwaysSend = interaction.fields.getTextInputValue('always_send').toLowerCase();
    const deleteAfterStr = interaction.fields.getTextInputValue('delete_after');

    if (alwaysSend !== 'sim' && alwaysSend !== 'não') {
        return interaction.editReply({ content: 'Valor inválido para "Sempre enviar o link?". Por favor, use "sim" ou "não".' });
    }
    
    const deleteAfter = parseInt(deleteAfterStr, 10);
    if (deleteAfterStr && (isNaN(deleteAfter) || deleteAfter <= 0)) {
        return interaction.editReply({ content: 'O tempo para apagar deve ser um número positivo de minutos.' });
    }

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    const settings = {
        serverLink: serverLink || null,
        alwaysSendLink: alwaysSend === 'sim',
        deleteAfterMinutes: deleteAfter || null
    };

    try {
        await updateDoc(userRef, { dungeonSettings: settings });
        await interaction.editReply('Suas configurações de dungeon foram salvas com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar configurações de dungeon:", error);
        await interaction.editReply('Ocorreu um erro ao salvar suas configurações.');
    }
}

async function handleOpenFarmingManager(interaction) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const farmsRef = collection(firestore, 'scheduled_farms');
    const q = query(farmsRef, where("hostId", "==", interaction.user.id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return interaction.followUp({ content: 'Você não agendou nenhum farm para gerenciar.', ephemeral: true });
    }

    const farmOptions = querySnapshot.docs.map(doc => {
        const farm = doc.data();
        return {
            label: `${WEEKDAYS_PT[farm.dayOfWeek]} às ${farm.time} - ${farm.raidName}`,
            value: doc.id
        };
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(FARMING_SELECT_ID)
        .setPlaceholder('Selecione o farm que deseja gerenciar...')
        .addOptions(farmOptions);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.followUp({
        content: 'Aqui estão seus farms agendados. Selecione um para editar ou remover.',
        components: [row],
        ephemeral: true
    });
}

async function handleFarmAction(interaction) {
    const farmId = interaction.values[0];
    const { firestore } = initializeFirebase();
    const farmRef = doc(firestore, 'scheduled_farms', farmId);
    const farmSnap = await getDoc(farmRef);
    if (!farmSnap.exists()) {
        return interaction.update({ content: 'Este farm não existe mais.', components: [] });
    }

    const farmData = farmSnap.data();

    // Salva o ID do farm selecionado para os próximos passos
    interaction.client.container.interactions.set(`dungeonconfig_farm_${interaction.user.id}`, farmId);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(FARMING_ACTION_ID)
        .setPlaceholder('Escolha uma ação...')
        .addOptions([
            { label: 'Editar Farm', value: 'edit' },
            { label: 'Remover Farm', value: 'delete' },
        ]);

    await interaction.update({
        content: `Você selecionou o farm: **${WEEKDAYS_PT[farmData.dayOfWeek]} às ${farmData.time} - ${farmData.raidName}**.\nO que você deseja fazer?`,
        components: [new ActionRowBuilder().addComponents(selectMenu)],
    });
}

async function handleFarmActionChoice(interaction) {
    const action = interaction.values[0];
    const farmId = interaction.client.container.interactions.get(`dungeonconfig_farm_${interaction.user.id}`);

    if (!farmId) {
        return interaction.update({ content: 'Sua sessão expirou. Por favor, comece novamente.', components: [] });
    }
    
    const { firestore } = initializeFirebase();
    const farmRef = doc(firestore, 'scheduled_farms', farmId);

    if (action === 'delete') {
        await deleteDoc(farmRef);
        await interaction.update({ content: '✅ O farm agendado foi removido com sucesso.', components: [] });
        interaction.client.container.interactions.delete(`dungeonconfig_farm_${interaction.user.id}`);
    } else if (action === 'edit') {
        const farmSnap = await getDoc(farmRef);
        if (!farmSnap.exists()) {
             return interaction.update({ content: 'Este farm não existe mais.', components: [] });
        }
        const farmData = farmSnap.data();

        const modal = new ModalBuilder()
            .setCustomId(FARMING_EDIT_MODAL_ID)
            .setTitle('Editar Farm Agendado');
        
        const timeInput = new TextInputBuilder()
            .setCustomId('time')
            .setLabel("Novo Horário (HH:MM)")
            .setStyle(TextInputStyle.Short)
            .setValue(farmData.time)
            .setRequired(true);

        const quantityInput = new TextInputBuilder()
            .setCustomId('quantity')
            .setLabel("Nova Quantidade Média")
            .setStyle(TextInputStyle.Short)
            .setValue(String(farmData.quantity))
            .setRequired(true);
        
        modal.addComponents(new ActionRowBuilder().addComponents(timeInput), new ActionRowBuilder().addComponents(quantityInput));
        await interaction.showModal(modal);
    }
}

async function handleFarmEditSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const farmId = interaction.client.container.interactions.get(`dungeonconfig_farm_${interaction.user.id}`);
     if (!farmId) {
        return interaction.editReply({ content: 'Sua sessão expirou. Por favor, comece novamente.' });
    }

    const time = interaction.fields.getTextInputValue('time');
    const quantityStr = interaction.fields.getTextInputValue('quantity');
    const quantity = parseInt(quantityStr, 10);

    if (!/^\d{2}:\d{2}$/.test(time)) {
        return interaction.editReply({ content: 'Formato de horário inválido. Use HH:MM.' });
    }
    if (isNaN(quantity) || quantity <= 0) {
        return interaction.editReply({ content: 'A quantidade deve ser um número positivo.' });
    }

    const { firestore } = initializeFirebase();
    const farmRef = doc(firestore, 'scheduled_farms', farmId);

    try {
        await updateDoc(farmRef, { time, quantity });
        await interaction.editReply('O seu farm agendado foi atualizado com sucesso!');
    } catch(error) {
        console.error("Erro ao editar farm:", error);
        await interaction.editReply('Ocorreu um erro ao atualizar o farm.');
    } finally {
        interaction.client.container.interactions.delete(`dungeonconfig_farm_${interaction.user.id}`);
    }
}


export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === SOLING_CONFIG_BUTTON_ID) {
            await openDungeonSettingsModal(interaction);
        } else if (interaction.customId === FARMING_CONFIG_BUTTON_ID) {
            await handleOpenFarmingManager(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === SOLING_MODAL_ID) {
            await handleDungeonSettingsSubmit(interaction);
        } else if (interaction.customId === FARMING_EDIT_MODAL_ID) {
            await handleFarmEditSubmit(interaction);
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === FARMING_SELECT_ID) {
            await handleFarmAction(interaction);
        } else if (interaction.customId === FARMING_ACTION_ID) {
            await handleFarmActionChoice(interaction);
        }
    }
}
