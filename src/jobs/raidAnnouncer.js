// src/jobs/raidAnnouncer.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getRaidTimings } from '../utils/raidTimings.js';

const ANNOUNCER_DOC_ID = 'raidAnnouncer';

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Easy', 'Medium': 'Med', 'Hard': 'Hd', 'Insane': 'Isne',
    'Crazy': 'Czy', 'Nightmare': 'Mare', 'Leaf Raid': 'Lf'
};

// Mapeamento de Nomes de Webhook para cada estado
const RAID_NAMES = {
    'Easy': 'Jajá Vem Aí!', 'Medium': 'Jajá Vem Aí!', 'Hard': 'Jajá Vem Aí!',
    'Insane': 'Jajá Vem Aí!', 'Crazy': 'Jajá Vem Aí!', 'Nightmare': 'Jajá Vem Aí!',
    'Leaf Raid': 'Jajá Vem Aí!',
    'starting_soon': 'Fique Ligado!',
    'open': 'Ela Chegou 🥳🎉',
    'closing_soon': 'Corra! Falta Pouco'
};

// Mapeamento de Avatares para cada estado
const RAID_AVATAR_ASSETS = {
    'next_up': 'PR',
    'starting_soon': '5m',
    'open': 'A',
    'closing_soon': 'F'
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

        const assetPrefix = RAID_AVATAR_PREFIXES[newRaidId] || 'Easy';
        const assetSuffix = RAID_AVATAR_ASSETS[desiredState];
        const finalWebhookName = RAID_NAMES[desiredState] || RAID_NAMES[newRaidId];
        
        const transitionGifUrl = await assetService.getAsset(`Tran${assetPrefix}${assetSuffix}`);
        const finalGifUrl = await assetService.getAsset(`${assetPrefix}${assetSuffix}`);
        
        let finalAvatarUrl = await assetService.getAsset(assetPrefix + assetSuffix);
        if (!finalAvatarUrl) {
            finalAvatarUrl = await assetService.getAsset('DungeonLobby');
        }

        const embed = new EmbedBuilder()
            .addFields(
                { name: 'Dificuldade', value: activeRaidDetails['Dificuldade'], inline: true },
                { name: 'Vida do Chefe', value: `\`${activeRaidDetails['Vida Último Boss']}\``, inline: true },
                { name: 'Dano Recomendado', value: `\`${activeRaidDetails['Dano Recomendado']}\``, inline: true },
                { name: 'Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${config.GAME_LINK})**` }
            );

        let finalContent = '';
        if (activeRaidDetails.roleId && desiredState === 'open') {
             const guild = await client.guilds.fetch(config.GUILD_ID);
             const role = await guild.roles.fetch(activeRaidDetails.roleId);
             const roleName = role ? role.name : activeRaidDetails.Dificuldade;
             
             const baseLine = '───────────────────────────────';
             const totalWidth = baseLine.length;
             const mentionText = `<@&${activeRaidDetails.roleId}>`;
             
             // O cálculo do espaço agora usa o NOME do cargo, mas o texto final usa a MENÇÃO
             const centralContentLength = roleName.length + 2; // Nome + 2 espaços
             
             // Garante que o padding não seja negativo se o nome for muito grande
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

        // Posta a nova mensagem (com a transição, se houver)
        const sentMessage = await webhookClient.send({
            username: finalWebhookName,
            avatarURL: finalAvatarUrl,
            embeds: [embed.setImage(hasTransition ? transitionGifUrl : finalGifUrl)],
            content: finalContent,
            wait: true
        });

        // Salva o ID da nova mensagem
        await updateDoc(announcerRef, { state: desiredState, raidId: newRaidId, messageId: sentMessage.id });
        logger.info(`[${newRaidId}] Posted message for state: '${desiredState}'.`);

        // Se houve transição, edita para o GIF final após 10s
        if (hasTransition && finalGifUrl && transitionGifUrl !== finalGifUrl) {
            await sleep(10000); // Duração da transição
            
            const latestAnnouncerDoc = await getDoc(announcerRef);
            // Confirma que a mensagem ainda é a que acabamos de postar antes de editar
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
