// src/interactions/buttons/personalizar-gui.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';

export const customIdPrefix = 'personalize';

export const CUSTOMIZE_AI_BUTTON_ID = `${customIdPrefix}_open`;
export const SELECT_STYLE_ID = `${customIdPrefix}_select_style`;
export const SELECT_PERSONA_ID = `${customIdPrefix}_select_persona`;
export const SELECT_LANGUAGE_ID = `${customIdPrefix}_select_language`;
export const SELECT_EMOJI_ID = `${customIdPrefix}_select_emoji`;
export const TOGGLE_CONTEXT_ID = `${customIdPrefix}_toggle_context`;

async function openAIPanel(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    let userData = userSnap.exists() ? userSnap.data() : null;

    if (!userSnap.exists()) {
        const newUserProfile = {
            id: interaction.user.id,
            username: interaction.user.username,
            reputationPoints: 0,
            credits: 0,
            createdAt: serverTimestamp(),
            aiResponsePreference: 'detailed',
            aiPersonality: 'amigavel',
            aiLanguage: 'pt_br',
            aiEmojiPreference: 'moderate',
            aiUseProfileContext: false,
        };
        await setDoc(userRef, newUserProfile);
        userData = newUserProfile;
    }

    const currentStyle = userData.aiResponsePreference || 'detailed';
    const currentPersona = userData.aiPersonality || 'amigavel';
    const currentLanguage = userData.aiLanguage || 'pt_br';
    const currentEmoji = userData.aiEmojiPreference || 'moderate';
    const useContext = userData.aiUseProfileContext || false;

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🤖 Personalização do Assistente Gui')
        .setDescription('Ajuste como o Gui interage com você. Suas preferências são salvas automaticamente.')
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
        .setStyle(useContext ? ButtonStyle.Success : ButtonStyle.Danger)
        .setEmoji(useContext ? '✅' : '❌');

    await interaction.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(styleMenu),
            new ActionRowBuilder().addComponents(personaMenu),
            new ActionRowBuilder().addComponents(languageMenu),
            new ActionRowBuilder().addComponents(emojiMenu),
            new ActionRowBuilder().addComponents(contextButton)
        ],
        ephemeral: true,
    });
}

async function handleSelection(interaction, field) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const selectedValue = interaction.values[0];

    try {
        await updateDoc(userRef, { [field]: selectedValue });
        await openAIPanel(interaction); // Reabre o painel com os valores atualizados
    } catch (e) {
        if (e.code === 5) { // NOT_FOUND error, user doc doesn't exist
            await openAIPanel(interaction); // Cria o perfil e reabre
        } else {
            console.error(`Erro ao atualizar campo ${field}:`, e);
            await interaction.followUp({ content: 'Ocorreu um erro ao salvar sua preferência.', ephemeral: true });
        }
    }
}

async function handleToggleContext(interaction) {
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const currentStatus = userSnap.exists() ? userSnap.data().aiUseProfileContext || false : false;

    try {
        await updateDoc(userRef, { aiUseProfileContext: !currentStatus });
        await openAIPanel(interaction);
    } catch (e) {
         if (e.code === 5) {
            await openAIPanel(interaction);
        } else {
            console.error(`Erro ao alternar contexto do perfil:`, e);
            await interaction.followUp({ content: 'Ocorreu um erro ao salvar sua preferência.', ephemeral: true });
        }
    }
}

export async function handleInteraction(interaction, container) {
    const customId = interaction.customId;

    if (customId === CUSTOMIZE_AI_BUTTON_ID) {
        await openAIPanel(interaction);
    } else if (customId === SELECT_STYLE_ID) {
        await handleSelection(interaction, 'aiResponsePreference');
    } else if (customId === SELECT_PERSONA_ID) {
        await handleSelection(interaction, 'aiPersonality');
    } else if (customId === SELECT_LANGUAGE_ID) {
        await handleSelection(interaction, 'aiLanguage');
    } else if (customId === SELECT_EMOJI_ID) {
        await handleSelection(interaction, 'aiEmojiPreference');
    } else if (customId === TOGGLE_CONTEXT_ID) {
        await handleToggleContext(interaction);
    }
}
