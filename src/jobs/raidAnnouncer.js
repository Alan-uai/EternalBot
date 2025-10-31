// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js'; // Importa a lógica de tempo unificada

const ANNOUNCER_DOC_ID = 'raidAnnouncer';
const PERSISTENT_WEBHOOK_NAME = 'Anunciador de Raids';

async function getOrCreatePersistentWebhook(client, config, logger, assetService) {
    const channel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!channel) {
        logger.error(`[raidAnnouncer] Canal de raid (ID: ${config.RAID_CHANNEL_ID}) não foi encontrado.`);
        return null;
    }
    const webhooks = await channel.fetchWebhooks().catch(() => new Map());
    let webhook = webhooks.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME);

    if (!webhook) {
        try {
            const avatarURL = await assetService.getAsset('BotAvatar');
            webhook = await channel.createWebhook({
                name: PERSISTENT_WEBHOOK_NAME,
                avatar: avatarURL,
                reason: 'Webhook persistente para todos os anúncios de raid.'
            });
            logger.info(`[raidAnnouncer] Webhook persistente '${PERSISTENT_WEBHOOK_NAME}' criado.`);
        } catch (error) {
            logger.error(`[raidAnnouncer] Falha crítica ao criar o webhook persistente:`, error);
            return null;
        }
    }
    return webhook;
}

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    // Usa a lógica de tempo unificada
    const { currentRaid, nextRaid } = getRaidTimings();
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const webhook = await getOrCreatePersistentWebhook(client, config, logger, assetService);
        if (!webhook) return;

        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };
        
        // Garante que a URL/ID do webhook esteja no Firestore
        if (announcerState.webhookUrl !== webhook.url) {
            await setDoc(announcerRef, { webhookId: webhook.id, webhookUrl: webhook.url }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ id: webhook.id, token: webhook.token });

        // Estado 1: Uma raid está atualmente ativa
        if (currentRaid) {
            const { raid, raidId, avatarPrefix, startTimeMs, tenSecondMark, portalCloseTime } = currentRaid;
            const isNewCycle = announcerState.raidId !== raidId || announcerState.state === 'starting_soon';

            // Sub-estado 1.1: A raid acabou de abrir. Deleta mensagem antiga, cria nova com menção.
            if (isNewCycle) {
                if (announcerState.messageId) {
                    await webhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Não foi possível deletar a mensagem de "5min/próxima": ${e.message}`));
                }

                await webhook.edit({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: await assetService.getAsset(`${avatarPrefix}A`) });

                const embed = new EmbedBuilder()
                    .setColor(0xFF4B4B) // Vermelho vivo
                    .setImage(await assetService.getAsset('Open'))
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
                
                await setDoc(announcerRef, { state: 'open', raidId, messageId: message.id, startTimeMs }, { merge: true });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);

            // Sub-estado 1.2: A raid está aberta e faltam 10s para fechar. Edita a mensagem.
            } else if (announcerState.state === 'open' && Date.now() >= tenSecondMark) {
                await webhook.edit({ name: `Raid ${raidId} fechando em 10s!`, avatar: await assetService.getAsset(`${avatarPrefix}F`) });
                
                try {
                    const originalEmbed = EmbedBuilder.from(announcerState.embed || {}) // Usa embed do estado se houver
                        .setImage(await assetService.getAsset('Closing'))
                        .setFooter({ text: 'O portal está fechando!' });
                    await webhookClient.editMessage(announcerState.messageId, { embeds: [originalEmbed] });
                } catch(e) {
                     logger.error(`[${raidId}] Falha ao editar mensagem para 10s: ${e.message}`);
                }
                 
                await updateDoc(announcerRef, { state: 'closing_soon' });
                logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
            }

        // Estado 2: Nenhuma raid ativa, olhando para a próxima
        } else if (nextRaid) {
            const { raid, raidId, avatarPrefix, startTimeMs, fiveMinuteMark } = nextRaid;
            const isDifferentRaid = announcerState.raidId !== raidId || announcerState.state === 'finished';

            // Sub-estado 2.1: Anunciando a "Próxima Raid". Cria ou edita a mensagem persistente.
            if (isDifferentRaid) {
                 await webhook.edit({ name: `Próxima Raid: ${raidId}`, avatar: await assetService.getAsset(`${avatarPrefix}PR`) });
                 
                 const embed = new EmbedBuilder()
                    .setColor(0x2F3136)
                    .setImage(await assetService.getAsset('Next'));

                let message;
                if (announcerState.messageId) {
                    try {
                        message = await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] });
                    } catch { // Se a mensagem foi deletada, cria uma nova
                        message = await webhookClient.send({ embeds: [embed], wait: true });
                    }
                } else {
                    message = await webhookClient.send({ embeds: [embed], wait: true });
                }

                await setDoc(announcerRef, { state: 'next_up', raidId, messageId: message.id, startTimeMs }, { merge: true });
                logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            
            // Sub-estado 2.2: Faltam 5 minutos para a próxima raid. Edita a mensagem.
            } else if (announcerState.state === 'next_up' && Date.now() >= fiveMinuteMark) {
                 await webhook.edit({ name: `Atenção! Raid ${raidId} em 5 Min!`, avatar: await assetService.getAsset(`${avatarPrefix}5m`) });

                 const embed = new EmbedBuilder()
                    .setColor(0xFFA500) // Laranja
                    .setImage(await assetService.getAsset('5Min'));

                await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem para 5min: ${e.message}`));

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        
        // Estado 3: O ciclo acabou. Prepara para o próximo.
        } else if (announcerState.state && announcerState.state !== 'finished') {
             const timeSinceStart = Date.now() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > (2 * 60 * 1000) + 10000) { // 2 minutos + 10s de margem
                logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado. Preparando para o próximo.`);
                await updateDoc(announcerRef, { state: 'finished' });
             }
        }
    } catch (error) {
        logger.error('[raidAnnouncer] Erro crítico no ciclo de vida da raid:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *'; // A cada 10 segundos

export async function run(container) {
    await handleRaidLifecycle(container);
}
