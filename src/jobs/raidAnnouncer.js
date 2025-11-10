// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Easy', 'Medium': 'Med', 'Hard': 'Hd', 'Insane': 'Isne',
    'Crazy': 'Czy', 'Nightmare': 'Mare', 'Leaf Raid': 'Lf'
};

const RAID_NAMES = {
    'Easy': 'Jajá Vem Aí!', 'Medium': 'Jajá Vem Aí!', 'Hard': 'Jajá Vem Aí!',
    'Insane': 'Jajá Vem Aí!', 'Crazy': 'Jajá Vem Aí!', 'Nightmare': 'Jajá Vem Aí!',
    'Leaf Raid': 'Jajá Vem Aí!', 'starting_soon': 'Fique Ligado!',
    'open': 'Ela Chegou 🥳🎉', 'closing_soon': 'Corra! Falta Pouco'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        if (announcerState.messageId) {
            await webhookClient.deleteMessage(announcerState.messageId).catch(() => {
                logger.warn(`[raidAnnouncer] Could not delete old message ${announcerState.messageId}.`);
            });
            await updateDoc(announcerRef, { messageId: null });
        }
        
        if (desiredState === 'finished') {
            await updateDoc(announcerRef, { state: 'finished', raidId: null, messageId: null });
            logger.info(`[raidAnnouncer] Raid cycle finished, panel cleared.`);
            return;
        }

        const assetPrefix = RAID_AVATAR_PREFIXES[newRaidId] || 'Easy';
        
        const assetSuffixMap = { 'starting_soon': '5m', 'open': 'A', 'next_up': 'PR', 'closing_soon': 'F' };
        const finalAssetSuffix = assetSuffixMap[desiredState];
        
        let finalWebhookName = RAID_NAMES[newRaidId] || 'Jajá Vem Aí!';
        if (['starting_soon', 'open', 'closing_soon'].includes(desiredState)) {
            finalWebhookName = RAID_NAMES[desiredState];
        }

        const defaultAvatarUrl = await assetService.getAsset('DungeonLobby');
        const finalAvatarUrl = await assetService.getAsset(`${assetPrefix}${finalAssetSuffix}`) || defaultAvatarUrl;

        const embedTemplate = new EmbedBuilder()
            .setColor(0x2F3136)
            .addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            );

        let finalContent = activeRaidDetails.roleId && desiredState === 'open' ? `<@&${activeRaidDetails.roleId}>` : '';

        const transitionGif = await assetService.getAsset(`Tran${assetPrefix}${finalAssetSuffix}`);
        const finalGif = await assetService.getAsset(`${assetPrefix}${finalAssetSuffix}`);
        let stateColor;
        switch (desiredState) {
            case 'starting_soon': stateColor = 0xFFA500; break;
            case 'open': stateColor = 0xFF4B4B; break;
            case 'closing_soon': stateColor = 0x000000; break;
            default: stateColor = 0x2F3136; break;
        }
        embedTemplate.setColor(stateColor);
        
        const hasTransition = !!transitionGif;

        const sentMessage = await webhookClient.send({
            username: finalWebhookName,
            avatarURL: finalAvatarUrl,
            embeds: [new EmbedBuilder(embedTemplate.toJSON()).setImage(hasTransition ? transitionGif : finalGif)],
            content: finalContent,
            wait: true
        });

        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: sentMessage.id });
        logger.info(`[${newRaidId}] Posted message for state: '${desiredState}'.`);

        if (hasTransition) {
            await sleep(10000);
            
            const latestAnnouncerDoc = await getDoc(announcerRef);
            if (latestAnnouncerDoc.data().messageId === sentMessage.id) {
                const finalStateEmbed = new EmbedBuilder(embedTemplate.toJSON()).setImage(finalGif);
                await webhookClient.editMessage(sentMessage.id, {
                    embeds: [finalStateEmbed]
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
