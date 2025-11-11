// src/jobs/newYearAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'newYearAnnouncer';

// --- Tarefa para a contagem regressiva ---
export const name = 'newYearAnnouncer';
// Agendamento para 23:59:50 do dia 31 de dezembro, fuso horário America/Sao_Paulo
export const schedule = '50 59 23 31 12 *'; 

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    const today = new Date();
    // Ajuste para o fuso horário de Brasília (UTC-3)
    const brTime = new Date(today.getTime() - 3 * 60 * 60 * 1000);

    // Confirma se é realmente o último dia do ano
    if (brTime.getMonth() !== 11 || brTime.getDate() !== 31) {
        //logger.debug('[New Year Announcer] Não é 31 de dezembro, o job será ignorado.');
        return;
    }
    
    logger.info(`[New Year Announcer] Iniciando contagem regressiva...`);

    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const docSnap = await getDoc(announcerRef);
        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[New Year Announcer] Webhook URL para '${ANNOUNCER_DOC_ID}' não encontrada.`);
            return;
        }

        const webhookClient = new WebhookClient({ url: docSnap.data().webhookUrl });
        const avatarURL = await assetService.getAsset('BotAvatar');
        const countdownGifUrl = await assetService.getAsset('AnoNovoTime');

        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('Contagem Regressiva para o Ano Novo!')
            .setDescription('**Atenção, @everyone! A contagem regressiva vai começar!**')
            .setTimestamp();
        
        if (countdownGifUrl) {
            embed.setImage(countdownGifUrl);
        }

        await webhookClient.send({
            username: 'Gui Festivo',
            avatarURL: avatarURL,
            embeds: [embed],
            content: '@everyone'
        });

        logger.info(`[New Year Announcer] Anúncio de contagem regressiva enviado.`);

        // --- Agendamento da segunda parte (Feliz Ano Novo) ---
        setTimeout(async () => {
            try {
                logger.info(`[New Year Announcer] Enviando mensagem de Feliz Ano Novo!`);
                const happyNewYearGifUrl = await assetService.getAsset('NovoAno');
                const newYearEmbed = new EmbedBuilder()
                    .setColor(0x00FF00) // Verde
                    .setTitle('🎆 Feliz Ano Novo! 🎆')
                    .setDescription('O Gui deseja a todos um próspero Ano Novo, cheio de sucesso, felicidade e, claro, muitos drops supremos!')
                    .setTimestamp();
                
                if (happyNewYearGifUrl) {
                    newYearEmbed.setImage(happyNewYearGifUrl);
                }

                await webhookClient.send({
                    username: 'Gui Festivo',
                    avatarURL: avatarURL,
                    embeds: [newYearEmbed],
                    content: '@everyone'
                });
                logger.info(`[New Year Announcer] Mensagem de Feliz Ano Novo enviada com sucesso!`);
            } catch (error) {
                logger.error(`[New Year Announcer] Falha ao enviar a mensagem de Feliz Ano Novo:`, error);
            }
        }, 10000); // 10 segundos depois da contagem regressiva

    } catch (error) {
        logger.error(`[New Year Announcer] Falha ao enviar anúncio de contagem regressiva:`, error);
    }
}
