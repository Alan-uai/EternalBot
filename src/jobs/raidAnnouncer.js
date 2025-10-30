// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { collection, addDoc } from 'firebase/firestore';

// Store last notification time for each raid to avoid duplicates
const lastNotificationTimes = new Map();
const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // Mensagens duram 2 minutos
const WEBHOOK_NAME = 'Anunciador de Raids';

async function sendRaidAnnouncement(client, raid) {
    const { config, logger, services } = client.container;
    const { firestore } = services.firebase;

    let raidChannel;
    try {
        raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID);
    } catch (fetchError) {
        logger.error(`Não foi possível encontrar o canal de raid (ID: ${config.RAID_CHANNEL_ID})`, fetchError);
        return;
    }
    
    if (!raidChannel) {
        logger.error(`O canal de raid com ID ${config.RAID_CHANNEL_ID} retornou nulo.`);
        return;
    }

    const webhook = await client.getOrCreateWebhook(raidChannel, WEBHOOK_NAME, client.user.displayAvatarURL());
    if (!webhook) {
        logger.error(`Falha ao obter o webhook para o canal de raids.`);
        return;
    }

    const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';
    const expiresAt = new Date(Date.now() + ANNOUNCEMENT_LIFETIME_MS);

    const embed = new EmbedBuilder()
        .setColor(0xFF4B4B) // Red
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

    try {
        const webhookClient = new WebhookClient({ url: webhook.url });
        const sentMessage = await webhookClient.send({
            username: WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            content: roleMention,
            embeds: [embed],
            wait: true
        });

        const announcementsRef = collection(firestore, 'bot_config/raid_announcements/messages');
        await addDoc(announcementsRef, {
            messageId: sentMessage.id,
            channelId: sentMessage.channel_id,
            webhookUrl: webhook.url,
            createdAt: new Date(),
            expiresAt: expiresAt,
        });

        logger.info(`Anúncio de raid enviado para: ${raid['Dificuldade']}`);
    } catch (e) {
        logger.error(`Falha ao enviar anúncio de raid via webhook:`, e);
    }
}

export async function run(container) {
    const { client, logger } = container;
    
    const now = new Date();
    const currentHour = now.getUTCHours(); // Use UTC for consistency
    const currentMinute = now.getUTCMinutes();
    
    const raidSchedule = lobbyDungeonsArticle.tables.lobbySchedule.rows;

    for (const raid of raidSchedule) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        
        // Check if the current time matches the raid's start minute
        if (currentMinute === raidMinute) {
            const raidIdentifier = `${raid['Dificuldade']}-${currentHour}-${currentMinute}`;

            // Check if we have already notified for this specific raid at this specific time
            if (!lastNotificationTimes.has(raidIdentifier)) {
                logger.info(`Raid ${raid['Dificuldade']} está programada para agora. Enviando anúncio.`);
                await sendRaidAnnouncement(client, raid);
                // Mark this specific instance as notified
                lastNotificationTimes.set(raidIdentifier, now.getTime());
            }
        }
    }

    // Cleanup old entries from the map to prevent memory leaks
    const oneHourAgo = now.getTime() - (60 * 60 * 1000);
    for (const [key, timestamp] of lastNotificationTimes.entries()) {
        if (timestamp < oneHourAgo) {
            lastNotificationTimes.delete(key);
        }
    }
}
