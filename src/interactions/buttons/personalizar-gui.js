// src/interactions/buttons/personalizar-gui.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { officialLanguages } from '../../ai/official-languages.js';
import { funLanguages } from '../../ai/fun-languages.js';
import { emojiStyles } from '../../ai/emoji-styles.js';

export const customIdPrefix = 'personalize';

// Mapeamentos para os IDs e dados
const PANELS = {
    style: {
        id: `${customIdPrefix}_style`,
        data: responseStyles,
        field: 'aiResponsePreference',
        title: 'Estilo de Resposta',
        default: 'detailed'
    },
    persona: {
        id: `${customIdPrefix}_persona`,
        data: personas,
        field: 'aiPersonality',
        title: 'Personalidade',
        default: 'amigavel'
    },
    language: { 
        id_prefix: `${customIdPrefix}_language`, // Usar um prefixo para IDs únicos
        field: 'aiLanguage',
        title: 'Idioma',
        default: 'pt_br'
    },
    emoji: {
        id: `${customIdPrefix}_emoji`,
        data: emojiStyles,
        field: 'aiEmojiPreference',
        title: 'Uso de Emojis',
        default: 'moderate'
    }
};

const PROFILE_UPDATE_MODAL_ID = `${customIdPrefix}_profile_modal`;
const PROFILE_UPDATE_BUTTON_ID = `${customIdPrefix}_profile_update`;
const PROFILE_CONTEXT_TOGGLE_ID = `${customIdPrefix}_profile_context_toggle`;


// Função para buscar ou criar um perfil de usuário
async function getOrCreateUserProfile(userId, username) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data();
    }
    
    // Se não existe, cria um perfil com valores padrão
    const newUserProfile = {
        id: userId,
        username,
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
    return newUserProfile;
}

export async function openAIPanel(interaction, panelType) {
    const userData = await getOrCreateUserProfile(interaction.user.id, interaction.user.username);
    
    const panelConfig = PANELS[panelType];
    if (!panelConfig) return;

    const currentSelection = userData[panelConfig.field] || panelConfig.default;
    const allLanguages = { ...officialLanguages, ...funLanguages };

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🎨 Personalizar ${panelConfig.title}`)
        .setDescription(`Sua configuração atual é: **${(allLanguages[currentSelection] || panelConfig.data?.[currentSelection])?.name}**.\n\nSelecione uma nova opção abaixo. Sua preferência será salva automaticamente.`);
        
    const components = [];

    // Lógica especial para o painel de idiomas unificado
    if (panelType === 'language') {
        const officialMenu = new StringSelectMenuBuilder()
            .setCustomId(`${PANELS.language.id_prefix}_official`) // ID Único
            .setPlaceholder('Selecione um idioma oficial...')
            .addOptions(Object.keys(officialLanguages).map(key => ({
                label: officialLanguages[key].name,
                value: key,
                default: key === currentSelection
            })));
        components.push(new ActionRowBuilder().addComponents(officialMenu));
        
        const funMenu = new StringSelectMenuBuilder()
            .setCustomId(`${PANELS.language.id_prefix}_fun`) // ID Único
            .setPlaceholder('Ou escolha um idioma divertido/fictício...')
            .addOptions(Object.keys(funLanguages).map(key => ({
                label: funLanguages[key].name,
                value: key,
                default: key === currentSelection
            })));
        components.push(new ActionRowBuilder().addComponents(funMenu));

    } else {
        // Lógica para todos os outros painéis
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(panelConfig.id)
            .setPlaceholder(`Selecione um(a) ${panelConfig.title}...`)
            .addOptions(Object.keys(panelConfig.data).map(key => ({
                label: panelConfig.data[key].name,
                value: key,
                default: key === currentSelection
            })));
        components.push(new ActionRowBuilder().addComponents(selectMenu));
    }
        
    if (interaction.isCommand()) {
        await interaction.reply({
            embeds: [embed],
            components: components,
            ephemeral: true,
        });
    } else {
         await interaction.update({
            embeds: [embed],
            components: components,
            ephemeral: true,
        });
    }
}

async function handleSelectionChange(interaction, panelConfig) {
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;
    const selectedValue = interaction.values[0];
    
    if (!panelConfig) return;

    const userRef = doc(firestore, 'users', userId);

    try {
        await getOrCreateUserProfile(userId, interaction.user.username);
        
        await updateDoc(userRef, {
            [panelConfig.field]: selectedValue
        });
        
        const allData = { ...responseStyles, ...personas, ...officialLanguages, ...funLanguages, ...emojiStyles };
        
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`Sua configuração de ${panelConfig.title.toLowerCase()} atual é: **${allData[selectedValue]?.name}**.\n\nSua preferência foi salva com sucesso!`);

        // Atualiza ambos os menus para refletir a seleção correta
        const updatedComponents = interaction.message.components.map(row => {
            const menuComponent = row.components[0];
            if (menuComponent.type !== 3) return row; // Ignora se não for um menu de seleção

            // Determina qual conjunto de dados usar para este menu
            let menuData;
            if (menuComponent.customId.includes('_official')) {
                menuData = officialLanguages;
            } else if (menuComponent.customId.includes('_fun')) {
                menuData = funLanguages;
            } else {
                // Para outros painéis que não são de idioma
                const otherPanelType = Object.keys(PANELS).find(key => menuComponent.customId === PANELS[key].id);
                menuData = PANELS[otherPanelType]?.data;
            }
            
            if (!menuData) return row; // Se não encontrar dados, mantém o componente original

            const updatedMenu = StringSelectMenuBuilder.from(menuComponent)
                .setOptions(Object.keys(menuData).map(key => ({
                    label: menuData[key].name,
                    value: key,
                    default: key === selectedValue
                })));
            
            return new ActionRowBuilder().addComponents(updatedMenu);
        });

        await interaction.update({ embeds: [embed], components: updatedComponents });

    } catch (error) {
        console.error(`Erro ao salvar preferência de ${panelConfig.title}:`, error);
        await interaction.followUp({ content: 'Ocorreu um erro ao salvar sua preferência.', ephemeral: true });
    }
}

async function handleProfileContextToggle(interaction) {
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;
    const userRef = doc(firestore, 'users', userId);

    const userData = await getOrCreateUserProfile(userId, interaction.user.username);
    const newContextState = !(userData.aiUseProfileContext === true);

    await updateDoc(userRef, { aiUseProfileContext: newContextState });
    
    // Recarrega o painel do perfil para mostrar o estado atualizado
    const { execute: executePerfil } = await import('../../commands/utility/perfil.js');
    interaction.isCommand = () => false; // Simula que não é um novo comando
    interaction.update = (options) => interaction.editReply(options);
    await executePerfil(interaction);
}


async function openProfileUpdateModal(interaction) {
    const userData = await getOrCreateUserProfile(interaction.user.id, interaction.user.username);
    
    const modal = new ModalBuilder()
        .setCustomId(PROFILE_UPDATE_MODAL_ID)
        .setTitle('Atualizar Dados do Perfil');

    modal.addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('rank').setLabel("Seu Rank Atual no Jogo").setStyle(TextInputStyle.Short).setValue(String(userData.rank || '')).setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('currentWorld').setLabel("Seu Mundo Atual no Jogo").setStyle(TextInputStyle.Short).setValue(String(userData.currentWorld || '')).setRequired(false)
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('dps').setLabel("Seu DPS Atual (ex: 100T, 50qd)").setStyle(TextInputStyle.Short).setValue(userData.dps || '').setRequired(false)
        )
    );
    await interaction.showModal(modal);
}

async function handleProfileUpdateSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;
    const userRef = doc(firestore, 'users', userId);

    const rank = interaction.fields.getTextInputValue('rank');
    const currentWorld = interaction.fields.getTextInputValue('currentWorld');
    const dps = interaction.fields.getTextInputValue('dps');

    try {
        await updateDoc(userRef, {
            rank: parseInt(rank, 10) || null,
            currentWorld: parseInt(currentWorld, 10) || null,
            dps: dps || null
        });
        await interaction.editReply('✅ Seu perfil foi atualizado com sucesso!');
        
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        await interaction.editReply('❌ Ocorreu um erro ao atualizar seu perfil.');
    }
}


export async function handleInteraction(interaction, container) {
    const customId = interaction.customId;

    if (interaction.isStringSelectMenu()) {
        const panelTypeKey = Object.keys(PANELS).find(key => customId.startsWith(PANELS[key].id_prefix || PANELS[key].id));
        if (panelTypeKey) {
            await handleSelectionChange(interaction, PANELS[panelTypeKey]);
        }
    }
    else if (interaction.isButton()) {
        if (customId === PROFILE_CONTEXT_TOGGLE_ID) {
             await handleProfileContextToggle(interaction);
        } else if (customId === PROFILE_UPDATE_BUTTON_ID) {
            await openProfileUpdateModal(interaction);
        }
    }
    else if (interaction.isModalSubmit()) {
        if (customId === PROFILE_UPDATE_MODAL_ID) {
            await handleProfileUpdateSubmit(interaction);
        }
    }
}
