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

// Função de sleep para os delays de transição
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function handleRaidLifecycle(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    const { currentRaid, nextRaid } = getRaidTimings();
    
    const announcerRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);

    try {
        const announcerDoc = await getDoc(announcerRef);
        if (!announcerDoc.exists() || !announcerDoc.data().webhookUrl) {
            logger.warn(`[raidAnnouncer] URL do webhook '${ANNOUNCER_DOC_ID}' não está no Firestore. O job 'ready' deve criá-la.`);
            return;
        }
        
        const webhookUrl = announcerDoc.data().webhookUrl;
        const webhookClient = new WebhookClient({ url: webhookUrl });

        let announcerState = announcerDoc.data() || { state: 'finished' };
        const assetPrefix = RAID_AVATAR_PREFIXES[nextRaid?.raidId || currentRaid?.raidId] || 'Easy';

        // --- Lógica de Transição ---
        if (announcerState.state?.startsWith('transition_')) {
            const targetState = announcerState.state.replace('transition_to_', '');
            
            // 1. Edita a mensagem com o GIF de transição
            const transitionGif = await assetService.getAsset(`Tran${assetPrefix}${targetState === 'open' ? 'A' : (targetState === 'starting_soon' ? '5m' : (targetState === 'closing_soon' ? 'F' : 'PR'))}`);
            const transitionEmbed = new EmbedBuilder().setColor(0x2F3136).setImage(transitionGif);
            
            try {
                if (announcerState.messageId) {
                    await webhookClient.editMessage(announcerState.messageId, { embeds: [transitionEmbed] });
                } else {
                    const msg = await webhookClient.send({ embeds: [transitionEmbed], wait: true });
                    announcerState.messageId = msg.id;
                }
            } catch(e) { logger.error(`[raidAnnouncer] Falha ao mostrar GIF de transição para ${targetState}: ${e.message}`) }
            
            // 2. Espera 10 segundos
            await sleep(10000);

            // 3. Atualiza o estado para o estado final e permite que o próximo ciclo processe o estado real
            await updateDoc(announcerRef, { state: targetState });
            logger.info(`[${announcerState.raidId}] Transição para '${targetState}' concluída.`);
            return; // Termina este ciclo para o próximo tratar o novo estado
        }


        // --- Lógica Principal de Estados ---
        if (currentRaid) {
            const { raid, raidId, startTimeMs, tenSecondMark } = currentRaid;
            const isNewCycle = announcerState.raidId !== raidId || (announcerState.state !== 'open' && announcerState.state !== 'closing_soon');

            if (announcerState.state === 'starting_soon' && isNewCycle) {
                 await updateDoc(announcerRef, { state: 'transition_to_open', raidId, startTimeMs });
                 logger.info(`[${raidId}] Iniciando transição para ABERTA.`);
                 return; // Sai para o próximo ciclo fazer a transição
            }

            if (announcerState.state === 'open') {
                if (Date.now() >= tenSecondMark) {
                    await updateDoc(announcerRef, { state: 'transition_to_closing_soon' });
                    logger.info(`[${raidId}] Iniciando transição para FECHANDO EM 10S.`);
                    return; // Sai para o próximo ciclo fazer a transição
                }
            } else if (announcerState.state === 'closing_soon') {
                // Apenas exibe o estado final de fechamento
                const closingAvatar = await assetService.getAsset(`${assetPrefix}F`);
                await webhookClient.edit({ name: `Raid ${raidId} fechando!`, avatar: closingAvatar });
                
                const gifUrl = await assetService.getAsset(`${assetPrefix}F`);
                const closingEmbed = new EmbedBuilder().setImage(gifUrl).setColor(0x000000).setDescription('O portal está fechando!').setFooter({ text: 'Contagem regressiva final!' });

                try {
                    await webhookClient.editMessage(announcerState.messageId, { embeds: [closingEmbed] });
                } catch(e) {
                     logger.error(`[${raidId}] Falha ao editar mensagem para 10s: ${e.message}`);
                }
                logger.info(`[${raidId}] Anúncio de FECHANDO EM 10S enviado.`);
                // O estado de 'finished' será tratado no próximo ciclo quando currentRaid for null
            } else if (isNewCycle) {
                 const openAvatar = await assetService.getAsset(`${assetPrefix}A`);
                 await webhookClient.edit({ name: `🔥 A Raid Começou: ${raidId}!`, avatar: openAvatar });
                 const gifUrl = await assetService.getAsset(`${assetPrefix}A`);
                 const embed = new EmbedBuilder().setImage(gifUrl).setColor(0xFF4B4B).setDescription('A raid está aberta! Entre agora!').addFields({ name: 'Dificuldade', value: raidId, inline: true }, { name: 'Vida do Chefe', value: `\`${raid['Vida Último Boss']}\``, inline: true }, { name: 'Dano Recomendado', value: `\`${raid['Dano Recomendado']}\``, inline: true }, { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }).setTimestamp(startTimeMs).setFooter({ text: 'O portal fechará em 2 minutos.' });
                
                 const roleMention = raid.roleId ? `<@&${raid.roleId}>` : '';
                 const message = await webhookClient.send({ content: roleMention, embeds: [embed], wait: true });
                 
                 await setDoc(announcerRef, { state: 'open', raidId, messageId: message.id, startTimeMs, webhookUrl: webhookClient.url }, { merge: true });
                 logger.info(`[${raidId}] Anúncio de RAID ABERTA enviado.`);
            }

        } else if (nextRaid) {
            const { raidId, fiveMinuteMark } = nextRaid;
            const isDifferentRaid = announcerState.raidId !== raidId || announcerState.state === 'finished';

            if (announcerState.state === 'next_up' && Date.now() >= fiveMinuteMark) {
                 await updateDoc(announcerRef, { state: 'transition_to_starting_soon' });
                 logger.info(`[${raidId}] Iniciando transição para 5 MINUTOS.`);
                 return; // Sai para o próximo ciclo fazer a transição
            }
            
            if (announcerState.state === 'starting_soon') {
                const fiveMinAvatar = await assetService.getAsset(`${assetPrefix}5m`);
                await webhookClient.edit({ name: `Atenção! Raid ${raidId} em 5 Min!`, avatar: fiveMinAvatar });
                const gifUrl = await assetService.getAsset(`${assetPrefix}5m`);
                const embed = new EmbedBuilder().setImage(gifUrl).setColor(0xFFA500).setDescription('A próxima raid começa em 5 minutos! Prepare-se!');
                await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }).catch(e => logger.error(`[${raidId}] Falha ao editar mensagem para 5min: ${e.message}`));
                logger.info(`[${raidId}] Anúncio de 5 MINUTOS enviado.`);

            } else if (isDifferentRaid) {
                const nextAvatar = await assetService.getAsset(`${assetPrefix}PR`);
                await webhookClient.edit({ name: `Próxima Raid: ${raidId}`, avatar: nextAvatar });
                const gifUrl = await assetService.getAsset(`${assetPrefix}PR`);
                const embed = new EmbedBuilder().setImage(gifUrl).setColor(0x2F3136).setDescription('Preparando para o próximo ciclo de raids...');

                let message;
                if (announcerState.messageId && announcerState.state !== 'finished') {
                    try { message = await webhookClient.editMessage(announcerState.messageId, { embeds: [embed] }); } 
                    catch { message = await webhookClient.send({ embeds: [embed], wait: true }); }
                } else {
                    message = await webhookClient.send({ embeds: [embed], wait: true });
                }

                await setDoc(announcerRef, { state: 'next_up', raidId, messageId: message.id, webhookUrl: webhookClient.url }, { merge: true });
                logger.info(`[${raidId}] Anunciado como PRÓXIMA RAID.`);
            }

        } else if (announcerState.state && announcerState.state !== 'finished') {
             const timeSinceStart = Date.now() - (announcerState.startTimeMs || 0);
             if (timeSinceStart > (PORTAL_OPEN_DURATION_SECONDS * 1000) + 11000) { // 2m + 11s de margem
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
