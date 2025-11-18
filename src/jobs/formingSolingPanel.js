// src/jobs/formingSolingPanel.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

const PANEL_DOC_ID = 'formingSolingPanel';
const PERSISTENT_WEBHOOK_NAME = 'Formando Grupos de Soling';

async function getInterestData(firestore) {
    const interests = {};
    const q = query(collection(firestore, 'raid_interests'), where("purpose", "==", "soling"));
    const snapshot = await getDocs(q);
    
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const batch = writeBatch(firestore);
    let hasDeletions = false;

    snapshot.forEach(doc => {
        const data = doc.data();
         const createdAt = data.createdAt?.toDate().getTime();

        if (createdAt && (now - createdAt > twentyFourHours)) {
            batch.delete(doc.ref);
            hasDeletions = true;
            return;
        }

        if (!interests[data.raidName]) {
            interests[data.raidName] = [];
        }
        interests[data.raidName].push({ userId: data.userId, username: data.username });
    });

    if (hasDeletions) {
        await batch.commit();
    }

    return interests;
}

export const name = 'formingSolingPanel';
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
            logger.warn(`[formingSolingPanel] URL do webhook '${PANEL_DOC_ID}' não encontrada.`);
            return;
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const interestData = await getInterestData(firestore);

        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('🆘 Formando Grupos para Ajudar a Solar')
            .setTimestamp();
        
        const components = [];
        const interestOptions = Object.keys(interestData).map(raidName => ({
            label: raidName,
            description: `${interestData[raidName].length} jogador(es) precisando de ajuda`,
            value: raidName.toLowerCase().replace(/ /g, '_'),
        }));
        
        if (Object.keys(interestData).length === 0) {
            embed.setDescription('Ninguém precisando de ajuda no momento. Use `/interesse` se precisar de ajuda para solar uma raid.');
        } else {
            let description = 'Use os menus abaixo para registrar seu interesse ou para se voluntariar como host.\n\n';
            for (const [raidName, users] of Object.entries(interestData)) {
                description += `**${raidName}**: \`${users.length}\` jogador(es) precisando de ajuda\n`;
            }
            embed.setDescription(description);

            components.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('formingsoling_participate')
                        .setPlaceholder('Quero Participar (preciso de ajuda)...')
                        .addOptions(interestOptions)
                ),
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('formingsoling_host')
                        .setPlaceholder('Quero ser o Host (ajudar um grupo)...')
                        .addOptions(interestOptions)
                )
            );
        }

        const payload = {
            username: PERSISTENT_WEBHOOK_NAME,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed],
            components
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
        logger.error('[formingSolingPanel] Erro ao atualizar o painel:', error);
    }
}
