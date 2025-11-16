// src/commands/utility/seguir.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

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


export const data = new SlashCommandBuilder()
    .setName('seguir')
    .setDescription('Segue ou deixa de seguir um usuário para receber notificações de seus farms.')
    .addUserOption(option => 
        option.setName('usuario')
            .setDescription('O usuário que você deseja seguir ou deixar de seguir.')
            .setRequired(true));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const targetUser = interaction.options.getUser('usuario');
    const currentUser = interaction.user;

    if (targetUser.id === currentUser.id) {
        return interaction.editReply({ content: 'Você não pode seguir a si mesmo.' });
    }
    if (targetUser.bot) {
        return interaction.editReply({ content: 'Você não pode seguir um bot.' });
    }

    const { firestore } = initializeFirebase();
    const currentUserRef = doc(firestore, 'users', currentUser.id);

    try {
        const currentUserSnap = await getOrCreateUserProfile(currentUser.id, currentUser.username);
        const followingList = currentUserSnap.data()?.following || [];
        const isFollowing = followingList.includes(targetUser.id);
        
        let responseMessage;
        if (isFollowing) {
            // Deixar de seguir
            await updateDoc(currentUserRef, {
                following: arrayRemove(targetUser.id)
            });
            responseMessage = `Você deixou de seguir **${targetUser.username}**.`;
        } else {
            // Seguir
            await updateDoc(currentUserRef, {
                following: arrayUnion(targetUser.id)
            });
            responseMessage = `Você agora está seguindo **${targetUser.username}**! Você será notificado quando ele(a) iniciar um farm.`;
        }

        await interaction.editReply({ content: responseMessage });

    } catch (error) {
        console.error("Erro ao processar o comando /seguir:", error);
        await interaction.editReply({ content: 'Ocorreu um erro ao tentar processar sua solicitação.' });
    }
}
