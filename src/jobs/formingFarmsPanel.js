// src/jobs/formingFarmsPanel.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

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
            .setDescription('Esta é a demanda atual por grupos de farm. Use `/interesse` para se registrar!')
            .setTimestamp();
        
        if (Object.keys(interestData).length === 0) {
            embed.addFields({ name: 'Nenhum interesse registrado', value: 'Seja o primeiro a usar `/interesse` e registrar sua necessidade!' });
        } else {
            let description = 'Use os menus abaixo para se juntar a um grupo ou para se tornar o host de um.\n\n';
            for (const [raidName, users] of Object.entries(interestData)) {
                description += `**${raidName}**: \`${users.length}\` jogador(es) interessado(s)\n`;
            }
            embed.setDescription(description);
        }

        const components = [];
        const interestOptions = Object.entries(interestData).map(([raidName, users]) => ({
            label: raidName,
            description: `${users.length} jogador(es) interessado(s)`,
            value: raidName.toLowerCase().replace(/ /g, '_'),
        }));
        
        if (interestOptions.length > 0) {
            components.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('formingfarm_participate')
                        .setPlaceholder('Quero Participar de um Farm...')
                        .addOptions(interestOptions)
                ),
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('formingfarm_host')
                        .setPlaceholder('Quero ser o Host de um Farm...')
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
        logger.error('[formingFarmsPanel] Erro ao atualizar o painel:', error);
    }
}
