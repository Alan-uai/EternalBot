// src/jobs/farmingPanelManager.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

const PANEL_DOC_ID = 'farmingPanel';
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAYS_PT = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

async function getFarmsForDay(firestore, dayOfWeek) {
    const farmsRef = collection(firestore, 'scheduled_farms');
    const q = query(farmsRef, where("dayOfWeek", "==", dayOfWeek));
    const querySnapshot = await getDocs(q);
    
    const farms = [];
    querySnapshot.forEach(doc => {
        farms.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by time
    farms.sort((a, b) => a.time.localeCompare(b.time));
    return farms;
}

// Function to delete farms from past days
async function cleanupOldFarms(firestore, currentDayIndex, logger) {
    const batch = writeBatch(firestore);
    let deletedCount = 0;

    for (let i = 0; i < WEEKDAYS.length; i++) {
        // Delete farms for days that are before today in the week cycle
        if ((i < currentDayIndex && currentDayIndex - i > 0) || (currentDayIndex === 0 && i > 0) /* Sunday case */) {
            const pastDay = WEEKDAYS[i];
            const farmsRef = collection(firestore, 'scheduled_farms');
            const q = query(farmsRef, where("dayOfWeek", "==", pastDay));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                    deletedCount++;
                });
            }
        }
    }

    if (deletedCount > 0) {
        await batch.commit();
        logger.info(`[farmingPanel] Limpeza concluída: ${deletedCount} farm(s) de dias passados foram removidos.`);
    }
}


export const name = 'farmingPanelManager';
export const schedule = '*/60 * * * * *'; // A cada minuto

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    try {
        const now = new Date();
        const currentDay = WEEKDAYS[now.getDay()];
        
        // Cleanup old farms
        await cleanupOldFarms(firestore, now.getDay(), logger);

        const farms = await getFarmsForDay(firestore, currentDay);
        
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        if (!webhookUrl) {
            const channel = await client.channels.fetch(config.FARMING_PANEL_CHANNEL_ID);
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name.startsWith('Farms de'));
            if (!webhook) {
                 webhook = await channel.createWebhook({ name: `Farms de ${WEEKDAYS_PT[currentDay]}`, reason: 'Painel de agendamento de farms.'});
            }
            webhookUrl = webhook.url;
            await setDoc(panelWebhookDocRef, { webhookUrl }, { merge: true });
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setAuthor({ name: `🗓️ Farms Agendados para Hoje (${WEEKDAYS_PT[currentDay]})` })
            .setTimestamp()
            .setFooter({ text: 'Use o menu abaixo para participar ou desmarcar.' });

        if (farms.length === 0) {
            embed.setDescription('Nenhum farm agendado para hoje. Use o comando `/farming` para criar um!');
        } else {
            let description = '';
            farms.forEach(farm => {
                description += `**${farm.time} - ${farm.raidName}** (Host: ${farm.hostUsername})\n`;
                description += `> Quantidade: ~${farm.quantity} | Participantes: ${farm.participants.length}\n\n`;
            });
            embed.setDescription(description);
        }
        
        // Participation Menu
        const participationMenu = new StringSelectMenuBuilder()
            .setCustomId('farming_participate')
            .setPlaceholder('Clique para participar de um farm...')
            .setOptions(farms.length > 0 ? farms.map(farm => ({
                label: `${farm.time} - ${farm.raidName}`,
                description: `Host: ${farm.hostUsername} | ${farm.participants.length} participante(s)`,
                value: farm.id,
            })) : [{label: 'Nenhum farm hoje', value: 'no_farm', default: true}]);

        const row = new ActionRowBuilder().addComponents(participationMenu);

        const payload = {
            username: `Farms de ${WEEKDAYS_PT[currentDay]}`,
            avatarURL: client.user.displayAvatarURL(),
            embeds: [embed],
            components: [row],
        };

        if (messageId) {
            try {
                await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                // If message doesn't exist, create a new one
                const newMessage = await webhookClient.send(payload);
                await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
            }
        } else {
            const newMessage = await webhookClient.send(payload);
            await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de farms:', error);
    }
}
