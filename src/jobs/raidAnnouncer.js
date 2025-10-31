// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient, ChannelType } from 'discord.js';
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PORTAL_OPEN_DURATION_MS = 2 * 60 * 1000; // 2 minutos

// Função para criar ou obter um webhook com um nome específico
async function getOrCreateWebhook(channel, name, logger, assetService) {
    if (!channel || (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement)) {
        logger.error(`[getOrCreateWebhook] Canal fornecido para "${name}" é inválido.`);
        return null;
    }
    try {
        const avatarURL = await assetService.getAsset('BotAvatar');
        const webhooksInChannel = await channel.fetchWebhooks();
        let webhook = webhooksInChannel.find(wh => wh.name === name && wh.owner.id === channel.client.user.id);
        
        // Se encontrarmos um webhook com o nome genérico, podemos adotá-lo
        if(!webhook) {
            webhook = webhooksInChannel.find(wh => wh.name.startsWith('Próxima Raid:') && wh.owner.id === channel.client.user.id);
            if(webhook) await webhook.edit({ name });
        }
        if(!webhook) {
             webhook = webhooksInChannel.find(wh => wh.name.includes('em 5 Min!') && wh.owner.id === channel.client.user.id);
             if(webhook) await webhook.edit({ name });
        }
         if(!webhook) {
             webhook = webhooksInChannel.find(wh => wh.name.includes('fechando em 10s!') && wh.owner.id === channel.client.user.id);
             if(webhook) await webhook.edit({ name });
        }


        if (webhook) {
            return webhook;
        }

        const newWebhook = await channel.createWebhook({
            name: name,
            avatar: avatarURL,
            reason: `Webhook para ${name}`,
        });
        logger.info(`[getOrCreateWebhook] Webhook "${name}" criado.`);
        return newWebhook;
    } catch (error) {
        logger.error(`[getOrCreateWebhook] Falha crítica ao criar/obter webhook para "${name}":`, error);
        return null;
    }
}


async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    const now = new Date();
    const raids = lobbyDungeonsArticle.tables.lobbySchedule.rows;
    const announcerRef = doc(firestore, 'bot_config', 'raidAnnouncer');
    
    const raidChannel = await client.channels.fetch(config.RAID_CHANNEL_ID).catch(() => null);
    if (!raidChannel) {
        logger.error(`[raidAnnouncer] Canal de raid configurado é inválido ou não foi encontrado.`);
        return;
    }

    try {
        const announcerDoc = await getDoc(announcerRef);
        const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };

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

        // 1. CICLO DA RAID ATUAL (Aberta -> Fechando)
        if (currentRaid) {
            const raidId = currentRaid.Dificuldade;
            const raidStartTimeMs = currentRaid.startTime.getTime();
            const portalCloseTime = raidStartTimeMs + PORTAL_OPEN_DURATION_MS;
            const tenSecondMark = portalCloseTime - 10 * 1000;
            const currentState = announcerState.raidId === raidId ? announcerState.state : 'new_cycle';

            // ESTADO: RAID ABRIU (DELETAR ANÚNCIO ANTERIOR E CRIAR NOVO)
            if (currentState === 'starting_soon' || currentState === 'new_cycle') {
                // Deleta a mensagem do anúncio anterior (de 5min)
                if (announcerState.webhookUrl && announcerState.messageId) {
                    const oldWebhookClient = new WebhookClient({ url: announcerState.webhookUrl });
                    await oldWebhookClient.deleteMessage(announcerState.messageId).catch(e => logger.warn(`[${raidId}] Falha ao deletar mensagem antiga (5min): ${e.message}`));
                }

                // Cria um novo webhook temporário para a menção
                const webhook = await getOrCreateWebhook(raidChannel, `🔥 A Raid Começou: ${raidId}!`, logger, assetService);
                if (!webhook) return;

                const gifUrl = await assetService.getAsset(`${raidId}A`);
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
                if (gifUrl) messagePayload.content = `${gifUrl} \n${roleMention}`;
                
                const openMessage = await webhook.send({ ...messagePayload, wait: true });
                
                // Salva o estado da nova mensagem
                await setDoc(announcerRef, { state: 'open', raidId, webhookUrl: webhook.url, messageId: openMessage.id, startTimeMs: raidStartTimeMs });
                logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
            }
            // ESTADO: RAID FECHANDO EM 10 SEGUNDOS (EDITAR MENSAGEM E WEBHOOK)
            else if (currentState === 'open' && now.getTime() >= tenSecondMark && announcerState.webhookUrl) {
                 const webhook = new WebhookClient({ url: announcerState.webhookUrl });
                 await webhook.edit({ name: `Raid ${raidId} fechando em 10s!` }).catch(e => logger.error(`[${raidId}] Falha ao editar nome do webhook para 10s: ${e.message}`));
                 const gifUrl = await assetService.getAsset(`${raidId}F`);
                 if(gifUrl) {
                    try {
                        const message = await webhook.fetchMessage(announcerState.messageId);
                        const originalEmbed = message.embeds[0];
                        const updatedPayload = { content: `${gifUrl} \n${message.content.split('\n').pop()}`, embeds: [EmbedBuilder.from(originalEmbed).setFooter({ text: 'O portal está fechando!' })] };
                        await webhook.editMessage(announcerState.messageId, updatedPayload);
                    } catch(e) {
                         logger.error(`[${raidId}] Falha ao editar mensagem com GIF de 10s: ${e.message}`);
                    }
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
            const currentState = announcerState.state;

            // ESTADO: É A PRÓXIMA RAID (CRIAR/EDITAR ANÚNCIO PERSISTENTE)
            if (currentState === 'finished' || announcerState.raidId !== raidId) {
                 const webhook = await getOrCreateWebhook(raidChannel, `Próxima Raid: ${raidId}`, logger, assetService);
                 if (!webhook) return;
                 
                 const gifUrl = await assetService.getAsset(`${raidId}PR`);
                 let message;

                if (announcerState.messageId) {
                    try {
                        message = await webhook.editMessage(announcerState.messageId, { content: gifUrl ? `${gifUrl} ` : ' ' });
                    } catch {
                        await webhook.deleteMessage(announcerState.messageId).catch(()=>{});
                        message = await webhook.send({ content: gifUrl ? `${gifUrl} ` : ' ', wait: true });
                    }
                } else {
                     message = await webhook.send({ content: gifUrl ? `${gifUrl} ` : ' ', wait: true });
                }

                 await setDoc(announcerRef, { state: 'next_up', raidId, webhookUrl: webhook.url, messageId: message.id, startTimeMs: raidStartTimeMs });
                 logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            }
            // ESTADO: PRÓXIMA RAID FALTANDO 5 MIN (EDITAR MENSAGEM E WEBHOOK)
            else if (currentState === 'next_up' && announcerState.raidId === raidId && now.getTime() >= fiveMinuteMark && announcerState.webhookUrl) {
                const webhook = new WebhookClient({ url: announcerState.webhookUrl });
                await webhook.edit({ name: `Atenção! Raid ${raidId} em 5 Min!` }).catch(e => logger.error(`[${raidId}] Falha ao editar nome do webhook para 5min: ${e.message}`));
                const gifUrl = await assetService.getAsset(`${raidId}5m`);
                if (gifUrl) {
                    await webhook.editMessage(announcerState.messageId, { content: `${gifUrl} ` }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem com GIF de 5min: ${e.message}`));
                }

                await updateDoc(announcerRef, { state: 'starting_soon' });
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);
            }
        }
        // 3. LIMPEZA E REINÍCIO DO CICLO
        else if (announcerState.state && announcerState.state !== 'finished') {
             const timeSinceStart = now.getTime() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > PORTAL_OPEN_DURATION_MS) {
                logger.info(`[${announcerState.raidId}] Ciclo da raid finalizado. Reiniciando...`);
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
