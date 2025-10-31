// src/commands/utility/updcodes.js
import { SlashCommandBuilder, PermissionsBitField, WebhookClient, ChannelType } from 'discord.js';
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

export async function execute(interaction) {
    const { client } = interaction;
    const { logger, services } = client.container;
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
        let currentData = docSnap.exists() ? docSnap.data() : { codes: [] };
        
        if (!currentData.webhookUrl) {
            logger.error(`[updcodes] URL do webhook '${FIRESTORE_DOC_ID}' não encontrada no Firestore. O comando não pode prosseguir.`);
            return interaction.editReply('ERRO: A URL do webhook para este comando não foi encontrada. O bot pode precisar ser reiniciado.');
        }

        let updatedCodes;
        let replyMessage;
        
        if (shouldRemove) {
            updatedCodes = currentData.codes.filter(code => !codesToProcess.includes(code));
            replyMessage = `Códigos removidos com sucesso: \`${codesToProcess.join(', ')}\``;
        } else {
            const uniqueNewCodes = codesToProcess.filter(code => !currentData.codes.includes(code));
            if (uniqueNewCodes.length === 0) {
                return interaction.editReply('Todos os códigos fornecidos já existem na lista.');
            }
            updatedCodes = [...currentData.codes, ...uniqueNewCodes];
            replyMessage = `Códigos adicionados com sucesso: \`${uniqueNewCodes.join(', ')}\``;
        }
        
        const formattedCodesList = updatedCodes.map(code => `• \`${code}\``).join('\n') || 'Nenhum código ativo no momento.';
        const content = `**Códigos Ativos do Jogo**\n\n${formattedCodesList}\n\n*Use /codes para ver esta lista.*`;
        
        const avatarURL = await assetService.getAsset('CD');
        const webhookClient = new WebhookClient({ url: currentData.webhookUrl });
        let message;
        const payload = { 
            content, 
            username: 'Códigos Ativos', 
            avatarURL 
        };

        if (currentData.messageId) {
            try {
                message = await webhookClient.editMessage(currentData.messageId, payload);
            } catch (error) {
                logger.warn(`[updcodes] Não foi possível editar a mensagem de códigos (ID: ${currentData.messageId}). Criando uma nova.`);
                message = await webhookClient.send({ ...payload, wait: true });
            }
        } else {
            message = await webhookClient.send({ ...payload, wait: true });
        }
        
        await setDoc(codesRef, { 
            codes: updatedCodes,
            messageId: message.id,
        }, { merge: true });

        await interaction.editReply(replyMessage);

    } catch (error) {
        logger.error('Erro ao processar o /updcodes:', error);
        await interaction.editReply('Ocorreu um erro ao tentar atualizar os códigos.');
    }
}
