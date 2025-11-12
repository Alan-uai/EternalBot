// src/interactions/buttons/riddle.js
import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { RIDDLE_DOC_ID } from '../../jobs/whispersAndRiddles.js';

export const customIdPrefix = 'riddle';
const MODAL_ID = 'riddle_modal_submit';

async function handleAnswerButton(interaction, riddleId) {
    const { firestore } = initializeFirebase();
    const riddleRef = doc(firestore, 'bot_config', RIDDLE_DOC_ID);
    const riddleSnap = await getDoc(riddleRef);

    if (!riddleSnap.exists() || !riddleSnap.data().isActive || riddleSnap.data().id !== riddleId) {
        return interaction.reply({ content: 'Este sussurro já desapareceu no tempo...', ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId(`${MODAL_ID}_${riddleId}`)
        .setTitle('Qual a resposta do Sussurro?');

    const answerInput = new TextInputBuilder()
        .setCustomId('riddle_answer_input')
        .setLabel("Sua resposta")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Digite sua resposta aqui...")
        .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(answerInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
}


async function handleModalSubmit(interaction, riddleId) {
    await interaction.deferReply({ ephemeral: true });

    const userAnswer = interaction.fields.getTextInputValue('riddle_answer_input').toLowerCase().trim();
    const { firestore } = initializeFirebase();
    const { logger } = interaction.client.container;
    
    const riddleRef = doc(firestore, 'bot_config', RIDDLE_DOC_ID);
    const riddleSnap = await getDoc(riddleRef);

    if (!riddleSnap.exists() || !riddleSnap.data().isActive || riddleSnap.data().id !== riddleId) {
        return interaction.editReply({ content: 'Este sussurro já desapareceu no tempo...' });
    }

    const riddleData = riddleSnap.data();
    const correctAnswers = riddleData.answers.map(a => a.toLowerCase().trim());

    if (correctAnswers.includes(userAnswer)) {
        const alreadySolved = riddleData.solvedBy?.includes(interaction.user.id) || false;
        if (alreadySolved) {
            return interaction.editReply({ content: 'Você já decifrou este sussurro! Espere pelo próximo.' });
        }
        
        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        
        let newReputation = riddleData.reputation;
        if (userSnap.exists()) {
            newReputation += userSnap.data().reputationPoints || 0;
            await updateDoc(userRef, { 
                reputationPoints: newReputation,
                riddlesSolved: (userSnap.data().riddlesSolved || 0) + 1
            });
        }
        
        const updatedSolvedBy = [...(riddleData.solvedBy || []), interaction.user.id];
        const riddleUpdateData = { solvedBy: updatedSolvedBy };

        let finalMessage = `Parabéns! Você decifrou o sussurro e ganhou **${riddleData.reputation}** pontos de reputação! ✨`;

        if (updatedSolvedBy.length >= riddleData.maxWinners) {
            riddleUpdateData.isActive = false;
            finalMessage += '\nVocê foi o último a acertar. O sussurro se desvaneceu...';
        }

        await updateDoc(riddleRef, riddleUpdateData);

        logger.info(`[Charada] Usuário ${interaction.user.tag} acertou a charada '${riddleData.id}'.`);
        return interaction.editReply({ content: finalMessage });

    } else {
        return interaction.editReply({ content: 'O eco da sua resposta se perde no vazio... Tente novamente.' });
    }
}


export async function handleInteraction(interaction, container) {
    const [prefix, action, riddleId] = interaction.customId.split('_');

    if (prefix !== customIdPrefix) return;

    if (interaction.isButton() && action === 'answer') {
        await handleAnswerButton(interaction, riddleId);
    } else if (interaction.isModalSubmit() && action === 'modal') {
        const modalRiddleId = interaction.customId.split('_')[3];
        await handleModalSubmit(interaction, modalRiddleId);
    }
}
