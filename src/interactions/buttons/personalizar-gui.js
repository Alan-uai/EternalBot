// src/interactions/buttons/personalizar-gui.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';

export const customIdPrefix = 'personalize';

const SELECT_STYLE_ID = `${customIdPrefix}_select_style`;
const SELECT_PERSONA_ID = `${customIdPrefix}_select_persona`;
const SELECT_LANGUAGE_ID = `${customIdPrefix}_select_language`;
const SELECT_EMOJI_ID = `${customIdPrefix}_select_emoji`;
const TOGGLE_CONTEXT_ID = `${customIdPrefix}_toggle_context`;
const SAVE_CHANGES_ID = `${customIdPrefix}_save`;
const DISCARD_CHANGES_ID = `${customIdPrefix}_discard`;

// Helper para obter as preferências (salvas ou temporárias)
async function getUserPreferences(interaction) {
    const { client } = interaction;
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;

    // 1. Verifica se há alterações pendentes na memória
    const tempPrefs = client.container.interactions.get(`temp_prefs_${userId}`);
    if (tempPrefs) {
        return tempPrefs;
    }

    // 2. Se não, busca as preferências salvas no Firestore
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }

    // 3. Se não existe no Firestore, cria um perfil padrão (não salva ainda, só retorna o objeto)
    return {
        aiResponsePreference: 'detailed',
        aiPersonality: 'amigavel',
        aiLanguage: 'pt_br',
        aiEmojiPreference: 'moderate',
        aiUseProfileContext: false,
    };
}


export async function openAIPanel(interaction, isUpdate = false) {
    const prefs = await getUserPreferences(interaction);
    const tempPrefs = interaction.client.container.interactions.get(`temp_prefs_${interaction.user.id}`);
    const hasPendingChanges = !!tempPrefs;


    const currentStyle = prefs.aiResponsePreference || 'detailed';
    const currentPersona = prefs.aiPersonality || 'amigavel';
    const currentLanguage = prefs.aiLanguage || 'pt_br';
    const currentEmoji = prefs.aiEmojiPreference || 'moderate';
    const useContext = prefs.aiUseProfileContext === true;

    const embed = new EmbedBuilder()
        .setColor(hasPendingChanges ? 0xFFA500 : 0x5865F2) // Laranja se houver mudanças, azul senão
        .setTitle('🤖 Personalização do Assistente Gui')
        .setDescription(hasPendingChanges 
            ? '**Você tem alterações não salvas!** Use os menus para mudar e clique em "Salvar" para aplicar.'
            : 'Ajuste como o Gui interage com você. Suas preferências são salvas ao clicar no botão "Salvar".'
        )
        .addFields(
            { name: 'Estilo da Resposta', value: `Atual: **${responseStyles[currentStyle]?.name || 'Padrão'}**`, inline: true },
            { name: 'Personalidade', value: `Atual: **${personas[currentPersona]?.name || 'Padrão'}**`, inline: true },
            { name: 'Idioma', value: `Atual: **${languages[currentLanguage]?.name || 'Padrão'}**`, inline: true }
        );

    const styleMenu = new StringSelectMenuBuilder()
        .setCustomId(SELECT_STYLE_ID)
        .setPlaceholder('Mudar Estilo de Resposta')
        .addOptions(Object.keys(responseStyles).map(key => ({
            label: responseStyles[key].name,
            value: key,
            default: key === currentStyle
        })));

    const personaMenu = new StringSelectMenuBuilder()
        .setCustomId(SELECT_PERSONA_ID)
        .setPlaceholder('Mudar Personalidade')
        .addOptions(Object.keys(personas).map(key => ({
            label: personas[key].name,
            value: key,
            default: key === currentPersona
        })));

    const languageMenu = new StringSelectMenuBuilder()
        .setCustomId(SELECT_LANGUAGE_ID)
        .setPlaceholder('Mudar Idioma da Resposta')
        .addOptions(Object.keys(languages).map(key => ({
            label: languages[key].name,
            value: key,
            default: key === currentLanguage
        })));
        
    const emojiMenu = new StringSelectMenuBuilder()
        .setCustomId(SELECT_EMOJI_ID)
        .setPlaceholder(`Uso de Emojis: ${emojiStyles[currentEmoji]?.name || 'Padrão'}`)
        .addOptions(Object.keys(emojiStyles).map(key => ({
            label: emojiStyles[key].name,
            value: key,
            default: key === currentEmoji
        })));

    const contextButton = new ButtonBuilder()
        .setCustomId(TOGGLE_CONTEXT_ID)
        .setLabel(`Usar dados do perfil: ${useContext ? 'Sim' : 'Não'}`)
        .setStyle(useContext ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setEmoji(useContext ? '✅' : '❌');
        
    const saveButton = new ButtonBuilder()
        .setCustomId(SAVE_CHANGES_ID)
        .setLabel('Salvar Alterações')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💾')
        .setDisabled(!hasPendingChanges); // Desabilita se não houver mudanças

    const discardButton = new ButtonBuilder()
        .setCustomId(DISCARD_CHANGES_ID)
        .setLabel('Descartar')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✖️')
        .setDisabled(!hasPendingChanges);

    const replyOptions = {
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(styleMenu),
            new ActionRowBuilder().addComponents(personaMenu),
            new ActionRowBuilder().addComponents(languageMenu),
            new ActionRowBuilder().addComponents(emojiMenu),
            new ActionRowBuilder().addComponents(contextButton, saveButton, discardButton)
        ],
        ephemeral: true,
    };
    
    if (isUpdate) {
        await interaction.update(replyOptions);
    } else {
        await interaction.reply(replyOptions);
    }
}

async function handleSelectionChange(interaction, field) {
    await interaction.deferUpdate();
    const { client } = interaction;
    const userId = interaction.user.id;
    const selectedValue = interaction.values[0];

    // Pega as preferências atuais (salvas ou temporárias)
    const currentPrefs = await getUserPreferences(interaction);
    
    // Atualiza o valor na cópia temporária
    currentPrefs[field] = selectedValue;

    // Armazena a cópia modificada na memória
    client.container.interactions.set(`temp_prefs_${userId}`, currentPrefs);
    
    // Reabre o painel para refletir a mudança pendente
    await openAIPanel(interaction, true);
}


async function handleToggleContext(interaction) {
    await interaction.deferUpdate();
    const { client } = interaction;
    const userId = interaction.user.id;

    const currentPrefs = await getUserPreferences(interaction);
    currentPrefs.aiUseProfileContext = !currentPrefs.aiUseProfileContext;

    client.container.interactions.set(`temp_prefs_${userId}`, currentPrefs);
    
    await openAIPanel(interaction, true);
}


async function handleSaveChanges(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { client } = interaction;
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;

    const tempPrefs = client.container.interactions.get(`temp_prefs_${userId}`);
    if (!tempPrefs) {
        return interaction.editReply({ content: 'Nenhuma alteração para salvar.', components: [] });
    }

    const userRef = doc(firestore, 'users', userId);
    
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            await updateDoc(userRef, tempPrefs);
        } else {
            // Se o usuário não existe, cria o documento com as preferências e campos padrão
            const newUserProfile = {
                ...tempPrefs,
                id: userId,
                username: interaction.user.username,
                reputationPoints: 0,
                credits: 0,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserProfile);
        }

        // Limpa as alterações temporárias
        client.container.interactions.delete(`temp_prefs_${userId}`);
        
        await interaction.editReply({ content: '✅ Suas preferências foram salvas com sucesso!' });

    } catch (error) {
        console.error("Erro ao salvar preferências:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao salvar suas preferências.' });
    }
}

async function handleDiscardChanges(interaction) {
    interaction.client.container.interactions.delete(`temp_prefs_${interaction.user.id}`);
    await openAIPanel(interaction, true);
}


export async function handleInteraction(interaction, container) {
    const customId = interaction.customId;

    if (customId === SELECT_STYLE_ID) {
        await handleSelectionChange(interaction, 'aiResponsePreference');
    } else if (customId === SELECT_PERSONA_ID) {
        await handleSelectionChange(interaction, 'aiPersonality');
    } else if (customId === SELECT_LANGUAGE_ID) {
        await handleSelectionChange(interaction, 'aiLanguage');
    } else if (customId === SELECT_EMOJI_ID) {
        await handleSelectionChange(interaction, 'aiEmojiPreference');
    } else if (customId === TOGGLE_CONTEXT_ID) {
        await handleToggleContext(interaction);
    } else if (customId === SAVE_CHANGES_ID) {
        await handleSaveChanges(interaction);
    } else if (customId === DISCARD_CHANGES_ID) {
        await handleDiscardChanges(interaction);
    }
}
