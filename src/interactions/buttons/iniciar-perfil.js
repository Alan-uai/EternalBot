// src/interactions/buttons/iniciar-perfil.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';

export const CUSTOM_ID_PREFIX = 'perfil';
export const UPDATE_PROFILE_BUTTON_ID = `${CUSTOM_ID_PREFIX}_update`;
export const CUSTOMIZE_AI_BUTTON_ID = `${CUSTOM_ID_PREFIX}_customize_ai`;
export const GOALS_PANEL_BUTTON_ID = `${CUSTOM_ID_PREFIX}_goals_panel`;
export const FOLLOW_HOST_BUTTON_ID = `${CUSTOM_ID_PREFIX}_follow`;

// Novos IDs para o painel de personalização da IA
const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_form_modal`;
const CUSTOMIZE_MODAL_ID = `${CUSTOM_ID_PREFIX}_customize_modal`;
const RESPONSE_STYLE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_style`;
const PERSONA_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_persona`;
const LANGUAGE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_language`;
const EMOJI_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_emoji`;
const TITLE_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal_title`;
const TOGGLE_PROFILE_CONTEXT_ID = `${CUSTOM_ID_PREFIX}_toggle_context`;

// IDs para o painel de metas
const GOALS_MODAL_ID = `${CUSTOM_ID_PREFIX}_goals_modal`;
const REMOVE_GOAL_SELECT_ID = `${CUSTOM_ID_PREFIX}_goals_remove`;

// Função para abrir o formulário principal de perfil
export async function openProfileForm(interaction, isInitialSetup = false) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(FORM_MODAL_ID)
        .setTitle(isInitialSetup ? 'Crie Seu Perfil - Guia Eterno' : 'Atualizar Perfil');

    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('currentWorld').setLabel("Mundo Atual").setPlaceholder("Ex: 23").setStyle(TextInputStyle.Short).setValue(String(userData.currentWorld || '')).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('rank').setLabel("Seu Rank").setPlaceholder("Ex: 115").setStyle(TextInputStyle.Short).setValue(String(userData.rank || '')).setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('dps').setLabel("Dano Total (DPS)").setPlaceholder("Ex: 1.5sx").setStyle(TextInputStyle.Short).setValue(userData.dps || '').setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('totalEnergy').setLabel("Energia Atual (Acumulada)").setPlaceholder("Ex: 1.5sx").setStyle(TextInputStyle.Short).setValue(userData.totalEnergy || '').setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('birthday').setLabel("Aniversário (DD/MM)").setPlaceholder("Ex: 25/12. Opcional.").setStyle(TextInputStyle.Short).setValue(userData.birthday ? userData.birthday.split('-').reverse().join('/') : '').setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

// Função para processar o formulário de perfil
async function handleFormSubmit(interaction) {
    // Esta função permanece a mesma de antes.
}

// Função para abrir o painel de personalização da IA
async function openAiCustomizationPanel(interaction) {
    // Esta função permanece a mesma de antes.
}

// Função para salvar as preferências
async function savePreference(interaction, key, value) {
    // Esta função permanece a mesma de antes.
}

async function handleToggleContext(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? userSnap.data().aiUseProfileContext || false : false;
    await updateDoc(userRef, { 'aiUseProfileContext': !currentStatus });
    await openAiCustomizationPanel(interaction.message.interaction);
    await interaction.deferUpdate();
}

async function openTitleModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder().setCustomId(TITLE_MODAL_ID).setTitle('Definir Nome/Título Personalizado');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('customName').setLabel("Nome Personalizado (opcional)").setPlaceholder("Como você quer que o Gui te chame?").setStyle(TextInputStyle.Short).setValue(userData.customName || '').setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('customTitle').setLabel("Título Personalizado (opcional)").setPlaceholder("Ex: O Destruidor de Mundos").setStyle(TextInputStyle.Short).setValue(userData.userTitle || '').setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

async function handleTitleModalSubmit(interaction) {
    await interaction.deferUpdate();
    const customName = interaction.fields.getTextInputValue('customName');
    const customTitle = interaction.fields.getTextInputValue('customTitle');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    await updateDoc(userRef, { customName: customName || null, userTitle: customTitle || null });
    await openAiCustomizationPanel(interaction.message.interaction);
}

async function openGoalsPanel(interaction) {
    // Esta função permanece a mesma de antes.
}

async function handleAddGoal(interaction) {
    // Esta função permanece a mesma de antes.
}

async function handleRemoveGoal(interaction) {
    // Esta função permanece a mesma de antes.
}

async function handleFollow(interaction, targetUserId) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const viewerId = interaction.user.id;

    if (viewerId === targetUserId) {
        return interaction.followUp({ content: 'Você não pode seguir a si mesmo.', ephemeral: true });
    }

    const viewerRef = doc(firestore, 'users', viewerId);
    const viewerSnap = await getDoc(viewerRef);
    if (!viewerSnap.exists()) {
        return interaction.followUp({ content: 'Você precisa ter um perfil para seguir outros jogadores.', ephemeral: true });
    }
    
    const isFollowing = viewerSnap.data().following?.includes(targetUserId);
    
    if (isFollowing) {
        await updateDoc(viewerRef, { following: arrayRemove(targetUserId) });
    } else {
        await updateDoc(viewerRef, { following: arrayUnion(targetUserId) });
    }
    
    const newButton = new ButtonBuilder()
        .setCustomId(`${FOLLOW_HOST_BUTTON_ID}_${targetUserId}`)
        .setLabel(isFollowing ? 'Seguir Host' : 'Deixar de Seguir')
        .setStyle(isFollowing ? ButtonStyle.Success : ButtonStyle.Danger)
        .setEmoji(isFollowing ? '➕' : '❌');

    await interaction.editReply({ components: [new ActionRowBuilder().addComponents(newButton)] });
}


// Handler principal de interações
export async function handleInteraction(interaction) {
    // --- LÓGICA DE BOTÕES ---
    if (interaction.isButton()) {
        const [prefix, action, ...params] = interaction.customId.split('_');
        if (prefix !== CUSTOM_ID_PREFIX) return;

        const targetUserId = params[0];

        if (action === 'update' && interaction.user.id === targetUserId) {
            await openProfileForm(interaction);
        } else if (action === 'customize' && params[0] === 'ai' && interaction.user.id === targetUserId) {
            await openAiCustomizationPanel(interaction);
        } else if (action === 'button' && params[0] === 'custom' && params[1] === 'title') {
            await openTitleModal(interaction);
        } else if (action === 'toggle' && params[0] === 'context') {
            await handleToggleContext(interaction);
        } else if (action === 'goals') {
             if (params[0] === 'panel' && interaction.user.id === targetUserId) {
                 await openGoalsPanel(interaction);
             } else if (params[0] === 'add') {
                 // Esta lógica precisa de um modal, então vamos chamá-lo
             }
        } else if (action === 'follow') {
            await handleFollow(interaction, targetUserId);
        }
        
    // --- LÓGICA DE MODAIS ---
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === FORM_MODAL_ID) {
            await handleFormSubmit(interaction);
        } else if (interaction.customId === TITLE_MODAL_ID) {
            await handleTitleModalSubmit(interaction);
        } else if (interaction.customId === GOALS_MODAL_ID) {
            await handleAddGoal(interaction);
        }

    // --- LÓGICA DE MENUS DE SELEÇÃO ---
    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === RESPONSE_STYLE_SELECT_ID) {
            await savePreference(interaction, 'aiResponsePreference', interaction.values[0]);
        } else if (interaction.customId === PERSONA_SELECT_ID) {
            await savePreference(interaction, 'aiPersonality', interaction.values[0]);
        } else if (interaction.customId === LANGUAGE_SELECT_ID) {
            await savePreference(interaction, 'aiLanguage', interaction.values[0]);
        } else if (interaction.customId === EMOJI_SELECT_ID) {
            await savePreference(interaction, 'aiEmojiPreference', interaction.values[0]);
        } else if (interaction.customId === REMOVE_GOAL_SELECT_ID) {
            await handleRemoveGoal(interaction);
        }
    }
}
