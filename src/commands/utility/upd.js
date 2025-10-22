// src/commands/utility/upd.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc } from 'firebase/firestore';

const FIRESTORE_DOC_ID = 'latestUpdateLog';

export const data = new SlashCommandBuilder()
    .setName('upd')
    .setDescription('Exibe o log de atualização mais recente do jogo.');

export async function execute(interaction) {
    await interaction.deferReply();

    const { firestore } = initializeFirebase();
    const updlogRef = doc(firestore, 'bot_config', FIRESTORE_DOC_ID);

    try {
        const docSnap = await getDoc(updlogRef);

        if (!docSnap.exists()) {
            return interaction.editReply('Nenhum log de atualização encontrado no momento.');
        }

        const logData = docSnap.data();

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(logData.title)
            .setDescription(logData.content)
            .setTimestamp(logData.updatedAt?.toDate ? logData.updatedAt.toDate() : new Date())
            .setFooter({ text: `Use /upd para ver o log mais recente.` });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao buscar o log de atualização:', error);
        await interaction.editReply('Ocorreu um erro ao buscar o log de atualização.');
    }
}
