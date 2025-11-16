// src/interactions/buttons/seguir.js
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const customIdPrefix = 'seguir';

async function getOrCreateUserProfile(userId, username) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    let userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUserProfile = {
            id: userId,
            username,
            following: [],
            createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newUserProfile);
        userSnap = await getDoc(userRef);
    }
    return userSnap;
}

async function handleConfirm(interaction, targetUserId) {
    await interaction.deferUpdate(); // Acknowledges the interaction, allowing for more time to process

    const currentUser = interaction.user;
    const { firestore } = initializeFirebase();
    const currentUserRef = doc(firestore, 'users', currentUser.id);

    try {
        const currentUserSnap = await getOrCreateUserProfile(currentUser.id, currentUser.username);
        const targetUser = await interaction.client.users.fetch(targetUserId);
        
        const followingList = currentUserSnap.data()?.following || [];
        
        if (followingList.includes(targetUserId)) {
            // Already following, so let's unfollow
            await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
            await interaction.editReply({ 
                content: `Você deixou de seguir **${targetUser.username}**.`,
                components: []
            });
        } else {
            // Not following, so let's follow
            await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
            await interaction.editReply({ 
                content: `Agora você está seguindo **${targetUser.username}**!`,
                components: []
            });
        }
    } catch (error) {
        console.error("Erro ao processar o comando /seguir:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao tentar processar sua solicitação.', components: [] });
    }
}


export async function handleInteraction(interaction, container) {
    const [prefix, action, targetUserId] = interaction.customId.split('_');
    if (prefix !== customIdPrefix) return;

    if (interaction.isButton()) {
        if (action === 'confirm') {
            await handleConfirm(interaction, targetUserId);
        }
    }
}
