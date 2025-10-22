// src/commands/utility/updcodes.js
import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ADMIN_ROLE_ID = '1429318984716521483';
const CODES_CHANNEL_ID = '1429346813919494214';
const FIRESTORE_DOC_ID = 'gameCodes';

export const data = new SlashCommandBuilder()
    .setName('updcodes')
    .setDescription('Adiciona ou remove códigos do jogo.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(option =>
        option.setName('codigos')
            .setDescription('Os códigos a serem adicionados/removidos, separados por espaço ou vírgula.')
            .setRequired(true))
    .addBooleanOption(option =>
        option.setName('remover')
            .setDescription('Marque como verdadeiro para remover os códigos informados. Padrão: falso.')
            .setRequired(false));

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    await interaction.deferReply({ ephemeral: true });

    const codesInput = interaction.options.getString('codigos');
    const shouldRemove = interaction.options.getBoolean('remover') || false;

    // Trata códigos separados por espaço, vírgula, ou nova linha e remove itens vazios
    const newCodes = codesInput.split(/[\s,]+/).filter(code => code.length > 0);

    if (newCodes.length === 0) {
        return interaction.editReply('Nenhum código válido foi fornecido.');
    }

    const { firestore } = initializeFirebase();
    const codesRef = doc(firestore, 'bot_config', FIRESTORE_DOC_ID);

    try {
        const codesChannel = await interaction.client.channels.fetch(CODES_CHANNEL_ID);
        if (!codesChannel) {
            return interaction.editReply('ERRO: Canal de códigos não encontrado.');
        }

        const docSnap = await getDoc(codesRef);
        let currentCodes = [];
        if (docSnap.exists() && docSnap.data().codes) {
            currentCodes = docSnap.data().codes;
        }

        let updatedCodes;
        let replyMessage;
        let embedTitle;

        if (shouldRemove) {
            updatedCodes = currentCodes.filter(code => !newCodes.includes(code));
            await setDoc(codesRef, { codes: updatedCodes, messageId: docSnap.data()?.messageId || null });
            replyMessage = `Códigos removidos com sucesso: \`${newCodes.join(', ')}\``;
            embedTitle = 'Códigos Removidos';
        } else {
            // Evita adicionar códigos duplicados
            const uniqueNewCodes = newCodes.filter(code => !currentCodes.includes(code));
            if (uniqueNewCodes.length === 0) {
                return interaction.editReply('Todos os códigos fornecidos já existem na lista.');
            }
            updatedCodes = [...currentCodes, ...uniqueNewCodes];
            await setDoc(codesRef, { codes: updatedCodes, messageId: docSnap.data()?.messageId || null }, { merge: true });
            replyMessage = `Códigos adicionados com sucesso: \`${uniqueNewCodes.join(', ')}\``;
            embedTitle = 'Novos Códigos Adicionados!';
        }

        // Atualizar a mensagem no canal
        const oldMessageId = docSnap.exists() ? docSnap.data().messageId : null;
        const formattedCodesList = updatedCodes.map(code => `• \`${code}\``).join('\n');
        
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle(shouldRemove ? 'Lista de Códigos Atualizada' : 'Novos Códigos Disponíveis!')
            .setDescription(formattedCodesList.length > 0 ? formattedCodesList : 'Nenhum código ativo no momento.')
            .setTimestamp()
            .setFooter({ text: 'Use /codes para ver esta lista a qualquer momento.' });

        let newMessage;
        if (oldMessageId) {
            try {
                const oldMessage = await codesChannel.messages.fetch(oldMessageId);
                newMessage = await oldMessage.edit({ embeds: [embed] });
            } catch (error) {
                console.warn(`Não foi possível editar a mensagem antiga de códigos (ID: ${oldMessageId}). Criando uma nova.`);
                newMessage = await codesChannel.send({ embeds: [embed] });
            }
        } else {
            newMessage = await codesChannel.send({ embeds: [embed] });
        }
        
        // Salva o ID da nova/editada mensagem no Firestore
        await setDoc(codesRef, { messageId: newMessage.id }, { merge: true });

        await interaction.editReply(replyMessage);

    } catch (error) {
        console.error('Erro ao processar o /updcodes:', error);
        await interaction.editReply('Ocorreu um erro ao tentar atualizar os códigos.');
    }
}

    