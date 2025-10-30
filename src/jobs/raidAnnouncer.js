// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { collection, addDoc } from 'firebase/firestore';

let notifiedRaids = new Set();
const ANNOUNCEMENT_LIFETIME_MS = 2 * 60 * 1000; // Mensagens duram 2 minutos (tempo de portal aberto)
const WEBHOOK_NAME = 'Anunciador de Raids';

export const name = 'raidAnnouncer';
export const intervalMs = 60000; // A cada 60 segundos

async function sendRaidAnnouncement(client, raid) {
    const { config, logger, services } = client.container;
    const { firestore } = services.firebase;

    const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(err => {
        logger.error(`Não foi possível encontrar o canal de raid (ID: ${config.RAID_CHANNEL_ID})`, err);
        return null;
    });
    if (!raidChannel) return;

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
        .setFooter({ text: 'A Raid fechará em 2m.' });

    try {
        const webhookClient = new WebhookClient({ url: webhook.url });
        const sentMessage = await webhookClient.send({
            username: WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            content: roleMention,
            embeds: [embed],
            wait: true
        });

        // Salva a informação da mensagem no Firestore para limpeza futura
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
    const { client } = container;
    
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();

    // Reset notified raids at the beginning of each hour
    if (currentMinute === 0) {
        notifiedRaids.clear();
    }
    
    const raidSchedule = lobbyDungeonsArticle.tables.lobbySchedule.rows;

    for (const raid of raidSchedule) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidIdentifier = `${currentHour}:${raidMinute}`;
        
        // Raid start
        const startId = `${raidIdentifier}-start`;
        if (currentMinute === raidMinute && !notifiedRaids.has(startId)) {
            notifiedRaids.add(startId);
            await sendRaidAnnouncement(client, raid);
        }
    }
}
