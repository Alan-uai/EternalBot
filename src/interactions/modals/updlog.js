// src/interactions/modals/updlog.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ai } from '../../ai/genkit.js';
import { z } from 'zod';

export const customIdPrefix = 'updlog_modal';
const FIRESTORE_DOC_ID = 'updlog';

// Schema para garantir que a IA retorne apenas o texto traduzido
const TranslationOutputSchema = z.object({
  translatedText: z.string().describe('O texto traduzido final.'),
});

// Prompt mais robusto para tradução
const translationPrompt = ai.definePrompt({
    name: 'translateTextPrompt',
    input: { schema: z.object({ text: z.string(), context: z.string() }) },
    output: { schema: TranslationOutputSchema },
    prompt: `Sua única tarefa é traduzir o texto a seguir para Português-BR. Mantenha a formatação Markdown original (quebras de linha, negrito, etc.). Contexto: "{{{context}}}". Texto para traduzir: "{{{text}}}"`,
});

export async function handleInteraction(interaction, { client }) {
    if (!interaction.isModalSubmit() || interaction.customId !== customIdPrefix) return;

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
            .setDescription(contentEn)
            .setTimestamp()
            .setFooter({ text: `Lançado por: ${interaction.user.tag} | Traduzindo...` });

        let message;
        if (messageId) {
             try {
                message = await webhookClient.editMessage(messageId, { username: titleEn, embeds: [embedEn] });
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
            const [titleResult, contentResult] = await Promise.all([
                translationPrompt({ text: titleEn, context: 'Título de uma atualização de jogo' }),
                translationPrompt({ text: contentEn, context: 'Conteúdo de um log de atualização de jogo' })
            ]);
            
            const translatedTitle = titleResult.output?.translatedText;
            const translatedContent = contentResult.output?.translatedText;

            if (!translatedTitle || !translatedContent) {
                throw new Error("A IA não retornou o texto traduzido no formato esperado.");
            }
            
            const embedPt = new EmbedBuilder()
                .setColor(0x3498DB)
                .setDescription(translatedContent) // Título removido daqui
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
