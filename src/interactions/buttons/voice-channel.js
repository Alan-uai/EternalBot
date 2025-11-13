// src/interactions/buttons/voice-channel.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const customIdPrefix = 'voice';

const CREATE_BUTTON_ID = `${customIdPrefix}_create`;
const MANAGE_BUTTON_ID = `${customIdPrefix}_manage`;
const CREATE_MODAL_ID = `${customIdPrefix}_create_modal`;
const MANAGE_SELECT_ID = `${customIdPrefix}_manage_select`;
const EDIT_BUTTON_ID = `${customIdPrefix}_edit_btn`;
const INVITE_BUTTON_ID = `${customIdPrefix}_invite_btn`;
const DELETE_BUTTON_ID = `${customIdPrefix}_delete_btn`;
const EDIT_MODAL_ID = `${customIdPrefix}_edit_modal`;
const INVITE_MODAL_ID = `${customIdPrefix}_invite_modal`;

// Função para abrir o modal de criação
async function openCreateModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId(CREATE_MODAL_ID)
        .setTitle('Criar Canal de Voz Temporário');

    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('channel_name').setLabel("Nome do Canal").setStyle(TextInputStyle.Short).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('user_limit').setLabel("Limite de Usuários (1-99)").setStyle(TextInputStyle.Short).setValue('10').setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

// Função para lidar com o envio do modal de criação
async function handleCreateModalSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { config, logger } = interaction.client.container;
    const { firestore } = initializeFirebase();

    const channelName = interaction.fields.getTextInputValue('channel_name');
    const userLimitStr = interaction.fields.getTextInputValue('user_limit');
    const userLimit = parseInt(userLimitStr, 10) || 10;

    if (userLimit < 1 || userLimit > 99) {
        return interaction.editReply({ content: 'O limite de usuários deve ser entre 1 e 99.' });
    }

    try {
        const guild = interaction.guild;
        const voiceChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: config.VOICE_CATEGORY_ID,
            userLimit: userLimit,
            permissionOverwrites: [{
                id: interaction.user.id,
                allow: ['ManageChannels', 'MoveMembers'],
            }],
        });

        const channelDocRef = doc(firestore, 'temp_voice_channels', voiceChannel.id);
        await setDoc(channelDocRef, {
            ownerId: interaction.user.id,
            channelName: channelName,
            createdAt: serverTimestamp(),
        });

        logger.info(`[VoiceManager] Canal de voz temporário '${channelName}' (ID: ${voiceChannel.id}) criado por ${interaction.user.tag}.`);
        await interaction.editReply({ content: `Canal de voz <#${voiceChannel.id}> criado com sucesso! Você tem permissão para gerenciá-lo.` });

    } catch (error) {
        logger.error('[VoiceManager] Erro ao criar canal de voz:', error);
        await interaction.editReply({ content: 'Ocorreu um erro ao tentar criar o canal de voz.' });
    }
}

// Função para abrir o painel de gerenciamento
async function openManagePanel(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();

    const channelsRef = collection(firestore, 'temp_voice_channels');
    const q = query(channelsRef, where("ownerId", "==", interaction.user.id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return interaction.editReply({ content: 'Você não possui canais de voz temporários para gerenciar.' });
    }

    const options = querySnapshot.docs.map(docSnap => ({
        label: docSnap.data().channelName,
        value: docSnap.id,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(MANAGE_SELECT_ID)
        .setPlaceholder('Selecione um canal para gerenciar...')
        .addOptions(options);

    await interaction.editReply({
        content: 'Selecione um dos seus canais para ver as opções de gerenciamento.',
        components: [new ActionRowBuilder().addComponents(selectMenu)],
    });
}

// Função para exibir os botões de ação após selecionar um canal
async function showManageActions(interaction) {
    const channelId = interaction.values[0];
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`${EDIT_BUTTON_ID}_${channelId}`).setLabel('Renomear/Limite').setStyle(ButtonStyle.Primary).setEmoji('✏️'),
        new ButtonBuilder().setCustomId(`${INVITE_BUTTON_ID}_${channelId}`).setLabel('Convidar Usuário').setStyle(ButtonStyle.Success).setEmoji('📧'),
        new ButtonBuilder().setCustomId(`${DELETE_BUTTON_ID}_${channelId}`).setLabel('Excluir Canal').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );
    await interaction.update({
        content: `Gerenciando o canal <#${channelId}>. O que você deseja fazer?`,
        components: [row]
    });
}

// Função para deletar um canal
async function deleteChannel(interaction, channelId) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const { logger } = interaction.client.container;
    
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if(channel) await channel.delete('Canal temporário excluído pelo dono.');
    
    await deleteDoc(doc(firestore, 'temp_voice_channels', channelId));
    
    logger.info(`[VoiceManager] Canal de voz (ID: ${channelId}) deletado por ${interaction.user.tag}.`);
    await interaction.editReply({ content: 'Canal de voz excluído com sucesso.', components: [] });
}

// Funções para editar e convidar
async function openEditModal(interaction, channelId) {
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return interaction.update({ content: 'Este canal não existe mais.', components: []});
    
    const modal = new ModalBuilder()
        .setCustomId(`${EDIT_MODAL_ID}_${channelId}`)
        .setTitle('Editar Canal de Voz');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('channel_name').setLabel("Novo nome do canal").setStyle(TextInputStyle.Short).setValue(channel.name).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('user_limit').setLabel("Novo limite de usuários (1-99)").setStyle(TextInputStyle.Short).setValue(String(channel.userLimit || 10)).setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

async function handleEditModalSubmit(interaction, channelId) {
    await interaction.deferReply({ephemeral: true});
    const { logger } = interaction.client.container;
    const { firestore } = initializeFirebase();
    const newName = interaction.fields.getTextInputValue('channel_name');
    const newLimit = parseInt(interaction.fields.getTextInputValue('user_limit'), 10) || 10;
    
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (channel) {
        await channel.edit({ name: newName, userLimit: newLimit });
        await updateDoc(doc(firestore, 'temp_voice_channels', channelId), { channelName: newName });
        logger.info(`[VoiceManager] Canal de voz (ID: ${channelId}) editado por ${interaction.user.tag}.`);
    }
    await interaction.editReply({content: 'Canal atualizado com sucesso!', components: []});
}

async function openInviteModal(interaction, channelId) {
    const modal = new ModalBuilder()
        .setCustomId(`${INVITE_MODAL_ID}_${channelId}`)
        .setTitle('Convidar para o Canal');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('user_id').setLabel("ID do usuário a ser convidado").setStyle(TextInputStyle.Short).setRequired(true)
        )
    );
    await interaction.showModal(modal);
}

async function handleInviteModalSubmit(interaction, channelId) {
    await interaction.deferReply({ephemeral: true});
    const userIdToInvite = interaction.fields.getTextInputValue('user_id');
    
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    const memberToInvite = await interaction.guild.members.fetch(userIdToInvite).catch(() => null);
    
    if (channel && memberToInvite) {
        await channel.permissionOverwrites.edit(memberToInvite.id, { ViewChannel: true, Connect: true });
        await interaction.editReply({content: `${memberToInvite.displayName} foi convidado para o seu canal.`});
    } else {
        await interaction.editReply({content: 'Não foi possível encontrar o canal ou o usuário informado.'});
    }
}


// Handler principal de interação
export async function handleInteraction(interaction, container) {
    const customId = interaction.customId;
    const [prefix, action, channelId] = customId.split('_');

    if (prefix !== customIdPrefix) return;

    if (interaction.isButton()) {
        if (action === 'create') await openCreateModal(interaction);
        if (action === 'manage') await openManagePanel(interaction);
        if (action === 'edit' && channelId) await openEditModal(interaction, channelId);
        if (action === 'invite' && channelId) await openInviteModal(interaction, channelId);
        if (action === 'delete' && channelId) await deleteChannel(interaction, channelId);

    } else if (interaction.isStringSelectMenu() && action === 'manage') {
        await showManageActions(interaction);

    } else if (interaction.isModalSubmit()) {
        if (action === 'create') await handleCreateModalSubmit(interaction);
        if (action === 'edit' && channelId) await handleEditModalSubmit(interaction, channelId);
        if (action === 'invite' && channelId) await handleInviteModalSubmit(interaction, channelId);
    }
}
