// src/commands/utility/updcodes.js
import { SlashCommandBuilder, PermissionsBitField, WebhookClient } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ADMIN_ROLE_ID = '1429318984716521483';
const CODES_CHANNEL_ID = '1429346813919494214';
const FIRESTORE_DOC_ID = 'gameCodes';
const WEBHOOK_NAME = 'Códigos Ativos do Jogo'; // Nome fixo para o webhook

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
    const { client } = interaction;
    
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    await interaction.deferReply({ ephemeral: true });

    const codesInput = interaction.options.getString('codigos');
    const shouldRemove = interaction.options.getBoolean('remover') || false;
    const codesToProcess = codesInput.split(/[\s,]+/).filter(code => code.length > 0);

    if (codesToProcess.length === 0) {
        return interaction.editReply('Nenhum código válido foi fornecido.');
    }

    const { firestore } = initializeFirebase();
    const codesRef = doc(firestore, 'bot_config', FIRESTORE_DOC_ID);

    try {
        const codesChannel = await client.channels.fetch(CODES_CHANNEL_ID);
        if (!codesChannel) {
            return interaction.editReply('ERRO: Canal de códigos não encontrado.');
        }

        const webhook = await client.getOrCreateWebhook(codesChannel, WEBHOOK_NAME, client.user.displayAvatarURL());
        if (!webhook) {
            return interaction.editReply('ERRO: Não foi possível criar ou encontrar o webhook para os códigos.');
        }

        const docSnap = await getDoc(codesRef);
        let currentCodes = docSnap.exists() && docSnap.data().codes ? docSnap.data().codes : [];
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        let updatedCodes;
        let replyMessage;
        
        if (shouldRemove) {
            updatedCodes = currentCodes.filter(code => !codesToProcess.includes(code));
            replyMessage = `Códigos removidos com sucesso: \`${codesToProcess.join(', ')}\``;
        } else {
            const uniqueNewCodes = codesToProcess.filter(code => !currentCodes.includes(code));
            if (uniqueNewCodes.length === 0) {
                return interaction.editReply('Todos os códigos fornecidos já existem na lista.');
            }
            updatedCodes = [...currentCodes, ...uniqueNewCodes];
            replyMessage = `Códigos adicionados com sucesso: \`${uniqueNewCodes.join(', ')}\``;
        }
        
        const formattedCodesList = updatedCodes.map(code => `• \`${code}\``).join('\n') || 'Nenhum código ativo no momento.';
        const content = `**Códigos Ativos do Jogo**\n\n${formattedCodesList}\n\n*Use /codes para ver esta lista.*`;

        const webhookClient = new WebhookClient({ url: webhook.url });
        let message;

        if (messageId) {
            try {
                message = await webhookClient.editMessage(messageId, { content });
            } catch (error) {
                console.warn(`Não foi possível editar a mensagem de códigos (ID: ${messageId}). Criando uma nova.`);
                message = await webhookClient.send({ content, wait: true });
            }
        } else {
            message = await webhookClient.send({ content, wait: true });
        }
        
        await setDoc(codesRef, { 
            codes: updatedCodes,
            messageId: message.id,
            webhookUrl: webhook.url 
        });

        await interaction.editReply(replyMessage);

    } catch (error) {
        console.error('Erro ao processar o /updcodes:', error);
        await interaction.editReply('Ocorreu um erro ao tentar atualizar os códigos.');
    }
}

    