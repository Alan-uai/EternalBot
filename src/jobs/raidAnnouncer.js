// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';
const PERSISTENT_WEBHOOK_NAME = 'Anunciador de Raids';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60;

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Esy',
    'Medium': 'Med',
    'Hard': 'Hd',
    'Insane': 'Isne',
    'Crazy': 'Czy',
    'Nightmare': 'Mare',
    'Leaf Raid (1800)': 'Lf'
};

async function getOrCreatePersistentWebhook(client, config, logger) {
    const { services } = client.container;
    const { firestore } = services.firebase;
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    
    try {
        const docSnap = await getDoc(announcerRef);
        if (docSnap.exists() && docSnap.data().webhookId && docSnap.data().webhookUrl) {
            // Tenta buscar o webhook existente para garantir que ele ainda é válido
            const webhook = await client.fetchWebhook(docSnap.data().webhookId).catch(() => null);
            if (webhook) {
                return webhook;
            }
            logger.warn(`[raidAnnouncer] Webhook com ID ${docSnap.data().webhookId} não encontrado. Criando um novo.`);
        }

        const channel = await client.channels.fetch(config.RAID_CHANNEL_ID);
        const webhooks = await channel.fetchWebhooks();
        let existingWebhook = webhooks.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME && wh.owner.id === client.user.id);

        if (!existingWebhook) {
            const avatarURL = await services.assetService.getAsset('BotAvatar');
            existingWebhook = await channel.createWebhook({
                name: PERSISTENT_WEBHOOK_NAME,
                avatar: avatarURL,
                reason: 'Webhook persistente para todos os anúncios de raid.'
            });
            logger.info(`[raidAnnouncer] Webhook persistente '${PERSISTENT_WEBHOOK_NAME}' criado.`);
        }

        // Salva/Atualiza o ID e a URL no Firestore
        await setDoc(announcerRef, { webhookId: existingWebhook.id, webhookUrl: existingWebhook.url }, { merge: true });
        return existingWebhook;

    } catch (error) {
        logger.error(`[raidAnnouncer] Falha crítica ao criar/obter webhook persistente:`, error);
        return null;
    }
}


async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    const { currentRaid, nextRaid } = getRaidTimings();
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const webhook = await getOrCreatePersistentWebhook(client, config, logger);
        if (!webhook) return;

        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };
        
        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        if (currentRaid) {
            const { raid, raidId, startTimeMs, tenSecondMark } = currentRaid;
            const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || 'Esy';
            const isNewCycle = announcerState.raidId !== raidId || announcerState.state !== 'open';

            if (isNewCycle && announcerState.state !== 'closing_soon') {
                
                // Deleta a mensagem anterior ('5min' ou 'próxima')
                if (announcerState.messageId) {
                    await webhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Não foi possível deletar a mensagem anterior: ${e.message}`));
                }

                const openAvatar = await assetService.getAsset(`${avatarPrefix}A`);
                await webhook.edit({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: openAvatar });

                const gifUrl = await assetService.getAsset('Open');
                const embed = new EmbedBuilder()
                    .setImage(gifUrl)
                    .setColor(0xFF4B4B)
                    .setDescription('A raid está aberta! Entre agora!')
                    .addFields(
                        { name: 'Dificuldade', value: raidId, inline: true },
                        { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true },
                        { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true },
                        { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                    )
                    .setTimestamp(startTimeMs)
                    .setFooter({ text: 'O portal fechará em 2 minutos.' });
                
                const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '';
                const message = await webhookClient.send({ content: roleMention, embeds: [embed], wait: true });
                
                await setDoc(announcerRef, { state: 'open', raidId, messageId: message.id, startTimeMs, webhookId: webhook.id, webhookUrl: webhook.url }, { merge: true });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);

            } else if (announcerState.state === 'open' && Date.now() >= tenSecondMark) {
                 const closingAvatar = await assetService.getAsset(`${avatarPrefix}F`);
                 await webhook.edit({ name: `Raid ${raidId} fechando em 10s!`, avatar: closingAvatar });
                
                const gifUrl = await assetService.getAsset('Closing');
                const closingEmbed = new EmbedBuilder()
                    .setImage(gifUrl)
                    .setColor(0x000000)
                    .setDescription('O portal está fechando!')
                    .setFooter({ text: 'Contagem regressiva final!' });

                try {
                    await webhookClient.editMessage(announcerState.messageId, { embeds: [closingEmbed] });
                } catch(e) {
                     logger.error(`[${raidId}] Falha ao editar mensagem para 10s: ${e.message}`);
                }
                 
                await updateDoc(announcerRef, { state: 'closing_soon' });
                logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
            }
        } else if (nextRaid) {
            const { raidId, fiveMinuteMark } = nextRaid;
            const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || 'Esy';
            const isDifferentRaid = announcerState.raidId !== raidId || announcerState.state === 'finished';

            if (isDifferentRaid) {
                const nextAvatar = await assetService.getAsset(`${avatarPrefix}PR`);
                await webhook.edit({ name: `Próxima Raid: ${raidId}`, avatar: nextAvatar });
                 
                const gifUrl = await assetService.getAsset('Next');
                const embed = new EmbedBuilder()
                    .setImage(gifUrl)
                    .setColor(0x2F3136)
                    .setDescription('Preparando para o próximo ciclo de raids...');

                let message;
                if (announcerState.messageId && announcerState.state !== 'finished') {
                    try {
                        message = await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] });
                    } catch {
                        message = await webhookClient.send({ embeds: [embed], wait: true });
                    }
                } else {
                    message = await webhookClient.send({ embeds: [embed], wait: true });
                }

                await setDoc(announcerRef, { state: 'next_up', raidId, messageId: message.id, webhookId: webhook.id, webhookUrl: webhook.url }, { merge: true });
                logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            
            } else if (announcerState.state === 'next_up' && Date.now() >= fiveMinuteMark) {
                const fiveMinAvatar = await assetService.getAsset(`${avatarPrefix}5m`);
                await webhook.edit({ name: `Atenção! Raid ${raidId} em 5 Min!`, avatar: fiveMinAvatar });

                const gifUrl = await assetService.getAsset('5Min');
                const embed = new EmbedBuilder()
                    .setImage(gifUrl)
                    .setColor(0xFFA500)
                    .setDescription('A próxima raid começa em 5 minutos! Prepare-se!');

                await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem para 5min: ${e.message}`));

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        } else if (announcerState.state && announcerState.state !== 'finished') {
             const timeSinceStart = Date.now() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > (PORTAL_OPEN_DURATION_SECONDS * 1000) + 10000) { // 2 minutos + 10s de margem
                logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado. Preparando para o próximo.`);
                if (announcerState.messageId) {
                    await webhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${announcerState.raidId}] Não foi possível deletar a mensagem final: ${e.message}`));
                }
                await updateDoc(announcerRef, { state: 'finished', messageId: null, raidId: null });
             }
        }
    } catch (error) {
        logger.error('[raidAnnouncer] Erro crítico no ciclo de vida da raid:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *';

export async function run(container) {
    await handleRaidLifecycle(container);
}
