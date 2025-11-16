// src/interactions/buttons/personalizar-gui.js
import { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { personas } from '../../ai/personas.js';
import { responseStyles } from '../../ai/response-styles.js';
import { languages } from '../../ai/languages.js';
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
        id: `${customIdPrefix}_language`,
        data: languages,
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
    
    // Lógica específica para o painel de perfil
    if (panelType === 'profile') {
        const useContext = userData.aiUseProfileContext === true;

        const embed = new EmbedBuilder()
            .setColor(0x1F8B4C)
            .setTitle('👤 Seu Perfil e Contexto da IA')
            .setDescription('Gerencie seus dados de jogo e como a IA os utiliza.')
            .addFields(
                { name: 'Seu Rank Atual', value: `\`${userData.rank || 'Não definido'}\``, inline: true },
                { name: 'Seu Mundo Atual', value: `\`${userData.currentWorld || 'Não definido'}\``, inline: true },
                { name: 'Seu DPS Atual', value: `\`${userData.dps || 'Não definido'}\``, inline: true },
                { name: 'Uso de Contexto pela IA', value: `**${useContext ? 'Ativado' : 'Desativado'}**\n> Quando ativado, a IA usará seus dados de perfil para dar respostas mais personalizadas.`, inline: false }
            )
            .setFooter({ text: 'Use o botão "Atualizar Perfil" para sincronizar seus dados.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(PROFILE_UPDATE_BUTTON_ID)
                .setLabel('Atualizar Perfil')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId(PROFILE_CONTEXT_TOGGLE_ID)
                .setLabel(useContext ? 'Desativar Contexto' : 'Ativar Contexto')
                .setStyle(useContext ? ButtonStyle.Danger : ButtonStyle.Success)
        );

        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // Lógica para os outros painéis de personalização
    const panelConfig = PANELS[panelType];
    if (!panelConfig) return;

    const currentSelection = userData[panelConfig.field] || panelConfig.default;

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(panelConfig.id)
        .setPlaceholder(`Selecione um(a) ${panelConfig.title}...`)
        .addOptions(Object.keys(panelConfig.data).map(key => ({
            label: panelConfig.data[key].name,
            value: key,
            default: key === currentSelection
        })));
        
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🎨 Personalizar ${panelConfig.title}`)
        .setDescription(`Sua configuração atual é: **${panelConfig.data[currentSelection]?.name}**.\n\nSelecione uma nova opção abaixo. Sua preferência será salva automaticamente.`);

    await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        ephemeral: true,
    });
}

async function handleSelectionChange(interaction, panelType) {
    const { firestore } = initializeFirebase();
    const userId = interaction.user.id;
    const selectedValue = interaction.values[0];
    
    const panelConfig = PANELS[panelType];
    if (!panelConfig) return;

    const userRef = doc(firestore, 'users', userId);

    try {
        // Garante que o documento existe antes de tentar atualizar
        await getOrCreateUserProfile(userId, interaction.user.username);
        
        // Atualiza o campo específico
        await updateDoc(userRef, {
            [panelConfig.field]: selectedValue
        });

        // Atualiza a mensagem para confirmar a seleção
        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`Sua configuração atual é: **${panelConfig.data[selectedValue]?.name}**.\n\nSua preferência foi salva com sucesso!`);

        // Recria o menu com a nova opção padrão para refletir a mudança
        const updatedMenu = StringSelectMenuBuilder.from(interaction.message.components[0].components[0])
            .setOptions(Object.keys(panelConfig.data).map(key => ({
                label: panelConfig.data[key].name,
                value: key,
                default: key === selectedValue
            })));
        
        await interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(updatedMenu)] });

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
    const newContextState = !userData.aiUseProfileContext;

    await updateDoc(userRef, { aiUseProfileContext: newContextState });
    
    // Atualiza o painel para refletir a mudança
    await openAIPanel(interaction, 'profile');
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

    // Roteador para os menus de seleção
    if (interaction.isStringSelectMenu()) {
        const panelType = Object.keys(PANELS).find(key => customId === PANELS[key].id);
        if (panelType) {
            await handleSelectionChange(interaction, panelType);
        }
    }
    // Roteador para os botões
    else if (interaction.isButton()) {
        if (customId === PROFILE_CONTEXT_TOGGLE_ID) {
            await handleProfileContextToggle(interaction);
        } else if (customId === PROFILE_UPDATE_BUTTON_ID) {
            await openProfileUpdateModal(interaction);
        }
    }
    // Roteador para os modais
    else if (interaction.isModalSubmit()) {
        if (customId === PROFILE_UPDATE_MODAL_ID) {
            await handleProfileUpdateSubmit(interaction);
        }
    }
}
