// src/interactions/buttons/iniciar-perfil.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';

// Alteração: Array de prefixos para garantir que todos os botões sejam reconhecidos
export const customIdPrefix = ['perfil_update', 'perfil_customize_ai', 'perfil_goals_panel', 'perfil_follow', 'perfil', 'perfil_toggle_context', 'perfil_button_custom_title', 'perfil_goals_add', 'perfil_select_style', 'perfil_select_persona', 'perfil_select_language', 'perfil_select_emoji', 'perfil_goals_remove'];

export const UPDATE_PROFILE_BUTTON_ID = `perfil_update`;
export const CUSTOMIZE_AI_BUTTON_ID = `perfil_customize_ai`;
export const GOALS_PANEL_BUTTON_ID = `perfil_goals_panel`;
export const FOLLOW_HOST_BUTTON_ID = `perfil_follow`;
export const OPEN_CUSTOM_TITLE_MODAL_ID = `perfil_button_custom_title`;
export const TOGGLE_PROFILE_CONTEXT_ID = `perfil_toggle_context`;
export const ADD_GOAL_BUTTON_ID = `perfil_goals_add`;


// Novos IDs para o painel de personalização da IA
const FORM_MODAL_ID = `perfil_form_modal`;
const CUSTOMIZE_MODAL_ID = `perfil_customize_modal`;
const RESPONSE_STYLE_SELECT_ID = `perfil_select_style`;
const PERSONA_SELECT_ID = `perfil_select_persona`;
const LANGUAGE_SELECT_ID = `perfil_select_language`;
const EMOJI_SELECT_ID = `perfil_select_emoji`;
const TITLE_MODAL_ID = `perfil_modal_title`;


// IDs para o painel de metas
const GOALS_MODAL_ID = `perfil_goals_modal`;
const REMOVE_GOAL_SELECT_ID = `perfil_goals_remove`;

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
            new TextInputBuilder().setCustomId('energyPerClick').setLabel("Energia por Clique").setPlaceholder("Ex: 10Qn").setStyle(TextInputStyle.Short).setValue(userData.energyPerClick || '').setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('birthday').setLabel("Aniversário (DD/MM)").setPlaceholder("Ex: 25/12. Opcional.").setStyle(TextInputStyle.Short).setValue(userData.birthday ? userData.birthday.split('-').reverse().join('/') : '').setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

// Função para processar o formulário de perfil
async function handleFormSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    let birthdayFormatted = null;
    const birthdayInput = interaction.fields.getTextInputValue('birthday');
    if (birthdayInput) {
        const parts = birthdayInput.match(/^(\d{1,2})[/-](\d{1,2})$/);
        if (parts) {
            const day = parts[1].padStart(2, '0');
            const month = parts[2].padStart(2, '0');
            birthdayFormatted = `${month}-${day}`; // MM-DD
        }
    }
    
    const profileData = {
        username: interaction.user.username,
        currentWorld: parseInt(interaction.fields.getTextInputValue('currentWorld'), 10) || 1,
        rank: parseInt(interaction.fields.getTextInputValue('rank'), 10) || 1,
        dps: interaction.fields.getTextInputValue('dps'),
        energyPerClick: interaction.fields.getTextInputValue('energyPerClick') || null,
        birthday: birthdayFormatted,
        id: interaction.user.id,
    };
    
    if (userSnap.exists()) {
        await updateDoc(userRef, profileData);
    } else {
        await setDoc(userRef, {
            ...profileData,
            reputationPoints: 0,
            credits: 0,
            email: null,
            createdAt: serverTimestamp()
        });
    }

    const userData = (await getDoc(userRef)).data();
    const profileImage = await createProfileImage(userData, interaction.user);
    const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
    await interaction.editReply({ content: 'Perfil salvo com sucesso!', files: [attachment] });
}

// Função para abrir o painel de personalização da IA
async function openAiCustomizationPanel(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🤖 Personalize o Gui')
        .setDescription('Ajuste como o Gui interage com você.');

    // Estilo de Resposta
    const styleOptions = Object.entries(responseStyles).map(([key, { name }]) => ({ label: name, value: key, default: key === (userData.aiResponsePreference || 'detailed') }));
    const styleMenu = new StringSelectMenuBuilder().setCustomId(RESPONSE_STYLE_SELECT_ID).setPlaceholder('Estilo de Resposta').addOptions(styleOptions);
    
    // Personalidade
    const personaOptions = Object.entries(personas).map(([key, { name }]) => ({ label: name, value: key, default: key === (userData.aiPersonality || 'amigavel') }));
    const personaMenu = new StringSelectMenuBuilder().setCustomId(PERSONA_SELECT_ID).setPlaceholder('Personalidade').addOptions(personaOptions);

    // Idioma
    const languageOptions = Object.entries(languages).map(([key, { name }]) => ({ label: name, value: key, default: key === (userData.aiLanguage || 'pt_br') }));
    const languageMenu = new StringSelectMenuBuilder().setCustomId(LANGUAGE_SELECT_ID).setPlaceholder('Idioma').addOptions(languageOptions);

    // Emojis
    const emojiOptions = Object.entries(emojiStyles).map(([key, { name }]) => ({ label: name, value: key, default: key === (userData.aiEmojiPreference || 'moderate') }));
    const emojiMenu = new StringSelectMenuBuilder().setCustomId(EMOJI_SELECT_ID).setPlaceholder('Uso de Emojis').addOptions(emojiOptions);

    // Contexto e Título
    const useContext = userData.aiUseProfileContext || false;
    const miscButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(TOGGLE_PROFILE_CONTEXT_ID).setLabel(`Contexto do Perfil: ${useContext ? 'Ligado' : 'Desligado'}`).setStyle(useContext ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(OPEN_CUSTOM_TITLE_MODAL_ID).setLabel('Definir Nome/Título').setStyle(ButtonStyle.Secondary)
    );
    
    const replyOptions = {
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(styleMenu),
            new ActionRowBuilder().addComponents(personaMenu),
            new ActionRowBuilder().addComponents(languageMenu),
            new ActionRowBuilder().addComponents(emojiMenu),
            miscButtons
        ],
        ephemeral: true,
    };
    
    // CORREÇÃO: Usar update() se for uma atualização de um painel anterior
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await interaction.update(replyOptions);
    } else {
        await interaction.reply(replyOptions);
    }
}

// Função para salvar as preferências
async function savePreference(interaction, key, value) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await updateDoc(userRef, { [key]: value });

    // Atualiza o menu para mostrar a seleção
    const newComponents = interaction.message.components.map(row => {
        const newRow = ActionRowBuilder.from(row);
        const menuComponent = newRow.components.find(comp => comp.customId === interaction.customId);
        if (menuComponent && menuComponent.type === 3 /* StringSelect */) {
            menuComponent.options.forEach(opt => opt.setDefault(opt.value === value));
        }
        return newRow;
    });

    await interaction.update({ components: newComponents });
}

async function handleToggleContext(interaction) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? userSnap.data().aiUseProfileContext || false : false;
    await updateDoc(userRef, { 'aiUseProfileContext': !currentStatus });
    
    // Recria e edita o painel
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    const components = interaction.message.components.map(row => {
        const newRow = ActionRowBuilder.from(row);
        newRow.components.forEach(component => {
            if (component.customId === TOGGLE_PROFILE_CONTEXT_ID) {
                const newStatus = !currentStatus;
                component.setLabel(`Contexto do Perfil: ${newStatus ? 'Ligado' : 'Desligado'}`).setStyle(newStatus ? ButtonStyle.Success : ButtonStyle.Secondary);
            }
        });
        return newRow;
    });

    await interaction.editReply({ embeds: [embed], components });
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
    await interaction.deferReply({ ephemeral: true });
    const customName = interaction.fields.getTextInputValue('customName');
    const customTitle = interaction.fields.getTextInputValue('customTitle');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    await updateDoc(userRef, { customName: customName || null, userTitle: customTitle || null });
    await interaction.editReply({ content: 'Nome e título personalizados salvos com sucesso!' });
}

async function openGoalsPanel(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const goals = userSnap.exists() ? userSnap.data().goals || [] : [];
    
    const embed = new EmbedBuilder()
        .setColor(0x1ABC9C)
        .setTitle('🎯 Minhas Metas')
        .setDescription(goals.length > 0 ? goals.map((goal, i) => `${i + 1}. ${goal}`).join('\n') : 'Você ainda não definiu nenhuma meta.');

    const components = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(ADD_GOAL_BUTTON_ID).setLabel('Adicionar Meta').setStyle(ButtonStyle.Success).setDisabled(goals.length >= 5)
        )
    ];

    if (goals.length > 0) {
        const removeMenu = new StringSelectMenuBuilder()
            .setCustomId(REMOVE_GOAL_SELECT_ID)
            .setPlaceholder('Remover uma meta...')
            .addOptions(goals.map((goal, i) => ({ label: goal.substring(0, 100), value: String(i) })));
        components.push(new ActionRowBuilder().addComponents(removeMenu));
    }
    
    const replyOptions = { embeds: [embed], components, ephemeral: true };

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await interaction.update(replyOptions);
    } else {
        await interaction.editReply(replyOptions);
    }
}

async function handleAddGoal(interaction) {
    const modal = new ModalBuilder().setCustomId(GOALS_MODAL_ID).setTitle('Adicionar Nova Meta');
    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('goal_text').setLabel('Qual sua próxima meta no jogo?').setStyle(TextInputStyle.Short).setRequired(true)
        )
    );
    await interaction.showModal(modal);
}

async function handleGoalModalSubmit(interaction) {
    await interaction.deferUpdate();
    const goalText = interaction.fields.getTextInputValue('goal_text');
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await updateDoc(userRef, { goals: arrayUnion(goalText) });
    await openGoalsPanel(interaction); 
}

async function handleRemoveGoal(interaction) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const goals = userSnap.data().goals || [];
    
    const indexToRemove = parseInt(interaction.values[0], 10);
    const goalToRemove = goals[indexToRemove];

    if (goalToRemove) {
        await updateDoc(userRef, { goals: arrayRemove(goalToRemove) });
    }
    await openGoalsPanel(interaction); 
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
    const [prefix, action, ...params] = interaction.customId.split('_');

    // --- LÓGICA DE BOTÕES ---
    if (interaction.isButton()) {
        const targetUserId = params[0];

        if (interaction.customId.startsWith(UPDATE_PROFILE_BUTTON_ID) && interaction.user.id === targetUserId) {
            await openProfileForm(interaction);
        } else if (interaction.customId.startsWith(CUSTOMIZE_AI_BUTTON_ID) && interaction.user.id === targetUserId) {
            await openAiCustomizationPanel(interaction);
        } else if (interaction.customId === OPEN_CUSTOM_TITLE_MODAL_ID) {
            await openTitleModal(interaction);
        } else if (interaction.customId === TOGGLE_PROFILE_CONTEXT_ID) {
            await handleToggleContext(interaction);
        } else if (interaction.customId.startsWith(GOALS_PANEL_BUTTON_ID)) {
             await openGoalsPanel(interaction);
        } else if (interaction.customId === ADD_GOAL_BUTTON_ID) {
            await handleAddGoal(interaction);
        } else if (interaction.customId.startsWith(FOLLOW_HOST_BUTTON_ID)) {
            await handleFollow(interaction, targetUserId);
        }
        
    // --- LÓGICA DE MODAIS ---
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === FORM_MODAL_ID) {
            await handleFormSubmit(interaction);
        } else if (interaction.customId === TITLE_MODAL_ID) {
            await handleTitleModalSubmit(interaction);
        } else if (interaction.customId === GOALS_MODAL_ID) {
            await handleGoalModalSubmit(interaction);
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
