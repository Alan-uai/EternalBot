// src/interactions/buttons/iniciar-perfil.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
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

// Novos IDs para o painel de personalização da IA
const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_form_modal`;
const CUSTOMIZE_MODAL_ID = `${CUSTOM_ID_PREFIX}_customize_modal`;
const RESPONSE_STYLE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_style`;
const PERSONA_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_persona`;
const LANGUAGE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_language`;
const EMOJI_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_emoji`;
const TITLE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_title`;
const SET_CUSTOM_TITLE_BUTTON_ID = `${CUSTOM_ID_PREFIX}_button_custom_title`;
const TITLE_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal_title`;
const TOGGLE_PROFILE_CONTEXT_ID = `${CUSTOM_ID_PREFIX}_toggle_context`;

// IDs para o painel de metas
const GOALS_MODAL_ID = `${CUSTOM_ID_PREFIX}_goals_modal`;
const REMOVE_GOAL_SELECT_ID = `${CUSTOM_ID_PREFIX}_goals_remove`;


const PREDEFINED_TITLES = ['Nenhum', 'Mestre', 'Campeão', 'Aventureiro', 'Sábio', 'Lendário'];

// Função para abrir o formulário principal de perfil
export async function openProfileForm(interaction, isInitialSetup = false) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(FORM_MODAL_ID)
        .setTitle(isInitialSetup ? 'Crie Seu Perfil - Guia Eterno' : 'Atualizar Perfil');

    const worldInput = new TextInputBuilder()
        .setCustomId('currentWorld')
        .setLabel("Mundo Atual")
        .setPlaceholder("Ex: 23")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.currentWorld || ''))
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId('rank')
        .setLabel("Seu Rank")
        .setPlaceholder("Ex: 115")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.rank || ''))
        .setRequired(true);
    
    const dpsInput = new TextInputBuilder()
        .setCustomId('dps')
        .setLabel("Dano Total (DPS)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.dps || '')
        .setRequired(true);

    const birthdayInput = new TextInputBuilder()
        .setCustomId('birthday')
        .setLabel("Aniversário (DD/MM)")
        .setPlaceholder("Ex: 25/12. Opcional.")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.birthday ? userData.birthday.split('-').reverse().join('/') : '')
        .setRequired(false);

    const energyInput = new TextInputBuilder()
        .setCustomId('totalEnergy')
        .setLabel("Energia Atual (Acumulada)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.totalEnergy || '')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(worldInput),
        new ActionRowBuilder().addComponents(rankInput),
        new ActionRowBuilder().addComponents(dpsInput),
        new ActionRowBuilder().addComponents(energyInput),
        new ActionRowBuilder().addComponents(birthdayInput)
    );

    await interaction.showModal(modal);
}

// Função para processar o formulário de perfil
async function handleFormSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const user = interaction.user;
    const userRef = doc(firestore, 'users', user.id);

    const profileData = {
        currentWorld: interaction.fields.getTextInputValue('currentWorld'),
        rank: interaction.fields.getTextInputValue('rank'),
        dps: interaction.fields.getTextInputValue('dps'),
        totalEnergy: interaction.fields.getTextInputValue('totalEnergy'),
        lastUpdated: serverTimestamp()
    };

    const birthdayValue = interaction.fields.getTextInputValue('birthday');
    if (birthdayValue) {
        const parts = birthdayValue.split(/[-/]/);
        if (parts.length === 2) {
            const [dia, mes] = parts;
            const date = new Date(2000, mes - 1, dia);
             if (date.getMonth() === parseInt(mes, 10) - 1 && date.getDate() === parseInt(dia, 10)) {
                profileData.birthday = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
             } else {
                 return interaction.editReply({ content: 'A data de aniversário fornecida é inválida. Use o formato DD/MM.' });
             }
        } else if (birthdayValue.trim() !== '') {
            return interaction.editReply({ content: 'Formato de data de aniversário inválido. Use DD/MM.' });
        }
    }
    
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        await updateDoc(userRef, profileData);
    } else {
        await setDoc(userRef, { 
            ...profileData, 
            id: user.id, 
            username: user.username, 
            createdAt: serverTimestamp(),
            reputationPoints: 0, credits: 0,
            aiPersonality: 'amigavel', aiResponsePreference: 'detailed', aiLanguage: 'pt_br', aiEmojiPreference: 'moderate',
            aiUseProfileContext: false,
        });
    }
    
    const updatedUserSnap = await getDoc(userRef);
    
    try {
        const profileImage = await createProfileImage(updatedUserSnap.data(), user);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        
        const managementRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId(`${UPDATE_PROFILE_BUTTON_ID}_${user.id}`).setLabel('Atualizar Perfil').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                new ButtonBuilder().setCustomId(`${CUSTOMIZE_AI_BUTTON_ID}_${user.id}`).setLabel('Personalizar o Gui').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                new ButtonBuilder().setCustomId(`${GOALS_PANEL_BUTTON_ID}_${user.id}`).setLabel('Minhas Metas').setStyle(ButtonStyle.Secondary).setEmoji('🎯')
            );
            
        await interaction.editReply({ content: 'Seu perfil foi atualizado com sucesso!', files: [attachment], components: [managementRow] });
    } catch (e) {
        console.error("Erro ao criar imagem de perfil (submit):", e);
        await interaction.editReply('Seu perfil foi salvo, mas ocorreu um erro ao gerar a imagem de exibição.');
    }
}

// Função para abrir o painel de personalização da IA
async function openAiCustomizationPanel(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const currentStyle = userData.aiResponsePreference || 'detailed';
    const currentPersona = userData.aiPersonality || 'amigavel';
    const currentLanguage = userData.aiLanguage || 'pt_br';
    const currentEmoji = userData.aiEmojiPreference || 'moderate';
    const currentUseContext = userData.aiUseProfileContext || false;

    const styleMenu = new StringSelectMenuBuilder().setCustomId(RESPONSE_STYLE_SELECT_ID).setPlaceholder('Nível de Detalhe da Resposta')
        .addOptions(Object.entries(responseStyles).map(([key, { name }]) => ({ label: name, value: key, default: key === currentStyle })));

    const personaMenu = new StringSelectMenuBuilder().setCustomId(PERSONA_SELECT_ID).setPlaceholder('Personalidade do Gui')
        .addOptions(Object.entries(personas).map(([key, { name }]) => ({ label: name, value: key, default: key === currentPersona })));

    const languageMenu = new StringSelectMenuBuilder().setCustomId(LANGUAGE_SELECT_ID).setPlaceholder('Idioma da Resposta')
        .addOptions(Object.entries(languages).map(([key, { name }]) => ({ label: name, value: key, default: key === currentLanguage })));

    const emojiMenu = new StringSelectMenuBuilder().setCustomId(EMOJI_SELECT_ID).setPlaceholder('Uso de Emojis')
        .addOptions(Object.entries(emojiStyles).map(([key, { name }]) => ({ label: name, value: key, default: key === currentEmoji })));

    const customTitleButton = new ButtonBuilder().setCustomId(SET_CUSTOM_TITLE_BUTTON_ID).setLabel(`Definir Nome/Título`).setStyle(ButtonStyle.Secondary).setEmoji('✏️');
    const toggleContextButton = new ButtonBuilder().setCustomId(TOGGLE_PROFILE_CONTEXT_ID)
        .setLabel(`Contexto do Perfil: ${currentUseContext ? 'Ligado' : 'Desligado'}`)
        .setStyle(currentUseContext ? ButtonStyle.Success : ButtonStyle.Danger)
        .setEmoji(currentUseContext ? '✅' : '❌');

    await interaction.reply({
        content: '**Painel de Personalização do Gui**\nConfigure como o Gui interage com você.',
        components: [
            new ActionRowBuilder().addComponents(styleMenu),
            new ActionRowBuilder().addComponents(personaMenu),
            new ActionRowBuilder().addComponents(languageMenu),
            new ActionRowBuilder().addComponents(emojiMenu),
            new ActionRowBuilder().addComponents(customTitleButton, toggleContextButton)
        ],
        ephemeral: true
    });
}

// Função para salvar as preferências
async function savePreference(interaction, key, value) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await setDoc(userRef, { [key]: value }, { merge: true });
    // Reabre o painel com as informações atualizadas
    await openAiCustomizationPanel(interaction.message.interaction); 
}

async function handleToggleContext(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? userSnap.data().aiUseProfileContext || false : false;
    await savePreference(interaction, 'aiUseProfileContext', !currentStatus);
}


// Função para abrir modal de título/nome customizado
async function openTitleModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder().setCustomId(TITLE_MODAL_ID).setTitle('Definir Nome/Título Personalizado');
    const nameInput = new TextInputBuilder().setCustomId('customName').setLabel("Nome Personalizado (opcional)").setPlaceholder("Como você quer que o Gui te chame?").setStyle(TextInputStyle.Short).setValue(userData.customName || '').setRequired(false);
    const titleInput = new TextInputBuilder().setCustomId('customTitle').setLabel("Título Personalizado (opcional)").setPlaceholder("Ex: O Destruidor de Mundos").setStyle(TextInputStyle.Short).setValue(userData.userTitle || '').setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(titleInput));
    await interaction.showModal(modal);
}

// Função para salvar o título/nome customizado
async function handleTitleModalSubmit(interaction) {
    await interaction.deferUpdate();
    const customName = interaction.fields.getTextInputValue('customName');
    const customTitle = interaction.fields.getTextInputValue('customTitle');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    await setDoc(userRef, { customName: customName || null, userTitle: customTitle || null }, { merge: true });
    // Reabre o painel principal para refletir a mudança
    await openAiCustomizationPanel(interaction.message.interaction);
}

// --- Funções para o Painel de Metas ---

async function openGoalsPanel(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const goals = userSnap.exists() ? userSnap.data().goals || [] : [];

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🎯 Minhas Metas')
        .setDescription(goals.length > 0 ? goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n') : 'Você ainda não definiu nenhuma meta. Clique em "Adicionar Meta" para começar!');

    const components = [];
    const addGoalButton = new ButtonBuilder().setCustomId(`${CUSTOM_ID_PREFIX}_goals_add`).setLabel('Adicionar Meta').setStyle(ButtonStyle.Success).setEmoji('➕');
    
    if (goals.length > 0) {
        const removeGoalMenu = new StringSelectMenuBuilder().setCustomId(REMOVE_GOAL_SELECT_ID).setPlaceholder('Remover uma meta...')
            .addOptions(goals.map((goal, index) => ({
                label: goal.substring(0, 100),
                value: String(index)
            })));
        components.push(new ActionRowBuilder().addComponents(removeGoalMenu));
    }
    
    components.push(new ActionRowBuilder().addComponents(addGoalButton));

    await interaction.reply({
        embeds: [embed],
        components: components,
        ephemeral: true
    });
}

async function openGoalsModal(interaction) {
    const modal = new ModalBuilder().setCustomId(GOALS_MODAL_ID).setTitle('Adicionar Nova Meta');
    const goalInput = new TextInputBuilder().setCustomId('goal_text').setLabel('Qual é a sua nova meta?').setStyle(TextInputStyle.Paragraph).setPlaceholder('Ex: Atingir o Mundo 25, Conseguir a foice Stormreaver, etc.').setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(goalInput));
    await interaction.showModal(modal);
}

async function handleAddGoal(interaction) {
    const goalText = interaction.fields.getTextInputValue('goal_text');
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    await updateDoc(userRef, { goals: arrayUnion(goalText) });
    await interaction.deferUpdate();
    await openGoalsPanel(interaction.message.interaction);
}

async function handleRemoveGoal(interaction) {
    const goalIndex = parseInt(interaction.values[0], 10);
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const goals = userSnap.exists() ? userSnap.data().goals || [] : [];
    
    if (goals[goalIndex]) {
        await updateDoc(userRef, { goals: arrayRemove(goals[goalIndex]) });
    }
    await interaction.deferUpdate();
    await openGoalsPanel(interaction.message.interaction);
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
                 await openGoalsModal(interaction);
             }
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
