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

    // Se o estado e a raid não mudaram, não faz nada
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

        // Deleta a mensagem anterior se existir
        if (announcerState.messageId) {
            await webhookClient.deleteMessage(announcerState.messageId).catch(() => {
                logger.warn(`[raidAnnouncer] Could not delete old message ${announcerState.messageId}. It might have been deleted already.`);
            });
            // Limpa o messageId no estado local para garantir que não será usado novamente
            announcerState.messageId = null; 
            await updateDoc(announcerRef, { messageId: null });
        }
        
        // Se o ciclo acabou, apenas limpa o estado e para
        if (desiredState === 'finished') {
            await updateDoc(announcerRef, { state: 'finished', raidId: null, messageId: null });
            logger.info(`[${currentRaidId || 'N/A'}] Raid cycle finished, panel cleared.`);
            return;
        }

        const assetPrefix = RAID_AVATAR_PREFIXES[newRaidId] || 'Easy';
        
        const transitionMap = {
            'starting_soon': '5m',
            'open': 'A',
            'next_up': 'PR',
            'closing_soon': 'F'
        };
        const transitionSuffix = transitionMap[desiredState];

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

        let sentMessage;

        // Se há uma transição, envia o GIF de transição primeiro
        if (transitionSuffix) {
            const transitionGif = await assetService.getAsset(`Tran${assetPrefix}${transitionSuffix}`);
            const transitionEmbed = new EmbedBuilder().setColor(0x2F3136).setImage(transitionGif);
             
            sentMessage = await webhookClient.send({ 
                username: finalWebhookName, // JÁ USA O NOME FINAL
                embeds: [transitionEmbed],
                wait: true 
            });

            await sleep(10000); // Espera a transição acabar

            // EDITA a mensagem de transição para o estado final
            await webhookClient.editMessage(sentMessage.id, {
                embeds: finalEmbed ? [finalEmbed] : [],
                content: finalContent
            });

        } else {
            // Se não há transição, apenas envia o estado final diretamente
             sentMessage = await webhookClient.send({
                username: finalWebhookName,
                embeds: finalEmbed ? [finalEmbed] : [],
                content: finalContent,
                wait: true
            });
        }
        
        // Salva o novo estado e o ID da nova mensagem
        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: sentMessage.id });
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
