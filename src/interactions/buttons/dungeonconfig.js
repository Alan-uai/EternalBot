// src/interactions/buttons/dungeonconfig.js
import { openDungeonSettingsModal } from '../../commands/utility/iniciar-perfil.js';
import { SOLING_CONFIG_BUTTON_ID, CUSTOM_ID_PREFIX as DUNGEON_CONFIG_PREFIX } from '../../commands/utility/dungeonconfig.js';
import { doc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const customIdPrefix = DUNGEON_CONFIG_PREFIX;

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
        return interaction.editReply({ content: 'O tempo para apagar deve ser um número positivo de minutos.', ephemeral: true });
    }

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);

    const settings = {
        serverLink: serverLink || null,
        alwaysSendLink: alwaysSend === 'sim',
        deleteAfterMinutes: deleteAfter || null
    };

    try {
        await updateDoc(userRef, { dungeonSettings: settings }, { merge: true });
        await interaction.editReply('Suas configurações de dungeon foram salvas com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar configurações de dungeon:", error);
        await interaction.editReply('Ocorreu um erro ao salvar suas configurações.');
    }
}

export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === SOLING_CONFIG_BUTTON_ID) {
            await openDungeonSettingsModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'dungeonconfig_soling_modal') {
            await handleDungeonSettingsSubmit(interaction);
        }
    }
}
