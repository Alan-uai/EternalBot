// src/jobs/holidayAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';

export const name = 'holidayAnnouncer';
export const schedule = '0 12 * * *'; // Roda todo dia ao meio-dia (12:00)

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    const today = new Date();
    // Ajuste para o fuso horário de Brasília (UTC-3)
    today.setHours(today.getHours() - 3);
    const todayString = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`; // MM-DD

    const holiday = config.HOLIDAYS.find(h => h.date === todayString);

    if (!holiday) {
        logger.info('[Holiday Announcer] Nenhum feriado para anunciar hoje.');
        return;
    }

    logger.info(`[Holiday Announcer] Feriado encontrado: ${holiday.title}. Enviando anúncio...`);

    const announcerRef = doc(firestore, 'bot_config', holiday.docId);

    try {
        const docSnap = await getDoc(announcerRef);
        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[Holiday Announcer] Webhook URL para '${holiday.docId}' não encontrada.`);
            return;
        }

        const webhookClient = new WebhookClient({ url: docSnap.data().webhookUrl });
        const avatarURL = await assetService.getAsset('BotAvatar');
        const imageURL = holiday.imageAsset ? await assetService.getAsset(holiday.imageAsset) : null;

        const embed = new EmbedBuilder()
            .setColor(holiday.color || 0x5865F2)
            .setTitle(holiday.title)
            .setDescription(holiday.description)
            .setTimestamp();
        
        if (imageURL) {
            embed.setImage(imageURL);
        }

        await webhookClient.send({
            username: holiday.webhookName,
            avatarURL: avatarURL,
            embeds: [embed],
            content: `@everyone`
        });

        logger.info(`[Holiday Announcer] Anúncio de '${holiday.title}' enviado com sucesso!`);

    } catch (error) {
        logger.error(`[Holiday Announcer] Falha ao enviar anúncio para '${holiday.title}':`, error);
    }
}
