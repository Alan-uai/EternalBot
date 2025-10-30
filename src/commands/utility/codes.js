// src/commands/utility/codes.js
import { SlashCommandBuilder } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc } from 'firebase/firestore';

const CODES_DOC_ID = 'gameCodes';

export const data = new SlashCommandBuilder()
    .setName('codes')
    .setDescription('Mostra todos os códigos ativos do jogo.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const codesRef = doc(firestore, 'bot_config', CODES_DOC_ID);

    try {
        const docSnap = await getDoc(codesRef);

        if (!docSnap.exists() || !docSnap.data().codes || docSnap.data().codes.length === 0) {
            return interaction.editReply('Nenhum código ativo encontrado no momento.');
        }

        const codes = docSnap.data().codes;
        const formattedCodes = codes.map(code => `• \`${code}\``).join('\n');

        const messageContent = `**Códigos Ativos do Jogo**\n\n${formattedCodes}`;

        await interaction.editReply({ content: messageContent });

    } catch (error) {
        console.error('Erro ao buscar códigos:', error);
        await interaction.editReply('Ocorreu um erro ao buscar a lista de códigos.');
    }
}

    