// src/commands/utility/updcodes.js
import { SlashCommandBuilder, PermissionsBitField, WebhookClient } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ADMIN_ROLE_ID = '1429318984716521483';
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

export async function execute(interaction, container) {
    const { logger, services } = container;
    const { assetService } = services;
    
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
        const docSnap = await getDoc(codesRef);
        const webhookData = docSnap.exists() ? docSnap.data() : {};
        
        if (!webhookData.webhookUrl) {
            logger.error(`[updcodes] URL do webhook '${FIRESTORE_DOC_ID}' não encontrada no Firestore.`);
            return interaction.editReply('ERRO: A URL do webhook para este comando não foi encontrada. O bot pode precisar ser reiniciado.');
        }

        let currentCodes = webhookData.codes || [];
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
        
        const avatarURL = await assetService.getAsset('CD');
        const webhookClient = new WebhookClient({ url: webhookData.webhookUrl });
        
        const payload = { 
            content, 
            username: 'Códigos Ativos', 
            avatarURL 
        };

        let messageId = webhookData.messageId;
        let message;

        if (messageId) {
            try {
                message = await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                logger.warn(`[updcodes] Não foi possível editar a mensagem de códigos (ID: ${messageId}). Criando uma nova.`);
                message = await webhookClient.send({ ...payload, wait: true });
                messageId = message.id; // Atualiza o ID da mensagem
            }
        } else {
            message = await webhookClient.send({ ...payload, wait: true });
            messageId = message.id; // Define o ID da nova mensagem
        }
        
        await setDoc(codesRef, { 
            codes: updatedCodes,
            messageId: messageId, // Salva o ID da mensagem (nova ou editada)
        }, { merge: true });

        await interaction.editReply(replyMessage);

    } catch (error) {
        logger.error('Erro ao processar o /updcodes:', error);
        await interaction.editReply('Ocorreu um erro ao tentar atualizar os códigos.');
    }
}
