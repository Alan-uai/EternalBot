// src/jobs/whispersAndRiddles.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

const JOB_ID = 'whispersAndRiddles';
const RIDDLE_DOC_ID = 'currentRiddle';

const CHARACTERS = [
    // Comuns (mais frequentes)
    { name: "Ne'enm0", assetId: 'Neenm0', weight: 15 },
    { name: "Thdurin'", assetId: 'Thdurin', weight: 15 },
    { name: "Za'rack", assetId: 'Zarack', weight: 15 },
    { name: "Dhourr", assetId: 'Dhourr', weight: 15 },
    { name: "Lattum", assetId: 'Lattum', weight: 10 },
    { name: "Sha'a", assetId: 'Shaa', weight: 10 },
    { name: "Shadow", assetId: 'Shadow', weight: 5 },
    { name: "Ign", assetId: 'Ign', weight dystopian: 5 },
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
    '1426957344897761282',
    '1429346724174102748',
    '1429347347539820625',
    '1429295728379039756',
    '1431283115518591057',
    '1426958926208958626',
    '1426958336057675857',
    '1429346813919494214',
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

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;

    logger.info(`[${JOB_ID}] Iniciando job de charadas e sussurros...`);

    try {
        // 1. Verificar se já existe uma charada ativa
        const currentRiddleRef = doc(firestore, 'bot_config', RIDDLE_DOC_ID);
        const currentRiddleSnap = await getDoc(currentRiddleRef);
        if (currentRiddleSnap.exists() && currentRiddleSnap.data().isActive) {
            logger.info(`[${JOB_ID}] Uma charada já está ativa. Pulando esta execução.`);
            return;
        }

        // 2. Selecionar uma nova charada do Firestore
        const riddlesCollectionRef = collection(firestore, 'riddles');
        const q = query(riddlesCollectionRef, orderBy('lastUsedAt', 'asc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            logger.warn(`[${JOB_ID}] Nenhuma charada encontrada no banco de dados.`);
            return;
        }

        const riddleDoc = querySnapshot.docs[0];
        const riddle = { id: riddleDoc.id, ...riddleDoc.data() };

        // 3. Selecionar um personagem e canal aleatórios
        const character = getWeightedRandomCharacter();
        const channelId = CHANNELS_TO_POST[Math.floor(Math.random() * CHANNELS_TO_POST.length)];
        const channel = await client.channels.fetch(channelId).catch(() => null);

        if (!channel) {
            logger.error(`[${JOB_ID}] Canal com ID ${channelId} não encontrado.`);
            return;
        }
        
        // 4. Obter o webhook para o canal
        const webhookName = `Sussurros de ${character.name}`;
        const announcerDocRef = doc(firestore, 'bot_config', `${JOB_ID}_${channel.id}`);
        const announcerDocSnap = await getDoc(announcerDocRef);

        let webhookUrl = announcerDocSnap.exists() ? announcerDocSnap.data().webhookUrl : null;
        if (!webhookUrl) {
            const avatar = await assetService.getAsset(character.assetId);
            const newWebhook = await channel.createWebhook({ name: webhookName, avatar, reason: 'Webhook para o sistema de charadas.' });
            webhookUrl = newWebhook.url;
            await setDoc(announcerDocRef, { webhookUrl });
        }
        const webhookClient = new WebhookClient({ url: webhookUrl });

        // 5. Preparar e enviar a mensagem
        const embed = new EmbedBuilder()
            .setColor(0x9932CC) // Roxo escuro
            .setAuthor({ name: `${character.name} sussurra...` })
            .setDescription(`*${riddle.text}*`)
            .setFooter({ text: `Responda com /sussurro [sua resposta]. ${riddle.maxWinners} primeiros a acertar ganham reputação!` });

        const avatar = await assetService.getAsset(character.assetId);
        await webhookClient.edit({ name: character.name, avatar: avatar });
        await webhookClient.send({
            embeds: [embed],
        });

        // 6. Atualizar o estado da charada no Firestore
        const newRiddleData = {
            ...riddle,
            isActive: true,
            postedAt: serverTimestamp(),
            solvedBy: [],
            channelId: channel.id,
            characterName: character.name,
        };
        await setDoc(currentRiddleRef, newRiddleData);

        // 7. Atualizar a charada usada para que ela vá para o fim da fila
        await updateDoc(doc(firestore, 'riddles', riddle.id), {
            lastUsedAt: serverTimestamp()
        });

        logger.info(`[${JOB_ID}] Charada '${riddle.id}' postada no canal #${channel.name} como '${character.name}'.`);

    } catch (error) {
        logger.error(`[${JOB_ID}] Erro crítico ao executar o job:`, error);
    }
}
