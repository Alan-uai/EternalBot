// src/commands/utility/perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
const ALLOWED_CHANNELS = [FORMULARIO_CHANNEL_ID, COMMUNITY_HELP_CHANNEL_ID];

export const CUSTOM_ID_PREFIX = 'perfil';
export const FORM_BUTTON_ID = `${CUSTOM_ID_PREFIX}_abrir`;
export const IMPORT_BUTTON_ID = `${CUSTOM_ID_PREFIX}_importar`;
export const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal`;
export const IMPORT_MODAL_ID = `${CUSTOM_ID_PREFIX}_importar_modal`;
const NOTIFICATION_BUTTON_PREFIX = `${CUSTOM_ID_PREFIX}_notify`;


export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Cria, atualiza ou visualiza seu perfil de jogador.')
    .addUserOption(option => 
        option.setName('usuario')
              .setDescription('O usuário do qual você quer ver o perfil (opcional).')
              .setRequired(false));

export async function execute(interaction) {
     if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais <#${FORMULARIO_CHANNEL_ID}> ou <#${COMMUNITY_HELP_CHANNEL_ID}>.`, ephemeral: true });
    }
    
    const targetUser = interaction.options.getUser('usuario') || interaction.user;

    await interaction.deferReply({ ephemeral: true });
    
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', targetUser.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Se o perfil não existe E o usuário está tentando ver o seu próprio perfil
        if (targetUser.id === interaction.user.id) {
             const { openProfileForm } = await import('../../interactions/buttons/iniciar-perfil.js');
             // Mostra o formulário de criação diretamente
             await interaction.deleteReply(); // Deleta o "Thinking..." para o modal aparecer corretamente
             return openProfileForm(interaction);
        } else {
            // Se está tentando ver o perfil de outro que não existe
            return interaction.editReply(`O usuário ${targetUser.username} ainda não tem um perfil no Guia Eterno.`);
        }
    }
    
    // Se o perfil existe, mostra a imagem
    try {
        const profileImage = await createProfileImage(userSnap.data(), targetUser);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        
        const components = [];
        // Mostra os botões de gerenciamento apenas se o usuário estiver vendo seu próprio perfil
        if(targetUser.id === interaction.user.id) {
            const managementRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`${CUSTOM_ID_PREFIX}_update_${targetUser.id}`).setLabel('Atualizar Perfil').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                    new ButtonBuilder().setCustomId(`${CUSTOM_ID_PREFIX}_dungeonconfig_${targetUser.id}`).setLabel('Config. Dungeon').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
                    new ButtonBuilder().setCustomId(`${NOTIFICATION_BUTTON_PREFIX}_toggle_${targetUser.id}`).setLabel('Notificações').setStyle(ButtonStyle.Secondary).setEmoji('🔔')
                );
            components.push(managementRow);
        }

        return interaction.editReply({ files: [attachment], components });
    } catch(e) {
        console.error("Erro ao criar imagem de perfil no /perfil:", e);
        return interaction.editReply('Ocorreu um erro ao gerar a imagem de perfil do usuário.');
    }
}

    