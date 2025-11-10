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

    if (desiredState === currentState && newRaidId === currentRaidId) {
        return; // No change, do nothing.
    }

    try {
        const webhookUrl = announcerState.webhookUrl;
        if (!webhookUrl) {
            logger.warn(`[raidAnnouncer] Webhook URL for '${ANNOUNCER_DOC_ID}' not found.`);
            return;
        }
        const webhookClient = new WebhookClient({ url: webhookUrl });

        // Always delete the previous message if it exists
        if (announcerState.messageId) {
            await webhookClient.deleteMessage(announcerState.messageId).catch(() => {
                logger.warn(`[raidAnnouncer] Could not delete old message ${announcerState.messageId}. It might have been deleted already.`);
            });
             await updateDoc(announcerRef, { messageId: null }); // Clear messageId immediately
        }
        
        if (desiredState === 'finished') {
            await updateDoc(announcerRef, { state: 'finished', raidId: null });
            logger.info(`[${currentRaidId || 'N/A'}] Raid cycle finished, panel cleared.`);
            return;
        }

        const assetPrefix = RAID_AVATAR_PREFIXES[newRaidId] || 'Easy';
        
        // Define transition GIFs for specific state changes
        const transitionMap = {
            'starting_soon': '5m',
            'open': 'A',
            'next_up': 'PR',
            'closing_soon': 'F' // closing_soon now has its own direct transition
        };
        const transitionSuffix = transitionMap[desiredState];
        
        let transitionMsg = null;
        if (transitionSuffix) {
            const transitionGif = await assetService.getAsset(`Tran${assetPrefix}${transitionSuffix}`);
            const transitionEmbed = new EmbedBuilder().setColor(0x2F3136).setImage(transitionGif);
             if (activeRaidDetails) {
                 transitionEmbed.addFields(
                    { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                    { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                    { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                    { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
                );
             }

            transitionMsg = await webhookClient.send({ 
                embeds: [transitionEmbed],
                username: "Carregando Status...",
                wait: true 
            });
            await sleep(10000);
        }

        let finalEmbed, finalContent = '', finalWebhookName;
        
        switch (desiredState) {
            case 'starting_soon':
                finalWebhookName = RAID_NAMES.starting_soon;
                finalEmbed = new EmbedBuilder().setImage(await assetService.getAsset(`${assetPrefix}5m`)).setColor(0xFFA500).setDescription('A raid começará em breve!');
                break;
            case 'open':
                finalWebhookName = RAID_NAMES.open;
                finalEmbed = new EmbedBuilder().setImage(await assetService.getAsset(`${assetPrefix}A`)).setColor(0xFF4B4B).setDescription('A raid está aberta! Entre agora!').setTimestamp(currentRaid.startTimeMs).setFooter({ text: 'O portal fechará em 2 minutos.' });
                finalContent = activeRaidDetails.roleId ? `<@&${activeRaidDetails.roleId}>` : '';
                break;
            case 'closing_soon':
                 finalWebhookName = RAID_NAMES.closing_soon;
                 finalEmbed = new EmbedBuilder().setImage(await assetService.getAsset(`${assetPrefix}F`)).setColor(0x000000).setDescription('O portal está fechando!').setFooter({ text: 'Contagem regressiva final!' });
                 break;
            case 'next_up':
                 finalWebhookName = RAID_NAMES[newRaidId] || 'Jajá Vem Aí!';
                 finalEmbed = new EmbedBuilder().setImage(await assetService.getAsset(`${assetPrefix}PR`)).setColor(0x2F3136).setDescription('Preparando para o próximo ciclo de raids...');
                break;
        }

        if (finalEmbed && activeRaidDetails) {
            finalEmbed.addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            );
        }

        const messagePayload = {
            username: finalWebhookName,
            embeds: finalEmbed ? [finalEmbed] : [],
            content: finalContent,
        };

        let finalMessage;
        if (transitionMsg) {
            // Edit the transition message to show the final state
            finalMessage = await webhookClient.editMessage(transitionMsg.id, messagePayload);
        } else {
            // This case should be rare now, but acts as a fallback
            finalMessage = await webhookClient.send({ ...messagePayload, wait: true });
        }
        
        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: finalMessage.id });
        logger.info(`[${newRaidId}] Raid Announcer updated to state: '${desiredState}'.`);

    } catch (error) {
        logger.error('[raidAnnouncer] Critical error in lifecycle:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *';

export async function run(container) {
    await handleRaidLifecycle(container);
}
