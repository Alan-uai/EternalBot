// src/commands/utility/dungeonconfig.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { openDungeonSettingsModal } from './iniciar-perfil.js';

const CUSTOM_ID_PREFIX = 'dungeonconfig';

export const data = new SlashCommandBuilder()
    .setName('dungeonconfig')
    .setDescription('Abre o painel de configurações para Dungeons (Soling, Farming, etc).');

export async function execute(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`${CUSTOM_ID_PREFIX}_soling_open`)
                .setLabel('Configurações de Soling')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('⚙️'),
            new ButtonBuilder()
                .setCustomId(`${CUSTOM_ID_PREFIX}_farming_open`)
                .setLabel('Farming (Em Breve)')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

    await interaction.reply({
        content: 'Selecione qual painel de configuração de dungeon você deseja abrir:',
        components: [row],
        ephemeral: true,
    });
}

async function handleInteraction(interaction) {
    const { customId, user } = interaction;
    const parts = customId.split('_');
    const [commandName, configType, action] = parts;

    if (commandName !== CUSTOM_ID_PREFIX) return;

    if (interaction.isButton()) {
        if (action === 'open' && configType === 'soling') {
            await openDungeonSettingsModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (action === 'modal' && configType === 'soling') {
            await handleDungeonSettingsSubmit(interaction);
        }
    }
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

export { handleInteraction };
