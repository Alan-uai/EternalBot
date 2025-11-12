// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';

// Mapeamento de Nomes de Webhook para cada estado
const RAID_NAMES = {
    'next_up': 'Jajá Vem Aí!',
    'starting_soon': 'Fique Ligado!',
    'open': 'Ela Chegou 🥳🎉',
    'closing_soon': 'Corra! Falta Pouco'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '`N/D`';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
    return `\`${minutes}m ${seconds.toString().padStart(2, '0')}s ${milliseconds.toString().padStart(3, '0')}ms\``;
}

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    const announcerDoc = await getDoc(announcerRef);
    const announcerState = announcerDoc.exists() ? announcerDoc.data() : { state: 'finished' };
    
    const { currentRaid, nextRaid } = getRaidTimings();
    
    let desiredState = 'finished';
    let activeRaidDetails = null;

    if (currentRaid) {
        if (Date.now() >= currentRaid.tenSecondMark) {
            desiredState = 'closing_soon';
        } else {
            desiredState = 'open';
        }
        activeRaidDetails = currentRaid.raid;
    } else if (nextRaid) {
        if (Date.now() >= nextRaid.fiveMinuteMark) {
            desiredState = 'starting_soon';
        } else {
            desiredState = 'next_up';
        }
        activeRaidDetails = nextRaid.raid;
    }
    
    const currentState = announcerState.state;
    const currentRaidId = announcerState.raidId;
    const newRaidId = activeRaidDetails?.Dificuldade || null;

    if (desiredState === currentState && newRaidId === currentRaidId) {
        return;
    }

    try {
        const webhookUrl = announcerState.webhookUrl;
        if (!webhookUrl) {
            logger.warn(`[raidAnnouncer] Webhook URL for '${ANNOUNCER_DOC_ID}' not found.`);
            return;
        }
        const webhookClient = new WebhookClient({ url: webhookUrl });
        
        // Sempre deleta a mensagem anterior ao mudar de estado
        if (announcerState.messageId) {
            await webhookClient.deleteMessage(announcerState.messageId).catch(() => {
                logger.warn(`[raidAnnouncer] Could not delete old message ${announcerState.messageId}. It might have been deleted manually.`);
            });
             await updateDoc(announcerRef, { messageId: null });
        }
        
        // Se o ciclo acabou, limpa e sai
        if (desiredState === 'finished') {
            await updateDoc(announcerRef, { state: 'finished', raidId: null, messageId: null });
            logger.info(`[raidAnnouncer] Raid cycle finished, panel cleared.`);
            return;
        }

        const raidAssets = assetService.raidAssets[newRaidId];
        if (!raidAssets) {
            logger.error(`[raidAnnouncer] Assets para a raid '${newRaidId}' não foram encontrados no AssetService.`);
            return;
        }

        const finalWebhookName = RAID_NAMES[desiredState] || newRaidId;
        const finalAvatarUrl = raidAssets.avatars[desiredState] || raidAssets.fallbackAvatar || await assetService.getAsset('BotAvatar');
        const transitionGifUrl = raidAssets.gifs.transition[desiredState];
        const finalGifUrl = raidAssets.gifs.final[desiredState];
        
        const embed = new EmbedBuilder()
            .addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**`, inline: false }
            );
        
        if (newRaidId !== 'Nightmare' && newRaidId !== 'Leaf Raid') {
            const baseTimeSeconds = 72.025; 
            const maxSpeed = 250;
            const mediumSpeed = 175;
            const minSpeed = 100;
            
            const maxTime = baseTimeSeconds * (maxSpeed / maxSpeed); // Base time
            const mediumTime = baseTimeSeconds * (maxSpeed / mediumSpeed);
            const minTime = baseTimeSeconds * (maxSpeed / minSpeed);
            
            const timeFieldValue = `> **Máximo (250%):** ${formatTime(maxTime)}\n` +
                                   `> **Médio (175%):** ${formatTime(mediumTime)}\n` +
                                   `> **Mínimo (100%):** ${formatTime(minTime)}`;
            
            embed.addFields({ name: 'Tempo Estimado de Conclusão', value: timeFieldValue, inline: false });
        }


        let finalContent = '';
        if (activeRaidDetails.roleId && desiredState === 'open') {
             const guild = await client.guilds.fetch(config.GUILD_ID);
             const role = await guild.roles.fetch(activeRaidDetails.roleId);
             const roleName = role ? role.name : activeRaidDetails.Dificuldade;
             const baseLine = '───────────────────────────────';
             const totalWidth = baseLine.length;
             const mentionText = `<@&${activeRaidDetails.roleId}>`;
             const centralContentLength = roleName.length + 2; 
             const paddingLength = Math.max(0, Math.floor((totalWidth - centralContentLength) / 2));
             const padding = '─'.repeat(paddingLength);
             finalContent = `${padding} ${mentionText} ${padding}`;
        }
        
        let stateColor;
        switch (desiredState) {
            case 'starting_soon': stateColor = 0xFFA500; break; // Laranja
            case 'open': stateColor = 0x00FF00; break; // Verde
            case 'closing_soon': stateColor = 0xFF4B4B; break; // Vermelho
            default: stateColor = 0x2F3136; break; // Padrão
        }
        embed.setColor(stateColor);
        
        const hasTransition = !!transitionGifUrl;
        const initialGif = hasTransition ? transitionGifUrl : finalGifUrl;

        if (initialGif) {
            embed.setImage(initialGif);
        }
        
        const sentMessage = await webhookClient.send({
            username: finalWebhookName,
            avatarURL: finalAvatarUrl,
            embeds: [embed],
            content: finalContent,
            wait: true
        });

        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: sentMessage.id });
        logger.info(`[${newRaidId}] Posted message for state: '${desiredState}'.`);

        if (hasTransition && finalGifUrl && transitionGifUrl !== finalGifUrl) {
            await sleep(10000); // Duração da transição
            
            const latestAnnouncerDoc = await getDoc(announcerRef);
            if (latestAnnouncerDoc.data().messageId === sentMessage.id) {
                embed.setImage(finalGifUrl);
                await webhookClient.editMessage(sentMessage.id, {
                    embeds: [embed]
                });
                logger.info(`[${newRaidId}] Edited message to final GIF for state: '${desiredState}'.`);
            } else {
                 logger.warn(`[${newRaidId}] State changed during sleep. Aborting edit for message ${sentMessage.id}.`);
            }
        }
    } catch (error) {
        logger.error('[raidAnnouncer] Critical error in lifecycle:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *';

export async function run(container) {
    await handleRaidLifecycle(container);
}
