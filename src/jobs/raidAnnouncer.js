// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient, ChannelType } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PORTAL_OPEN_DURATION_MS = 2 * 60 * 1000; // 2 minutos
const ANNOUNCER_DOC_ID = 'raidAnnouncer';
const PERSISTENT_WEBHOOK_NAME = 'Anunciador de Raids'; // Nome fixo para o webhook

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Esy',
    'Medium': 'Med',
    'Hard': 'Hd',
    'Insane': 'Isne',
    'Crazy': 'Czy',
    'Nightmare': 'Mare',
    'Leaf Raid (1800)': 'Lf'
};

// Função para obter o webhook persistente ou criá-lo se não existir
async function getOrCreatePersistentWebhook(channel, logger, assetService) {
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
        logger.error(`[getOrCreatePersistentWebhook] Canal fornecido é inválido.`);
        return null;
    }
    try {
        const webhooksInChannel = await channel.fetchWebhooks();
        let webhook = webhooksInChannel.find(wh => wh.name === PERSISTENT_WEBHOOK_NAME && wh.owner.id === channel.client.user.id);
        
        if (webhook) {
            return webhook;
        }

        const avatarURL = await assetService.getAsset('BotAvatar');
        const newWebhook = await channel.createWebhook({
            name: PERSISTENT_WEBHOOK_NAME,
            avatar: avatarURL,
            reason: 'Webhook persistente para anúncios de raid.',
        });
        logger.info(`[getOrCreatePersistentWebhook] Webhook "${PERSISTENT_WEBHOOK_NAME}" criado.`);
        return newWebhook;
    } catch (error) {
        logger.error(`[getOrCreatePersistentWebhook] Falha crítica ao criar/obter webhook persistente:`, error);
        return null;
    }
}


async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    const now = new Date();
    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    
    const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!raidChannel) {
        logger.error(`[raidAnnouncer] Canal de raid configurado é inválido ou não foi encontrado.`);
        return;
    }

    try {
        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };
        
        const persistentWebhook = await getOrCreatePersistentWebhook(raidChannel, logger, assetService);
        if (!persistentWebhook) {
            logger.error(`[raidAnnouncer] Não foi possível obter ou criar o webhook persistente. O ciclo não pode continuar.`);
            return;
        }
        
        // Garante que o ID e a URL do webhook estejam sempre atualizados no Firestore
        if (announcerState.webhookId !== persistentWebhook.id || announcerState.webhookUrl !== persistentWebhook.url) {
            await setDoc(announcerRef, { webhookId: persistentWebhook.id, webhookUrl: persistentWebhook.url }, { merge: true });
        }

        const webhookClient = new WebhookClient({ url: persistentWebhook.url });

        let nextRaid = null;
        let minTimeDiff = Infinity;
        let currentRaid = null;

        // Determina a raid atual e a próxima
        for (const raid of raids) {
            const raidStartMinute = parseInt(raid['Horário'].substring(3, 5), 10);
            let raidStartTime = new Date(now);
            raidStartTime.setUTCMinutes(raidStartMinute, 0, 0);

            if (raidStartTime.getTime() < now.getTime() - (PORTAL_OPEN_DURATION_MS + 10000)) { // 10s margem
                raidStartTime.setUTCHours(raidStartTime.getUTCHours() + 1);
            }
            
            const timeDiff = raidStartTime.getTime() - now.getTime();

            if (timeDiff <= 0 && timeDiff > -PORTAL_OPEN_DURATION_MS) {
                currentRaid = { ...raid, startTime: raidStartTime };
            }

            if (timeDiff > 0 && timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                nextRaid = { ...raid, startTime: raidStartTime };
            }
        }
        
        // --- GERENCIAMENTO DO CICLO DE ANÚNCIOS ---
        const currentState = announcerState.state;
        const currentRaidIdInState = announcerState.raidId;

        // 1. CICLO DA RAID ATUAL (Aberta -> Fechando)
        if (currentRaid) {
            const raidId = currentRaid.Dificuldade;
            const raidStartTimeMs = currentRaid.startTime.getTime();
            const portalCloseTime = raidStartTimeMs + PORTAL_OPEN_DURATION_MS;
            const tenSecondMark = portalCloseTime - 10 * 1000;
            const isNewCycleForThisRaid = currentRaidIdInState !== raidId || currentState === 'starting_soon';
            
            // ESTADO: RAID ABRIU (DELETAR ANÚNCIO ANTERIOR E CRIAR NOVO)
            if (isNewCycleForThisRaid) {
                // Deleta a mensagem anterior se existir
                if (announcerState.messageId) {
                     await webhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Falha ao deletar mensagem antiga de 5min/próxima: ${e.message}`));
                }

                const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || raidId;
                const avatarUrl = await assetService.getAsset(`${avatarPrefix}A`);
                await persistentWebhook.edit({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: avatarUrl });

                const embed = new EmbedBuilder()
                    .setColor(0xFF4B4B)
                    .addFields(
                        { name: 'Dificuldade', value: raidId, inline: true },
                        { name: 'Vida do Chefe', value: `\`${currentRaid['Vida Último Boss']}\``, inline: true },
                        { name: 'Dano Recomendado', value: `\`${currentRaid['Dano Recomendado']}\``, inline: true },
                        { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                    )
                    .setTimestamp(raidStartTimeMs)
                    .setFooter({ text: 'O portal fechará em 2 minutos.' });
                
                const roleMention = currentRaid.roleId ? `<@&${currentRaid.roleId}>` : '@everyone';
                const messagePayload = { content: roleMention, embeds: [embed] };
                
                const openMessage = await webhookClient.send({ ...messagePayload, wait: true });
                
                await setDoc(announcerRef, { state: 'open', raidId, webhookId: persistentWebhook.id, webhookUrl: persistentWebhook.url, messageId: openMessage.id, startTimeMs: raidStartTimeMs }, { merge: true });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
            }
            // ESTADO: RAID FECHANDO EM 10 SEGUNDOS (EDITAR MENSAGEM E WEBHOOK)
            else if (currentState === 'open' && now.getTime() >= tenSecondMark) {
                 const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || raidId;
                 const avatarUrl = await assetService.getAsset(`${avatarPrefix}F`);
                 await persistentWebhook.edit({ name: `Raid ${raidId} fechando em 10s!`, avatar: avatarUrl });
                 
                 try {
                    const message = await webhookClient.fetchMessage(announcerState.messageId);
                    const originalEmbed = EmbedBuilder.from(message.embeds[0])
                        .setFooter({ text: 'O portal está fechando!' });

                    await webhookClient.editMessage(announcerState.messageId, { embeds: [originalEmbed] });
                } catch(e) {
                     logger.error(`[${raidId}] Falha ao editar mensagem para 10s: ${e.message}`);
                }
                 
                 await updateDoc(announcerRef, { state: 'closing_soon' });
                 logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
            }
        }
        // 2. CICLO DA PRÓXIMA RAID (Próxima -> 5 Minutos)
        else if (nextRaid) {
            const raidId = nextRaid.Dificuldade;
            const raidStartTimeMs = nextRaid.startTime.getTime();
            const fiveMinuteMark = raidStartTimeMs - 5 * 60 * 1000;

            // ESTADO: É A PRÓXIMA RAID (CRIAR/EDITAR ANÚNCIO PERSISTENTE)
            if (currentState === 'finished' || currentRaidIdInState !== raidId) {
                 const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || raidId;
                 const avatarUrl = await assetService.getAsset('BotAvatar'); // Avatar padrão
                 const webhookName = `Próxima Raid: ${raidId}`;
                 await persistentWebhook.edit({ name: webhookName, avatar: avatarUrl });
                 
                 const embed = new EmbedBuilder()
                    .setImage(await assetService.getAsset(`${avatarPrefix}PR`))
                    .setColor(0x2F3136);

                 let message;
                 const payload = { embeds: [embed] };

                if (announcerState.messageId) {
                    try {
                        message = await webhookClient.editMessage(announcerState.messageId, payload);
                    } catch {
                        await webhookClient.deleteMessage(announcerState.messageId).catch(()=>{});
                        message = await webhookClient.send({ ...payload, wait: true });
                    }
                } else {
                     message = await webhookClient.send({ ...payload, wait: true });
                }

                 await setDoc(announcerRef, { state: 'next_up', raidId, webhookId: persistentWebhook.id, webhookUrl: persistentWebhook.url, messageId: message.id, startTimeMs: raidStartTimeMs }, { merge: true });
                 logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            }
            // ESTADO: PRÓXIMA RAID FALTANDO 5 MIN (EDITAR MENSAGEM E WEBHOOK)
            else if (currentState === 'next_up' && currentRaidIdInState === raidId && now.getTime() >= fiveMinuteMark) {
                const avatarPrefix = RAID_AVATAR_PREFIXES[raidId] || raidId;
                const avatarUrl = await assetService.getAsset(`${avatarPrefix}5m`);
                await persistentWebhook.edit({ name: `Atenção! Raid ${raidId} em 5 Min!`, avatar: avatarUrl });

                const embed = new EmbedBuilder()
                    .setImage(null)
                    .setColor(0xFFA500);

                await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem para 5min: ${e.message}`));

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        }
        // 3. LIMPEZA E REINÍCIO DO CICLO
        else if (currentState && currentState !== 'finished') {
             const timeSinceStart = now.getTime() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > PORTAL_OPEN_DURATION_MS + 10000) { // Margem de 10s
                logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado. Reiniciando...`);
                await updateDoc(announcerRef, { state: 'finished' }); // messageId é mantido para o próximo ciclo
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
