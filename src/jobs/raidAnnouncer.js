// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Easy',
    'Medium': 'Med',
    'Hard': 'Hd',
    'Insane': 'Isne',
    'Crazy': 'Czy',
    'Nightmare': 'Mare',
    'Leaf Raid': 'Lf'
};

const RAID_NAMES = {
    'Easy': 'Jajá Vem Aí!',
    'Medium': 'Jajá Vem Aí!',
    'Hard': 'Jajá Vem Aí!',
    'Insane': 'Jajá Vem Aí!',
    'Crazy': 'Jajá Vem Aí!',
    'Nightmare': 'Jajá Vem Aí!',
    'Leaf Raid': 'Jajá Vem Aí!',
    'starting_soon': 'Fique Ligado!',
    'open': 'Ela Chegou 🥳🎉',
    'closing_soon': 'Corra! Falta Pouco'
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

    // If the state and raid are the same, do nothing.
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

        // Always delete the previous message if it exists.
        if (announcerState.messageId) {
            await webhookClient.deleteMessage(announcerState.messageId).catch(() => {
                logger.warn(`[raidAnnouncer] Could not delete old message ${announcerState.messageId}. It might have been deleted already.`);
            });
            await updateDoc(announcerRef, { messageId: null });
        }
        
        // If the cycle is over, just clear the state and stop.
        if (desiredState === 'finished') {
            await updateDoc(announcerRef, { state: 'finished', raidId: null, messageId: null });
            logger.info(`[${currentRaidId || 'N/A'}] Raid cycle finished, panel cleared.`);
            return;
        }

        const assetPrefix = RAID_AVATAR_PREFIXES[newRaidId] || 'Easy';
        
        // Map states to their final asset suffixes
        const assetSuffixMap = {
            'starting_soon': '5m',
            'open': 'A',
            'next_up': 'PR',
            'closing_soon': 'F' // No more TranF, just F
        };

        const finalAssetSuffix = assetSuffixMap[desiredState];
        const transitionAssetSuffix = `Tran${assetPrefix}${finalAssetSuffix}`;

        let finalWebhookName = RAID_NAMES[newRaidId] || 'Jajá Vem Aí!';
        if (desiredState === 'open' || desiredState === 'closing_soon' || desiredState === 'starting_soon') {
            finalWebhookName = RAID_NAMES[desiredState];
        }

        const finalEmbed = new EmbedBuilder()
            .setColor(0x2F3136) // Default neutral color
            .addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            );

        let finalContent = activeRaidDetails.roleId && desiredState === 'open' ? `<@&${activeRaidDetails.roleId}>` : '';

        // Determine assets and colors
        const transitionGif = await assetService.getAsset(transitionAssetSuffix);
        const finalGif = await assetService.getAsset(`${assetPrefix}${finalAssetSuffix}`);
        let stateColor;
        switch (desiredState) {
            case 'starting_soon': stateColor = 0xFFA500; break;
            case 'open': stateColor = 0xFF4B4B; break;
            case 'closing_soon': stateColor = 0x000000; break;
            default: stateColor = 0x2F3136; break;
        }

        finalEmbed.setColor(stateColor);
        
        // 1. Post a NEW message with the TRANSITION GIF
        const transitionEmbed = new EmbedBuilder(finalEmbed.toJSON()).setImage(transitionGif);
        const sentMessage = await webhookClient.send({
            username: finalWebhookName,
            embeds: [transitionEmbed],
            content: finalContent, // Role mention can be sent with the transition
            wait: true
        });

        // 2. Save the new message ID and state
        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: sentMessage.id });
        logger.info(`[${newRaidId}] Posted transition for state: '${desiredState}'.`);

        // 3. Wait for the transition to finish
        await sleep(10000);

        // 4. EDIT the message to show the FINAL GIF
        const finalStateEmbed = new EmbedBuilder(finalEmbed.toJSON()).setImage(finalGif);

        // Make sure we are still in the same state before editing
        const latestAnnouncerDoc = await getDoc(announcerRef);
        if (latestAnnouncerDoc.data().messageId === sentMessage.id) {
            await webhookClient.editMessage(sentMessage.id, {
                embeds: [finalStateEmbed]
            });
            logger.info(`[${newRaidId}] Edited message to final state: '${desiredState}'.`);
        } else {
            logger.warn(`[${newRaidId}] State changed during sleep. Aborting edit for message ${sentMessage.id}.`);
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
