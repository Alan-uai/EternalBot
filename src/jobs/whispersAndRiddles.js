// src/jobs/whispersAndRiddles.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy, limit, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

const JOB_ID = 'whispersAndRiddles';
export const RIDDLE_DOC_ID = 'currentRiddle'; // Exportado para uso no handler do botão
const RIDDLE_LIFETIME_MS = 60 * 60 * 1000; // 1 hora

const CHARACTERS = [
    // Comuns (mais frequentes)
    { name: "Ne'enm0", assetId: 'Neenm0', weight: 15 },
    { name: "Thdurin'", assetId: 'Thdurin', weight: 15 },
    { name: "Za'rack", assetId: 'Zarack', weight: 15 },
    { name: "Dhourr", assetId: 'Dhourr', weight: 15 },
    { name: "Lattum", assetId: 'Lattum', weight: 10 },
    { name: "Sha'a", assetId: 'Shaa', weight: 10 },
    { name: "Shadow", assetId: 'Shadow', weight: 5 },
    { name: "Ign", assetId: 'Ign', weight: 5 },
    { name: "Ik", assetId: 'Ik', weight: 5 },
    { name: "Naame", assetId: 'Naame', weight: 5 },
    { name: "UwU", assetId: 'UwU', weight: 5 },
    { name: "Lucidium", assetId: 'Lucidium', weight: 5 },
    // Raros
    { name: "Kardec'", assetId: 'Kardec', weight: 2 },
    { name: "Za'ahs", assetId: 'Zaahs', weight: 2 },
    { name: "Fiene'mous", assetId: 'Fienemous', weight: 1 },
    { name: "Alba'treum", assetId: 'Albatreum', weight: 1 },
];

const CHANNELS_TO_POST = [
    '1426957344897761282', // community-help
    '1429309293076680744', // chat (substituído do 'general')
    '1429347347539820625', // fanart
    '1429295728379039756', // farming-panel
    '1429260587648417964', // raid-announcer (substituído do ID antigo)
    '1426958926208958626', // bot-spam
    '1426958336057675857', // updlog
    '1429346813919494214', // codes
];

function getWeightedRandomCharacter() {
    const totalWeight = CHARACTERS.reduce((sum, char) => sum + char.weight, 0);
    let random = Math.random() * totalWeight;
    for (const char of CHARACTERS) {
        if (random < char.weight) {
            return char;
        }
        random -= char.weight;
    }
    return CHARACTERS[0]; // Fallback
}

export const name = JOB_ID;
export const schedule = '0 */2 * * *'; // A cada 2 horas

async function cleanupOldRiddle(container) {
    const { client, logger, services } = container;
    const { firestore } = services.firebase;
    
    const currentRiddleRef = doc(firestore, 'bot_config', RIDDLE_DOC_ID);
    const riddleSnap = await getDoc(currentRiddleRef);

    if (riddleSnap.exists()) {
        const riddleData = riddleSnap.data();
        if (riddleData.messageId && riddleData.webhookUrl) {
            const webhookClient = new WebhookClient({ url: riddleData.webhookUrl });
            try {
                await webhookClient.deleteMessage(riddleData.messageId);
                logger.info(`[${JOB_ID}] Mensagem da charada antiga (${riddleData.id}) removida.`);
            } catch (e) {
                logger.warn(`[${JOB_ID}] Falha ao remover mensagem da charada antiga. Pode já ter sido removida.`);
            }
        }
        await deleteDoc(currentRiddleRef);
    }
}


export async function run(container) {
    const { client, logger, services } = container;
    const { firestore, assetService } = services;

    logger.info(`[${JOB_ID}] Iniciando job de charadas e sussurros...`);

    try {
        await cleanupOldRiddle(container);

        const riddlesCollectionRef = collection(firestore, 'riddles');
        const q = query(riddlesCollectionRef, orderBy('lastUsedAt', 'asc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            logger.warn(`[${JOB_ID}] Nenhuma charada encontrada no banco de dados.`);
            return;
        }

        const riddleDoc = querySnapshot.docs[0];
        const riddle = { id: riddleDoc.id, ...riddleDoc.data() };

        const character = getWeightedRandomCharacter();
        const channelId = CHANNELS_TO_POST[Math.floor(Math.random() * CHANNELS_TO_POST.length)];
        const channel = await client.channels.fetch(channelId).catch(() => null);

        if (!channel) {
            logger.error(`[${JOB_ID}] Canal com ID ${channelId} não encontrado.`);
            return;
        }
        
        const webhookName = `Sussurros de ${character.name}`;
        const announcerDocRef = doc(firestore, 'bot_config', `${JOB_ID}_${channel.id}`);
        const announcerDocSnap = await getDoc(announcerDocRef);

        let webhookUrl = announcerDocSnap.exists() ? announcerDocSnap.data().webhookUrl : null;
        
        // Garante a existência do webhook
        const avatar = await assetService.getAsset(character.assetId) || await assetService.getAsset('BotAvatar');
        
        if (!webhookUrl) {
            const newWebhook = await channel.createWebhook({ name: webhookName, avatar, reason: 'Webhook para o sistema de charadas.' });
            webhookUrl = newWebhook.url;
            await setDoc(announcerDocRef, { webhookUrl });
        }
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`riddle_answer_${riddle.id}`)
                    .setLabel('Responder Sussurro')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🤫')
            );
            
        const embed = new EmbedBuilder()
            .setColor(0x9932CC)
            .setAuthor({ name: `${character.name} sussurra...` })
            .setDescription(`*${riddle.text}*`)
            .setFooter({ text: `Os ${riddle.maxWinners} primeiros a acertar ganham reputação! O sussurro desaparece em 1 hora.` });

        await webhookClient.edit({ name: character.name, avatar: avatar });
        const message = await webhookClient.send({
            embeds: [embed],
            components: [row]
        });

        const newRiddleData = {
            ...riddle,
            isActive: true,
            postedAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + RIDDLE_LIFETIME_MS),
            solvedBy: [],
            channelId: channel.id,
            characterName: character.name,
            messageId: message.id,
            webhookUrl: webhookClient.url,
        };
        await setDoc(doc(firestore, 'bot_config', RIDDLE_DOC_ID), newRiddleData);

        await updateDoc(doc(firestore, 'riddles', riddle.id), {
            lastUsedAt: serverTimestamp()
        });

        logger.info(`[${JOB_ID}] Charada '${riddle.id}' postada no canal #${channel.name} como '${character.name}'.`);

    } catch (error) {
        logger.error(`[${JOB_ID}] Erro crítico ao executar o job:`, error);
    }
}
