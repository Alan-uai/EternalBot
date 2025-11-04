// src/interactions/buttons/dungeonconfig.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { SOLING_CONFIG_BUTTON_ID, CUSTOM_ID_PREFIX as DUNGEON_CONFIG_PREFIX } from '../../commands/utility/dungeonconfig.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const customIdPrefix = DUNGEON_CONFIG_PREFIX;
const SOLING_MODAL_ID = `${customIdPrefix}_soling_modal`;


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

export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === SOLING_CONFIG_BUTTON_ID) {
            await openDungeonSettingsModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === SOLING_MODAL_ID) {
            await handleDungeonSettingsSubmit(interaction);
        }
    }
}
