// src/commands/utility/updlog.js
import { SlashCommandBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, WebhookClient } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ai } from '../../ai/genkit.js';

const ADMIN_ROLE_ID = '1429318984716521483';
const FIRESTORE_DOC_ID = 'updlog';

export const data = new SlashCommandBuilder()
    .setName('updlog')
    .setDescription('Lança um novo log de atualização para o jogo.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('updlog_modal')
        .setTitle('Novo Log de Atualização (Em Inglês)');

    const titleInput = new TextInputBuilder()
        .setCustomId('updlog_title')
        .setLabel("Título da Atualização (em Inglês)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Ex: Update 20, Part 3")
        .setRequired(true);

    const contentInput = new TextInputBuilder()
        .setCustomId('updlog_content')
        .setLabel("Conteúdo do Log (Markdown, em Inglês)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Cole o log de atualização aqui. Ele será traduzido.")
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(titleInput),
        new ActionRowBuilder().addComponents(contentInput)
    );

    await interaction.showModal(modal);
}

async function handleInteraction(interaction, { client }) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'updlog_modal') return;

    await interaction.deferReply({ ephemeral: true });

    const titleEn = interaction.fields.getTextInputValue('updlog_title');
    const contentEn = interaction.fields.getTextInputValue('updlog_content');
    const { logger } = client.container;

    const { firestore } = initializeFirebase();
    const updlogRef = doc(firestore, 'bot_config', FIRESTORE_DOC_ID);
    
    try {
        const docSnap = await getDoc(updlogRef);
        const webhookData = docSnap.exists() ? docSnap.data() : {};

        if (!webhookData.webhookUrl) {
            logger.error(`[updlog] URL do webhook '${FIRESTORE_DOC_ID}' não encontrada no Firestore.`);
            return interaction.editReply('ERRO: A URL do webhook para este comando não foi encontrada. O bot pode precisar ser reiniciado.');
        }

        let messageId = webhookData.messageId;
        const webhookClient = new WebhookClient({ url: webhookData.webhookUrl });
        
        // Posta primeiro em inglês como fallback seguro
        const embedEn = new EmbedBuilder()
            .setColor(0x808080) // Cinza para indicar "processando"
            .setTitle(titleEn)
            .setDescription(contentEn)
            .setTimestamp()
            .setFooter({ text: `Lançado por: ${interaction.user.tag} | Traduzindo...` });

        let message;
        if (messageId) {
             try {
                message = await webhookClient.editMessage(messageId, { embeds: [embedEn] });
            } catch(e) {
                logger.warn(`[updlog] Webhook não pôde editar a mensagem ${messageId}, enviando uma nova.`);
                message = await webhookClient.send({ username: titleEn, embeds: [embedEn], wait: true });
            }
        } else {
            message = await webhookClient.send({ username: titleEn, embeds: [embedEn], wait: true });
        }
        
        // Salva a referência da mensagem e conteúdo em inglês imediatamente
        await setDoc(updlogRef, { 
            title: titleEn, 
            content: contentEn, 
            messageId: message.id,
        }, { merge: true });

        await interaction.editReply('Log de atualização postado em inglês. Iniciando tradução...');

        // Tenta traduzir e editar a mensagem
        try {
            const { text: translatedTitle } = await ai.generate({
                prompt: `Traduza o seguinte título para Português-BR: "${titleEn}"`,
            });
            const { text: translatedContent } = await ai.generate({
                prompt: `Traduza o seguinte log para Português-BR, mantendo a formatação Markdown: \n\n${contentEn}`,
            });

            const embedPt = new EmbedBuilder()
                .setColor(0x3498DB)
                .setTitle(translatedTitle)
                .setDescription(translatedContent)
                .setTimestamp()
                .setFooter({ text: `Lançado por: ${interaction.user.tag}` });
            
            await webhookClient.editMessage(message.id, {
                username: translatedTitle,
                embeds: [embedPt]
            });
            
            // Atualiza o Firestore com o conteúdo traduzido
            await setDoc(updlogRef, { title: translatedTitle, content: translatedContent, updatedAt: new Date() }, { merge: true });

             await interaction.followUp({ content: 'Tradução concluída e mensagem atualizada!', ephemeral: true });

        } catch (translationError) {
            logger.error('Erro na tradução com a IA:', translationError);
            await interaction.followUp({ content: 'A postagem foi feita em inglês, mas a tradução automática falhou. Verifique os logs da IA.', ephemeral: true });
        }

    } catch (error) {
        logger.error('Erro ao processar o /updlog:', error);
        await interaction.editReply('Ocorreu um erro crítico ao tentar postar o log de atualização.').catch(()=>{});
    }
}

export { handleInteraction };

    
