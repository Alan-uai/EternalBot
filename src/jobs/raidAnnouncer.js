// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';

let notifiedRaids = new Set();
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;
const WEBHOOK_NAME = 'Anunciador de Raids';

export const name = 'raidAnnouncer';
export const intervalMs = 60000; // A cada 60 segundos

export async function run(container) {
    const { client, config, logger } = container;
    
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();

    // Reset notified raids at the beginning of each hour
    if (currentMinute === 0) {
        notifiedRaids.clear();
        logger.info('Notificações de raid resetadas para a nova hora.');
    }
    
    const raidSchedule = lobbyDungeonsArticle.tables.lobbySchedule.rows;
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
    const webhookClient = new WebhookClient({ url: webhook.url });


    for (const raid of raidSchedule) {
        const raidMinute = parseInt(raid['Horário'].substring(3, 5), 10);
        const raidIdentifier = `${currentHour}:${raidMinute}`;
        const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '@everyone';

        // Check for 5-minute warning
        if (currentMinute === (raidMinute - 5 + 60) % 60) {
            const warningId = `${raidIdentifier}-warning`;
            if (!notifiedRaids.has(warningId)) {
                const embed = new EmbedBuilder()
                    .setColor(0xFFD700) // Gold
                    .setTitle(`🚨 Alerta de Raid: ${raid['Dificuldade']} começa em 5 minutos!`)
                    .setDescription(`Preparem-se para a batalha! A dungeon do lobby está prestes a abrir.`)
                    .addFields(
                        { name: 'Dificuldade', value: raid['Dificuldade'], inline: true },
                        { name: 'Horário', value: `Começa às HH:${raidMinute.toString().padStart(2, '0')}`, inline: true },
                        { name: 'Entrar no Jogo', value: `[Clique aqui para jogar](${config.GAME_LINK})` }
                    )
                    .setTimestamp();
                
                try {
                    const sentMessage = await webhookClient.send({ 
                        username: WEBHOOK_NAME,
                        avatarURL: client.user.displayAvatarURL(),
                        content: roleMention, 
                        embeds: [embed],
                        wait: true
                    });
                    setTimeout(() => webhookClient.deleteMessage(sentMessage.id).catch(console.error), TEN_MINUTES_IN_MS);
                    notifiedRaids.add(warningId);
                    logger.info(`Alerta de 5 minutos enviado para a raid: ${raid['Dificuldade']}`);
                } catch(e) {
                    logger.error(`Falha ao enviar alerta de raid via webhook:`, e);
                }
            }
        }

        // Check for raid start
        if (currentMinute === raidMinute) {
            const startId = `${raidIdentifier}-start`;
            if (!notifiedRaids.has(startId)) {
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
                    .setTimestamp();

                try {
                    const sentMessage = await webhookClient.send({ 
                        username: WEBHOOK_NAME,
                        avatarURL: client.user.displayAvatarURL(),
                        content: roleMention, 
                        embeds: [embed],
                        wait: true
                    });
                    setTimeout(() => webhookClient.deleteMessage(sentMessage.id).catch(console.error), TEN_MINUTES_IN_MS);
                    notifiedRaids.add(startId);
                    logger.info(`Anúncio de início enviado para a raid: ${raid['Dificuldade']}`);
                } catch(e) {
                    logger.error(`Falha ao enviar anúncio de início de raid via webhook:`, e);
                }
            }
        }
    }
}
