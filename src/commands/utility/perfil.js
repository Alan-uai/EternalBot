// src/commands/utility/perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
const ALLOWED_CHANNELS = [FORMULARIO_CHANNEL_ID, COMMUNITY_HELP_CHANNEL_ID];

export const CUSTOM_ID_PREFIX = 'perfil';
export const UPDATE_PROFILE_BUTTON_ID = `${CUSTOM_ID_PREFIX}_update`;
export const CUSTOMIZE_AI_BUTTON_ID = `${CUSTOM_ID_PREFIX}_customize_ai`;
export const GOALS_PANEL_BUTTON_ID = `${CUSTOM_ID_PREFIX}_goals_panel`;


export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Cria, atualiza ou visualiza um perfil de jogador.')
    .addUserOption(option => 
        option.setName('usuario')
              .setDescription('O usuário do qual você quer ver o perfil (opcional).')
              .setRequired(false));

export async function execute(interaction) {
     if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais <#${FORMULARIO_CHANNEL_ID}> ou <#${COMMUNITY_HELP_CHANNEL_ID}>.`, ephemeral: true });
    }
    
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const isViewingSelf = targetUser.id === interaction.user.id;

    await interaction.deferReply({ ephemeral: true });
    
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', targetUser.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        if (isViewingSelf) {
             const { openProfileForm } = await import('../../interactions/buttons/iniciar-perfil.js');
             await interaction.deleteReply();
             return openProfileForm(interaction, true); // Passa true para indicar que é a criação inicial
        } else {
            return interaction.editReply(`O usuário ${targetUser.username} ainda não tem um perfil no Guia Eterno.`);
        }
    }
    
    try {
        const userData = userSnap.data();
        const profileImage = await createProfileImage(userData, targetUser);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        
        const components = [];
        if(isViewingSelf) {
            const managementRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId(`${UPDATE_PROFILE_BUTTON_ID}_${targetUser.id}`).setLabel('Atualizar Perfil').setStyle(ButtonStyle.Primary).setEmoji('📝'),
                    new ButtonBuilder().setCustomId(`${CUSTOMIZE_AI_BUTTON_ID}_${targetUser.id}`).setLabel('Personalizar o Gui').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                    new ButtonBuilder().setCustomId(`${GOALS_PANEL_BUTTON_ID}_${targetUser.id}`).setLabel('Minhas Metas').setStyle(ButtonStyle.Secondary).setEmoji('🎯')
                );
            components.push(managementRow);
        }

        return interaction.editReply({ files: [attachment], components });
    } catch(e) {
        console.error("Erro ao criar imagem de perfil no /perfil:", e);
        return interaction.editReply('Ocorreu um erro ao gerar a imagem de perfil do usuário.');
    }
}
