// src/interactions/buttons/dungeonconfig.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { CUSTOM_ID_PREFIX as DUNGEON_CONFIG_PREFIX, SOLING_CONFIG_BUTTON_ID, FARMING_CONFIG_BUTTON_ID, TAG_CONFIG_BUTTON_ID, NOTIFICATIONS_CONFIG_BUTTON_ID } from '../../commands/utility/dungeonconfig.js';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';

export const customIdPrefix = DUNGEON_CONFIG_PREFIX;

const SOLING_MODAL_ID = `${customIdPrefix}_soling_modal`;
const TAG_MODAL_ID = `${customIdPrefix}_tag_modal`;
const FARMING_SELECT_ID = `${customIdPrefix}_farming_select`;
const FARMING_ACTION_ID = `${customIdPrefix}_farming_action`;
const FARMING_EDIT_MODAL_ID = `${customIdPrefix}_farming_edit_modal`;

// IDs for Notification Panel
const NOTIFICATIONS_DM_TOGGLE_ID = `${customIdPrefix}_notify_dm_toggle`;
const NOTIFICATIONS_RAID_SELECT_ID = `${customIdPrefix}_notify_raid_select`;
const NOTIFICATIONS_HOST_SELECT_ID = `${customIdPrefix}_notify_host_select`;
const NOTIFICATIONS_HOST_TYPE_SELECT_ID = `${customIdPrefix}_notify_host_type_select`;


const WEEKDAYS_PT = {
    monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo',
};

async function openSolingSettingsModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const settings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

    const modal = new ModalBuilder().setCustomId(SOLING_MODAL_ID).setTitle('Configurações de /soling');
    
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('server_link').setLabel("Link do seu servidor privado (Opcional)").setStyle(TextInputStyle.Short).setValue(settings.serverLink || '').setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('always_send').setLabel("Sempre enviar o link acima? (sim/não)").setStyle(TextInputStyle.Short).setValue(settings.alwaysSendLink ? 'sim' : 'não').setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
             new TextInputBuilder().setCustomId('delete_after').setLabel("Apagar post após X minutos (opcional)").setStyle(TextInputStyle.Short).setPlaceholder("Deixe em branco para não apagar").setValue(String(settings.deleteAfterMinutes || '')).setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

async function handleSolingSettingsSubmit(interaction) {
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
        await interaction.editReply('Suas configurações de /soling foram salvas com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar configurações de /soling:", error);
        await interaction.editReply('Ocorreu um erro ao salvar suas configurações.');
    }
}

async function openTagModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const hostTag = userSnap.exists() ? userSnap.data().hostTag || '' : '';

    const modal = new ModalBuilder().setCustomId(TAG_MODAL_ID).setTitle('Definir Tag de Host');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('host_tag').setLabel("Sua Tag para anúncios de Farm").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Farm dos Campeões').setValue(hostTag).setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

async function handleTagSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const hostTag = interaction.fields.getTextInputValue('host_tag');
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    try {
        await updateDoc(userRef, { hostTag: hostTag || null });
        await interaction.editReply(`Sua tag de host foi definida como: "${hostTag || 'Nenhuma'}".`);
    } catch (error) {
        console.error("Erro ao salvar tag de host:", error);
        await interaction.editReply('Ocorreu um erro ao salvar sua tag.');
    }
}

async function handleOpenFarmingManager(interaction) {
    // ... (This function remains unchanged)
}
async function handleFarmAction(interaction) {
    // ... (This function remains unchanged)
}
async function handleFarmActionChoice(interaction) {
    // ... (This function remains unchanged)
}
async function handleFarmEditSubmit(interaction) {
    // ... (This function remains unchanged)
}

async function openNotificationsPanel(interaction) {
    const { firestore, client } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const notificationPrefs = userData.notificationPrefs || {};

    const dmEnabled = notificationPrefs.dmEnabled !== false; // Padrão é true
    const raidInterests = notificationPrefs.raidInterests || [];
    const following = userData.following || [];

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🔔 Preferências de Notificação');

    const dmToggle = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(NOTIFICATIONS_DM_TOGGLE_ID)
            .setLabel(`Notificações por DM: ${dmEnabled ? 'Ligadas' : 'Desligadas'}`)
            .setStyle(dmEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
    );

    const availableRaids = getAvailableRaids();
    const raidOptions = Object.values(availableRaids).flat().map(raid => ({
        label: raid.label,
        value: raid.value,
        default: raidInterests.includes(raid.value)
    })).slice(0, 25); // Limita a 25 para o menu

    const raidSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(NOTIFICATIONS_RAID_SELECT_ID)
            .setPlaceholder('Selecione seus interesses de /soling...')
            .setMinValues(0)
            .setMaxValues(raidOptions.length)
            .addOptions(raidOptions.length > 0 ? raidOptions : [{label: 'Nenhuma raid disponível', value: 'none'}])
    );
    
    const components = [dmToggle, raidSelect];

    if (following.length > 0) {
        const hostOptions = await Promise.all(following.map(async (hostId) => {
            const hostUser = await interaction.client.users.fetch(hostId).catch(() => null);
            return {
                label: hostUser ? hostUser.username : `Usuário (ID: ${hostId})`,
                value: hostId,
                default: (notificationPrefs.hostSettings?.[hostId]?.enabled) !== false
            };
        }));

        const hostSelect = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(NOTIFICATIONS_HOST_SELECT_ID)
                .setPlaceholder('Gerenciar notificações de hosts que você segue...')
                .setMinValues(0)
                .setMaxValues(hostOptions.length)
                .addOptions(hostOptions)
        );
        components.push(hostSelect);
    } else {
        embed.addFields({name: 'Hosts Seguidos', value: 'Você não segue nenhum host. Use o botão "Seguir" no perfil de outros jogadores.'});
    }

    await interaction.reply({
        embeds: [embed],
        components,
        ephemeral: true
    });
}

async function handleDmToggle(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? (userSnap.data().notificationPrefs?.dmEnabled !== false) : true;
    
    await updateDoc(userRef, { 'notificationPrefs.dmEnabled': !currentStatus });
    await openNotificationsPanel(interaction.message.interaction);
    await interaction.deferUpdate();
}

async function handleRaidInterestSelect(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await updateDoc(userRef, { 'notificationPrefs.raidInterests': interaction.values });
    await openNotificationsPanel(interaction.message.interaction);
    await interaction.deferUpdate();
}

async function handleHostNotificationToggle(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const following = userSnap.exists() ? userSnap.data().following || [] : [];
    
    const hostSettings = {};
    following.forEach(hostId => {
        hostSettings[hostId] = { enabled: interaction.values.includes(hostId) };
    });

    await updateDoc(userRef, { 'notificationPrefs.hostSettings': hostSettings });
    await openNotificationsPanel(interaction.message.interaction);
    await interaction.deferUpdate();
}


export async function handleInteraction(interaction, container) {
    if (interaction.isButton()) {
        if (interaction.customId === SOLING_CONFIG_BUTTON_ID) {
            await openSolingSettingsModal(interaction);
        } else if (interaction.customId === FARMING_CONFIG_BUTTON_ID) {
            await handleOpenFarmingManager(interaction);
        } else if (interaction.customId === TAG_CONFIG_BUTTON_ID) {
            await openTagModal(interaction);
        } else if (interaction.customId === NOTIFICATIONS_CONFIG_BUTTON_ID) {
            await openNotificationsPanel(interaction);
        } else if (interaction.customId === NOTIFICATIONS_DM_TOGGLE_ID) {
            await handleDmToggle(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === SOLING_MODAL_ID) {
            await handleSolingSettingsSubmit(interaction);
        } else if (interaction.customId === TAG_MODAL_ID) {
            await handleTagSubmit(interaction);
        } else if (interaction.customId === FARMING_EDIT_MODAL_ID) {
            await handleFarmEditSubmit(interaction);
        }
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === FARMING_SELECT_ID) {
            await handleFarmAction(interaction);
        } else if (interaction.customId === FARMING_ACTION_ID) {
            await handleFarmActionChoice(interaction);
        } else if (interaction.customId === NOTIFICATIONS_RAID_SELECT_ID) {
            await handleRaidInterestSelect(interaction);
        } else if (interaction.customId === NOTIFICATIONS_HOST_SELECT_ID) {
            await handleHostNotificationToggle(interaction);
        }
    }
}
