// src/jobs/formingFarmsPanel.js
import { EmbedBuilder, WebhookClient } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const PANEL_DOC_ID = 'formingFarmsPanel';
const PERSISTENT_WEBHOOK_NAME = 'Formando Grupos de Farm';

async function getInterestData(firestore) {
    const interests = {};
    const q = query(collection(firestore, 'raid_interests'), where("purpose", "==", "farm"));
    const snapshot = await getDocs(q);

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const batch = writeBatch(firestore);
    let hasDeletions = false;

    snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate().getTime();

        // Limpa interesses com mais de 24h
        if (createdAt && (now - createdAt > twentyFourHours)) {
            batch.delete(doc.ref);
            hasDeletions = true;
            return;
        }

        if (!interests[data.raidName]) {
            interests[data.raidName] = 0;
        }
        interests[data.raidName]++;
    });

    if (hasDeletions) {
        await batch.commit();
    }

    return Object.entries(interests)
                 .sort(([, a], [, b]) => b - a)
                 .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
}

export const name = 'formingFarmsPanel';
export const schedule = '*/90 * * * * *'; // A cada 90 segundos

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    try {
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        if (!webhookUrl) {
            logger.warn(`[formingFarmsPanel] URL do webhook '${PANEL_DOC_ID}' não encontrada.`);
            return;
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const interestData = await getInterestData(firestore);

        const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('🌾 Formando Grupos de Farm')
            .setDescription('Esta é a demanda atual por grupos de farm. Use `/interesse` para adicionar seu nome à lista!')
            .setTimestamp();
        
        if (Object.keys(interestData).length === 0) {
            embed.addFields({ name: 'Nenhum interesse registrado', value: 'Seja o primeiro a usar `/interesse` e registrar sua necessidade!' });
        } else {
            let description = '';
            for (const [raidName, count] of Object.entries(interestData)) {
                description += `**${raidName}**: \`${count}\` jogador(es)\n`;
            }
            embed.setDescription(description);
        }

        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed]
        };

        if (messageId) {
            try {
                await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                const newMessage = await webhookClient.send(payload);
                await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
            }
        } else {
            const newMessage = await webhookClient.send(payload);
            await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
        }
    } catch (error) {
        logger.error('[formingFarmsPanel] Erro ao atualizar o painel:', error);
    }
}
