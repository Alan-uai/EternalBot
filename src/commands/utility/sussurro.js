// src/commands/utility/sussurro.js
import { SlashCommandBuilder } from 'discord.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('sussurro')
    .setDescription('Tenta resolver a charada ou sussurro ativo.')
    .addStringOption(option =>
        option.setName('resposta')
            .setDescription('Sua resposta para a charada.')
            .setRequired(true)
    );

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const userAnswer = interaction.options.getString('resposta').toLowerCase().trim();
    const { firestore } = initializeFirebase();
    const { logger } = interaction.client.container;
    
    const riddleRef = doc(firestore, 'bot_config', 'currentRiddle');
    const riddleSnap = await getDoc(riddleRef);

    if (!riddleSnap.exists() || !riddleSnap.data().isActive) {
        return interaction.editReply({ content: 'Não há nenhuma charada ativa no momento para responder.' });
    }

    const riddleData = riddleSnap.data();
    const correctAnswers = riddleData.answers.map(a => a.toLowerCase().trim());

    if (correctAnswers.includes(userAnswer)) {
        // Verifica se o usuário já acertou
        const alreadySolved = riddleData.solvedBy?.includes(interaction.user.id) || false;
        if (alreadySolved) {
            return interaction.editReply({ content: 'Você já acertou esta charada! Espere pela próxima.' });
        }

        // Adiciona o usuário à lista de quem acertou e dá a reputação
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
        
        const riddleUpdateData = {
            solvedBy: [...(riddleData.solvedBy || []), interaction.user.id]
        };

        // Se o número máximo de vencedores foi atingido, desativa a charada
        if (riddleUpdateData.solvedBy.length >= riddleData.maxWinners) {
            riddleUpdateData.isActive = false;
        }

        await updateDoc(riddleRef, riddleUpdateData);

        logger.info(`[Charada] Usuário ${interaction.user.tag} acertou a charada '${riddleData.id}'.`);
        return interaction.editReply({ content: `Parabéns! Você acertou a charada e ganhou **${riddleData.reputation}** pontos de reputação! ✨` });

    } else {
        return interaction.editReply({ content: 'Essa não é a resposta correta. Tente novamente!' });
    }
}
