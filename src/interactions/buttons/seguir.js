// src/interactions/buttons/seguir.js
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

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


async function handleToggle(interaction, targetUserId) {
    await interaction.deferReply({ ephemeral: true });

    const currentUser = interaction.user;
    
    const { firestore } = initializeFirebase();
    const currentUserRef = doc(firestore, 'users', currentUser.id);

    try {
        const currentUserSnap = await getOrCreateUserProfile(currentUser.id, currentUser.username);
        const followingList = currentUserSnap.data()?.following || [];
        const isFollowing = followingList.includes(targetUserId);
        
        let responseMessage;

        if (isFollowing) {
            await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
            responseMessage = `Você deixou de seguir este usuário.`;
        } else {
            await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
            responseMessage = `Você agora está seguindo este usuário!`;
        }

        await interaction.editReply({ content: responseMessage });
        
        // Atualiza a mensagem original para refletir a mudança no botão (opcional, mas bom UX)
        const updatedButton = interaction.message.components[0].components[0].setLabel(isFollowing ? 'Seguir Host' : 'Deixar de Seguir').setStyle(isFollowing ? 'Success' : 'Danger');
        await interaction.message.edit({ components: [new ActionRowBuilder().addComponents(updatedButton)] });


    } catch (error) {
        console.error("Erro ao processar o botão de seguir/deixar de seguir:", error);
        await interaction.editReply({ content: 'Ocorreu um erro.' });
    }
}


export async function handleInteraction(interaction, container) {
    const [prefix, action, targetUserId] = interaction.customId.split('_');
    if (prefix !== customIdPrefix) return;

    if (action === 'toggle') {
        await handleToggle(interaction, targetUserId);
    }
}
