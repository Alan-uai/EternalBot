// src/jobs/christmasAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'christmasAnnouncer';

export const name = 'christmasAnnouncer';
export const schedule = '0 12 25 12 *'; // 12:00 do dia 25 de Dezembro

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore, assetService } = services.firebase;

    logger.info('[Christmas Announcer] Verificando se hoje é Natal...');
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    
    try {
        const docSnap = await getDoc(announcerRef);
        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[Christmas Announcer] Webhook URL para '${ANNOUNCER_DOC_ID}' não encontrada.`);
            return;
        }

        const webhookClient = new WebhookClient({ url: docSnap.data().webhookUrl });
        const avatarURL = await assetService.getAsset('BotAvatar');

        const embed = new EmbedBuilder()
            .setColor(0xFF0000) // Vermelho
            .setTitle('🎄 Feliz Natal! 🎄')
            .setDescription('Ho ho ho! O Gui Noel está passando para desejar a todos da comunidade um Feliz Natal, cheio de paz, alegria e muitos drops lendários!\n\nQue todos tenham um dia incrível!')
            .setImage(await assetService.getAsset('ChristmasBanner')) // Assumindo que existe um asset 'ChristmasBanner'
            .setTimestamp();
        
        await webhookClient.send({
            username: 'Gui Noel',
            avatarURL: avatarURL,
            embeds: [embed],
            content: `@everyone`
        });

        logger.info('[Christmas Announcer] Mensagem de Natal enviada com sucesso!');

    } catch (error) {
        logger.error('[Christmas Announcer] Falha ao enviar anúncio de Natal:', error);
    }
}
