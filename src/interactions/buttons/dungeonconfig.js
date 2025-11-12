// src/interactions/buttons/dungeonconfig.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CUSTOM_ID_PREFIX as DUNGEON_CONFIG_PREFIX, SOLING_CONFIG_BUTTON_ID, TAG_CONFIG_BUTTON_ID, NOTIFICATIONS_CONFIG_BUTTON_ID } from '../../commands/utility/dungeonconfig.js';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';

export const customIdPrefix = DUNGEON_CONFIG_PREFIX;

const SOLING_MODAL_ID = `${customIdPrefix}_soling_modal`;
const TAG_MODAL_ID = `${customIdPrefix}_tag_modal`;

// IDs for Notification Panel
const NOTIFICATIONS_DM_TOGGLE_ID = `${customIdPrefix}_notify_dm_toggle`;
const NOTIFICATIONS_SOLING_RAID_SELECT_ID = `${customIdPrefix}_notify_soling_select`;
const NOTIFICATIONS_FARM_RAID_SELECT_ID = `${customIdPrefix}_notify_farm_select`;
const NOTIFICATIONS_HOST_SELECT_ID = `${customIdPrefix}_notify_host_select`;
const NOTIFICATIONS_HOST_SOLING_TOGGLE_ID = `${customIdPrefix}_notify_host_soling_toggle`;
const NOTIFICATIONS_HOST_FARM_TOGGLE_ID = `${customIdPrefix}_notify_host_farm_toggle`;
const NOTIFICATIONS_BACK_TO_MAIN_ID = `${customIdPrefix}_notify_back_main`;


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


async function openNotificationsPanel(interaction, isUpdate = false) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const notificationPrefs = userData.notificationPrefs || {};

    const dmEnabled = notificationPrefs.dmEnabled !== false;
    const solingInterests = notificationPrefs.solingInterests || [];
    const farmInterests = notificationPrefs.farmInterests || [];
    const following = userData.following || [];

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🔔 Preferências de Notificação')
        .setFooter({ text: 'Gerencie como você recebe alertas sobre farms, solings e hosts.'});

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
    })).slice(0, 25);
    
    // Fallback if no raids are available
    if (raidOptions.length === 0) {
        raidOptions.push({label: 'Nenhuma raid disponível', value: 'none'});
    }

    const solingSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(NOTIFICATIONS_SOLING_RAID_SELECT_ID)
            .setPlaceholder('Selecione interesses de /soling...')
            .setMinValues(0)
            .setMaxValues(Math.min(raidOptions.length, 25))
            .addOptions(raidOptions.map(opt => ({...opt, default: solingInterests.includes(opt.value)})))
    );
    
    const farmSelect = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(NOTIFICATIONS_FARM_RAID_SELECT_ID)
            .setPlaceholder('Selecione interesses de /farming...')
            .setMinValues(0)
            .setMaxValues(Math.min(raidOptions.length, 25))
            .addOptions(raidOptions.map(opt => ({...opt, default: farmInterests.includes(opt.value)})))
    );
    
    const components = [dmToggle, solingSelect, farmSelect];

    if (following.length > 0) {
        const hostOptions = await Promise.all(following.map(async (hostId) => {
            const hostUser = await interaction.client.users.fetch(hostId).catch(() => null);
            return {
                label: hostUser ? hostUser.username : `Usuário (ID: ${hostId})`,
                value: hostId,
            };
        }));

        const hostSelect = new StringSelectMenuBuilder()
            .setCustomId(NOTIFICATIONS_HOST_SELECT_ID)
            .setPlaceholder('Gerenciar notificações de hosts que você segue...')
            .setMinValues(0)
            .setMaxValues(1)
            .addOptions(hostOptions);
            
        components.push(new ActionRowBuilder().addComponents(hostSelect));
    } else {
        embed.addFields({name: 'Hosts Seguidos', value: 'Você não segue nenhum host. Use o botão "Seguir" no perfil de outros jogadores.'});
    }

    const replyOptions = { embeds: [embed], components, ephemeral: true };
    
    if (isUpdate) {
        // Para atualizações (como menus de seleção), usamos update()
        await interaction.update(replyOptions);
    } else {
        // Para a abertura inicial ou após apagar, usamos reply()
        await interaction.reply(replyOptions);
    }
}

async function handleDmToggle(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? (userSnap.data().notificationPrefs?.dmEnabled !== false) : true;
    
    await updateDoc(userRef, { 'notificationPrefs.dmEnabled': !currentStatus });
    
    // Apaga a resposta "thinking" e reabre o painel com uma nova mensagem
    await interaction.deleteReply();
    await openNotificationsPanel(interaction, false);
}


async function handleSolingInterestSelect(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await updateDoc(userRef, { 'notificationPrefs.solingInterests': interaction.values });
    await openNotificationsPanel(interaction, true);
}

async function handleFarmInterestSelect(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await updateDoc(userRef, { 'notificationPrefs.farmInterests': interaction.values });
    await openNotificationsPanel(interaction, true);
}


async function openHostManagementPanel(interaction, selectedHostId) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const notificationPrefs = userSnap.exists() ? userSnap.data().notificationPrefs || {} : {};
    const hostSettings = notificationPrefs.hostSettings?.[selectedHostId] || {};

    const notifySolings = hostSettings.notifySolings !== false;
    const notifyFarms = hostSettings.notifyFarms !== false;

    const hostUser = await interaction.client.users.fetch(selectedHostId).catch(() => null);

    const embed = new EmbedBuilder()
        .setColor(0x1ABC9C)
        .setTitle(`⚙️ Gerenciar Notificações de ${hostUser?.username || 'Host'}`);

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${NOTIFICATIONS_HOST_SOLING_TOGGLE_ID}_${selectedHostId}`)
            .setLabel(`Notificar Solings: ${notifySolings ? 'Sim' : 'Não'}`)
            .setStyle(notifySolings ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`${NOTIFICATIONS_HOST_FARM_TOGGLE_ID}_${selectedHostId}`)
            .setLabel(`Notificar Farms: ${notifyFarms ? 'Sim' : 'Não'}`)
            .setStyle(notifyFarms ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(NOTIFICATIONS_BACK_TO_MAIN_ID)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Primary)
    );

    await interaction.update({ embeds: [embed], components: [buttons] });
}

async function handleHostNotifyToggle(interaction, type) {
    const hostId = interaction.customId.split('_').pop();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const prefs = userSnap.data()?.notificationPrefs || {};
    
    const key = type === 'soling' ? 'notifySolings' : 'notifyFarms';
    const currentStatus = prefs.hostSettings?.[hostId]?.[key] !== false;

    await updateDoc(userRef, {
        [`notificationPrefs.hostSettings.${hostId}.${key}`]: !currentStatus,
    });
    
    await openHostManagementPanel(interaction, hostId);
}

export async function handleInteraction(interaction, container) {
    if (interaction.isButton()) {
        const [prefix, action, ...params] = interaction.customId.split('_');
        if (prefix !== customIdPrefix) return;

        if (interaction.customId === SOLING_CONFIG_BUTTON_ID) {
            await openSolingSettingsModal(interaction);
        } else if (interaction.customId === TAG_CONFIG_BUTTON_ID) {
            await openTagModal(interaction);
        } else if (interaction.customId === NOTIFICATIONS_CONFIG_BUTTON_ID) {
            await openNotificationsPanel(interaction, false);
        } else if (interaction.customId === NOTIFICATIONS_DM_TOGGLE_ID) {
            await handleDmToggle(interaction);
        } else if (interaction.customId === NOTIFICATIONS_BACK_TO_MAIN_ID) {
            await openNotificationsPanel(interaction, true);
        } else if (action === 'notify' && params[0] === 'host' && params[1] === 'soling') {
            await handleHostNotifyToggle(interaction, 'soling');
        } else if (action === 'notify' && params[0] === 'host' && params[1] === 'farm') {
            await handleHostNotifyToggle(interaction, 'farm');
        }

    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === SOLING_MODAL_ID) {
            await handleSolingSettingsSubmit(interaction);
        } else if (interaction.customId === TAG_MODAL_ID) {
            await handleTagSubmit(interaction);
        }
    } else if (interaction.isStringSelectMenu()) {
        const [prefix, action, subAction] = interaction.customId.split('_');
        if (prefix !== customIdPrefix) return;

        if (action === 'notify') {
             if (subAction === 'soling') {
                await handleSolingInterestSelect(interaction);
             } else if (subAction === 'farm') {
                await handleFarmInterestSelect(interaction);
             } else if (subAction === 'host') {
                const selectedHostId = interaction.values[0];
                await openHostManagementPanel(interaction, selectedHostId);
             }
        }
    }
}
