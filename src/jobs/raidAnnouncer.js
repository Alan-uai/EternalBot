// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';

const lastNotificationTimes = new Map();
const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // 2 minutos

async function sendRaidAnnouncement(container, raid) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    try {
        const webhookDocRef = doc(firestore, 'bot_config', 'raidAnnouncer');
        const docSnap = await getDoc(webhookDocRef);

        if (!docSnap.exists() || !docSnap.data().webhookUrl) {
            logger.error(`[raidAnnouncer] URL do webhook 'raidAnnouncer' não encontrada no Firestore. O anúncio não será enviado.`);
            return;
        }
        const webhookUrl = docSnap.data().webhookUrl;
        
        const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';
        const expiresAt = new Date(Date.now() + ANNOUNCEMENT_LIFETIME_MS);

        const embed = new EmbedBuilder()
            .setColor(0xFF4B4B)
            .setTitle(`🔥 A Raid Começou: ${raid['Dificuldade']}!`)
            .setDescription(`O portal está aberto! Entre agora para não perder.`)
            .addFields(
                { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            )
            .setTimestamp()
            .setFooter({ text: 'O portal fechará em 2 minutos.' });
        
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const sentMessage = await webhookClient.send({
            username: "Anunciador de Raids",
            avatarURL: client.user.displayAvatarURL(),
            content: roleMention,
            embeds: [embed],
            wait: true
        });

        const announcementsRef = collection(firestore, 'bot_config/raid_announcements/messages');
        await addDoc(announcementsRef, {
            messageId: sentMessage.id,
            channelId: sentMessage.channel_id,
            webhookUrl: webhookUrl,
            createdAt: new Date(),
            expiresAt: expiresAt,
        });

        logger.info(`Anúncio de raid enviado para: ${raid['Dificuldade']}`);
    } catch (e) {
        logger.error(`[raidAnnouncer] Falha ao enviar anúncio de raid via webhook:`, e);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    const { logger } = container;
    
    const now = new Date();
    const currentMinute = now.getUTCMinutes();
    
    const raidSchedule = lobbyDungeonsArticle.tables.lobbySchedule.rows;

    for (const raid of raidSchedule) {
        const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        
        if (currentMinute === raidStartMinute) {
            const raidIdentifier = `${raid['Dificuldade']}-${now.getUTCHours()}`;

            if (!lastNotificationTimes.has(raidIdentifier)) {
                logger.info(`Raid ${raid['Dificuldade']} está programada para agora. Enviando anúncio.`);
                await sendRaidAnnouncement(container, raid);
                lastNotificationTimes.set(raidIdentifier, now.getTime());
            }
        }
    }

    // Limpa o mapa de notificações antigas para evitar memory leak
    const oneHourAgo = now.getTime() - (60 * 60 * 1000);
    for (const [key, timestamp] of lastNotificationTimes.entries()) {
        if (timestamp < oneHourAgo) {
            lastNotificationTimes.delete(key);
        }
    }
}
