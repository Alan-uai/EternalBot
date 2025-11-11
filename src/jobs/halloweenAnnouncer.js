// src/jobs/halloweenAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'halloweenAnnouncer';

export const name = 'halloweenAnnouncer';
export const schedule = '0 12 31 10 *'; // 12:00 do dia 31 de Outubro

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore, assetService } = services.firebase;

    logger.info('[Halloween Announcer] Verificando se hoje é Halloween...');

    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const docSnap = await getDoc(announcerRef);
        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[Halloween Announcer] Webhook URL para '${ANNOUNCER_DOC_ID}' não encontrada.`);
            return;
        }

        const webhookClient = new WebhookClient({ url: docSnap.data().webhookUrl });
        const avatarURL = await assetService.getAsset('BotAvatar');

        const embed = new EmbedBuilder()
            .setColor(0xFF4500) // Laranja
            .setTitle('🎃 Feliz Halloween! 🎃')
            .setDescription('Doces ou travessuras? O Gui Trevoso está na área para desejar um Halloween assustadoramente divertido para toda a comunidade!\n\nCuidado com os ghouls e boa sorte no farm de doces!')
            .setImage(await assetService.getAsset('HalloweenBanner')) // Assumindo que existe um asset 'HalloweenBanner'
            .setTimestamp();

        await webhookClient.send({
            username: 'Gui Trevoso Halloween 🎃',
            avatarURL: avatarURL,
            embeds: [embed],
            content: `@everyone`
        });

        logger.info('[Halloween Announcer] Mensagem de Halloween enviada com sucesso!');

    } catch (error) {
        logger.error('[Halloween Announcer] Falha ao enviar anúncio de Halloween:', error);
    }
}
