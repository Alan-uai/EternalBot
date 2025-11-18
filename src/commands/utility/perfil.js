// src/commands/utility/perfil.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

async function getOrCreateUserProfile(userId, username) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    let userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUserProfile = {
            id: userId,
            username,
            reputationPoints: 0,
            credits: 0,
            createdAt: serverTimestamp(),
            following: [],
        };
        await setDoc(userRef, newUserProfile);
        userSnap = await getDoc(userRef);
    }
    return userSnap;
}

export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Exibe seu perfil de jogador, hosts seguidos e permite gerenciar o contexto da IA.')
    .addUserOption(option =>
        option.setName('usuario')
            .setDescription('Veja o perfil de outro usuário (opcional).')
            .setRequired(false));

export async function execute(interaction, container) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const isSelf = targetUser.id === interaction.user.id;
    const { imageGenerator } = container.services;

    const userSnap = await getOrCreateUserProfile(targetUser.id, targetUser.username);
    const userData = userSnap.data();

    // Gerar imagem do perfil
    try {
        const profileImageBuffer = await imageGenerator.createProfileImage(targetUser, userData);
        const attachment = new AttachmentBuilder(profileImageBuffer, { name: `perfil-${targetUser.username}.png` });

        const components = [];
        if (isSelf) {
            const useContext = userData.aiUseProfileContext === true;
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('personalize_profile_update')
                    .setLabel('Atualizar Dados')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('personalize_profile_context_toggle')
                    .setLabel(useContext ? 'Desativar Contexto' : 'Ativar Contexto')
                    .setStyle(useContext ? ButtonStyle.Danger : ButtonStyle.Success)
            );
            components.push(row);
        } else {
             const row = new ActionRowBuilder();
             const selfSnap = await getOrCreateUserProfile(interaction.user.id, interaction.user.username);
             const isFollowing = (selfSnap.data().following || []).includes(targetUser.id);
             
             row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`seguir_toggle_${targetUser.id}`)
                    .setLabel(isFollowing ? 'Deixar de Seguir' : 'Seguir Host')
                    .setStyle(isFollowing ? ButtonStyle.Danger : ButtonStyle.Success)
                    .setEmoji('🔔')
             );

             // Adiciona botão do perfil Roblox se o ID existir
             if (userData.robloxId) {
                row.addComponents(
                    new ButtonBuilder()
                        .setLabel('Perfil Roblox')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://www.roblox.com/users/${userData.robloxId}/profile`)
                        .setEmoji('🔗')
                );
             }

             components.push(row);
        }

        await interaction.editReply({ files: [attachment], components, ephemeral: true });

    } catch (error) {
        container.logger.error("Erro ao gerar ou enviar imagem do perfil:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao tentar exibir o perfil.', ephemeral: true });
    }
}
