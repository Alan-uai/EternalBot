// src/interactions/buttons/iniciar-perfil.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';
import { CUSTOM_ID_PREFIX, UPDATE_PROFILE_BUTTON_ID, CUSTOMIZE_AI_BUTTON_ID } from '../../commands/utility/perfil.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';

export const customIdPrefix = CUSTOM_ID_PREFIX;

// Novos IDs para o painel de personalização da IA
const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_form_modal`;
const CUSTOMIZE_MODAL_ID = `${CUSTOM_ID_PREFIX}_customize_modal`;
const RESPONSE_STYLE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_style`;
const PERSONA_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_persona`;
const TITLE_SELECT_ID = `${CUSTOM_ID_PREFIX}_select_title`;
const SET_CUSTOM_TITLE_BUTTON_ID = `${CUSTOM_ID_PREFIX}_button_custom_title`;
const TITLE_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal_title`;

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
            aiPersonality: 'amigavel', aiResponsePreference: 'detailed'
        });
    }
    
    const updatedUserSnap = await getDoc(userRef);
    
    try {
        const profileImage = await createProfileImage(updatedUserSnap.data(), user);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        
        const managementRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId(`${UPDATE_PROFILE_BUTTON_ID}_${user.id}`).setLabel('Atualizar Perfil').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                new ButtonBuilder().setCustomId(`${CUSTOMIZE_AI_BUTTON_ID}_${user.id}`).setLabel('Personalizar o Gui').setStyle(ButtonStyle.Secondary).setEmoji('🤖')
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
    const currentTitle = userData.userTitle || 'Nenhum';
    const currentName = userData.customName || interaction.user.username;

    const styleMenu = new StringSelectMenuBuilder()
        .setCustomId(RESPONSE_STYLE_SELECT_ID)
        .setPlaceholder('Nível de Detalhe da Resposta')
        .addOptions(Object.entries(responseStyles).map(([key, { name }]) => ({
            label: name,
            value: key,
            default: key === currentStyle
        })));

    const personaMenu = new StringSelectMenuBuilder()
        .setCustomId(PERSONA_SELECT_ID)
        .setPlaceholder('Personalidade do Gui')
        .addOptions(Object.entries(personas).map(([key, { name }]) => ({
            label: name,
            value: key,
            default: key === currentPersona
        })));

    const titleMenu = new StringSelectMenuBuilder()
        .setCustomId(TITLE_SELECT_ID)
        .setPlaceholder('Como o Gui deve te chamar?')
        .addOptions(PREDEFINED_TITLES.map(title => ({
            label: title,
            value: title,
            default: title === currentTitle
        })));

    const customTitleButton = new ButtonBuilder()
        .setCustomId(SET_CUSTOM_TITLE_BUTTON_ID)
        .setLabel(`Definir Nome/Título (Atual: ${currentName})`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✏️');

    await interaction.reply({
        content: 'Personalize como o Gui interage com você!',
        components: [
            new ActionRowBuilder().addComponents(styleMenu),
            new ActionRowBuilder().addComponents(personaMenu),
            new ActionRowBuilder().addComponents(titleMenu),
            new ActionRowBuilder().addComponents(customTitleButton)
        ],
        ephemeral: true
    });
}

// Funções para salvar as preferências
async function savePreference(interaction, key, value) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    await setDoc(userRef, { [key]: value }, { merge: true });
    await interaction.followUp({ content: `Preferência de **${key.replace('ai', '')}** atualizada com sucesso!`, ephemeral: true });
}

// Função para abrir modal de título/nome customizado
async function openTitleModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(TITLE_MODAL_ID)
        .setTitle('Definir Nome/Título Personalizado');

    const nameInput = new TextInputBuilder()
        .setCustomId('customName')
        .setLabel("Nome Personalizado (opcional)")
        .setPlaceholder("Como você quer que o Gui te chame?")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.customName || '')
        .setRequired(false);

    const titleInput = new TextInputBuilder()
        .setCustomId('customTitle')
        .setLabel("Título Personalizado (opcional)")
        .setPlaceholder("Ex: O Destruidor de Mundos")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.userTitle || '')
        .setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(titleInput));
    await interaction.showModal(modal);
}

// Função para salvar o título/nome customizado
async function handleTitleModalSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const customName = interaction.fields.getTextInputValue('customName');
    const customTitle = interaction.fields.getTextInputValue('customTitle');

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    
    await setDoc(userRef, { 
        customName: customName || null,
        userTitle: customTitle || null 
    }, { merge: true });

    await interaction.editReply({ content: 'Seu nome e/ou título foram atualizados!' });
}

// Handler principal de interações
export async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        const [prefix, action, ...params] = interaction.customId.split('_');
        if (prefix !== CUSTOM_ID_PREFIX) return;

        const targetUserId = params[0];

        if (action === 'update') {
            if (interaction.user.id !== targetUserId) return interaction.reply({ content: 'Você só pode atualizar seu próprio perfil.', ephemeral: true });
            await openProfileForm(interaction);
        } else if (action === 'customize' && params[0] === 'ai') {
            if (interaction.user.id !== targetUserId) return interaction.reply({ content: 'Você só pode personalizar suas próprias configurações.', ephemeral: true });
            await openAiCustomizationPanel(interaction);
        } else if (action === 'button' && params[0] === 'custom' && params[1] === 'title') {
            await openTitleModal(interaction);
        }
        
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === FORM_MODAL_ID) {
            await handleFormSubmit(interaction);
        } else if (interaction.customId === TITLE_MODAL_ID) {
            await handleTitleModalSubmit(interaction);
        }

    } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === RESPONSE_STYLE_SELECT_ID) {
            await savePreference(interaction, 'aiResponsePreference', interaction.values[0]);
        } else if (interaction.customId === PERSONA_SELECT_ID) {
            await savePreference(interaction, 'aiPersonality', interaction.values[0]);
        } else if (interaction.customId === TITLE_SELECT_ID) {
            const title = interaction.values[0] === 'Nenhum' ? null : interaction.values[0];
            await savePreference(interaction, 'userTitle', title);
        }
    }
}
