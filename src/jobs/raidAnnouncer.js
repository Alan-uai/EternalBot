// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';
const PERSISTENT_WEBHOOK_NAME = 'Anunciador de Raids';
const PORTAL_OPEN_DURATION_SECONDS = 2 * 60; // 2 minutos

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


// Função de sleep para os delays de transição
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

    // Se o estado desejado for o mesmo, não faz nada
    if (desiredState === currentState && announcerState.raidId === (activeRaidDetails?.Dificuldade || null)) {
        return;
    }

    // Se o estado mudou, executa a lógica de transição e atualização
    try {
        const webhookUrl = announcerState.webhookUrl;
        if (!webhookUrl) {
            logger.warn(`[raidAnnouncer] URL do webhook '${ANNOUNCER_DOC_ID}' não encontrada.`);
            return;
        }
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const raidId = activeRaidDetails?.Dificuldade;
        const assetPrefix = RAID_AVATAR_PREFIXES[raidId] || 'Easy';
        
        // Sempre mostra a transição primeiro
        if (desiredState !== 'finished') {
            const transitionMap = {
                'starting_soon': '5m',
                'open': 'A',
                'closing_soon': 'F',
                'next_up': 'PR'
            };
            const transitionSuffix = transitionMap[desiredState];
            
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

            let msg;
            if (announcerState.messageId) {
                try {
                    msg = await webhookClient.editMessage(announcerState.messageId, { embeds: [transitionEmbed], content: '' });
                } catch(e) {
                     msg = await webhookClient.send({ embeds: [transitionEmbed], wait: true });
                }
            } else {
                msg = await webhookClient.send({ embeds: [transitionEmbed], wait: true });
            }
            await updateDoc(announcerRef, { messageId: msg.id, raidId: raidId }); // Salva o ID da mensagem de transição
            
            await sleep(10000); // Aguarda 10 segundos
        }

        // Agora, atualiza para o estado final
        let finalEmbed, finalContent = '', finalWebhookName = 'Painel de Raids';
        
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
                 finalWebhookName = RAID_NAMES[raidId] || 'Jajá Vem Aí!';
                 finalEmbed = new EmbedBuilder().setImage(await assetService.getAsset(`${assetPrefix}PR`)).setColor(0x2F3136).setDescription('Preparando para o próximo ciclo de raids...');
                break;
            case 'finished':
                if (announcerState.messageId) {
                    await webhookClient.deleteMessage(announcerState.messageId).catch(() => {});
                }
                await updateDoc(announcerRef, { state: 'finished', messageId: null, raidId: null });
                logger.info(`[${announcerState.raidId || 'N/A'}] Ciclo de anúncio finalizado.`);
                return;
        }

        if (finalEmbed && activeRaidDetails) {
            finalEmbed.addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            );
        }

        const messagePayload = { embeds: finalEmbed ? [finalEmbed] : [], content: finalContent };
        let finalMessage;
        const currentMessageId = (await getDoc(announcerRef)).data().messageId;

        if (currentMessageId) {
            try {
                await webhookClient.edit({ name: finalWebhookName });
                finalMessage = await webhookClient.editMessage(currentMessageId, messagePayload);
            } catch (e) {
                finalMessage = await webhookClient.send({ ...messagePayload, username: finalWebhookName, wait: true });
            }
        } else {
            finalMessage = await webhookClient.send({ ...messagePayload, username: finalWebhookName, wait: true });
        }
        
        await updateDoc(announcerRef, { state: desiredState, raidId: raidId, messageId: finalMessage.id, startTimeMs: currentRaid?.startTimeMs || null });
        logger.info(`[${raidId}] Anúncio atualizado para o estado: '${desiredState}'.`);

    } catch (error) {
        logger.error('[raidAnnouncer] Erro crítico no ciclo de vida da raid:', error);
    }
}

export const name = 'raidAnnouncer';
export const schedule = '*/10 * * * * *';

export async function run(container) {
    await handleRaidLifecycle(container);
}
