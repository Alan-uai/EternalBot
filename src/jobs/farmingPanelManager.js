// src/jobs/farmingPanelManager.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

const PANEL_DOC_ID = 'farmingPanel';
const PERSISTENT_WEBHOOK_NAME = 'Painel de Farms';
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
    const { firebase, imageGenerator } = services;
    const { firestore } = firebase;

    try {
        const now = new Date(new Date().getTime() - 3 * 60 * 60 * 1000);
        const currentDay = WEEKDAYS[now.getDay()];
        
        await cleanupOldFarms(firestore, now.getDay(), logger);

        const allFarmsForWeek = [];
        for (const day of WEEKDAYS) {
            allFarmsForWeek.push(...await getFarmsForDay(firestore, day));
        }

        const allFarmsToday = allFarmsForWeek.filter(farm => farm.dayOfWeek === currentDay);
        
        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        if (!webhookUrl) {
            logger.warn(`[farmingPanelManager] URL do webhook '${PANEL_DOC_ID}' não encontrada. O job 'ready' deve criá-la.`);
            return;
        }
        
        const webhookClient = new WebhookClient({ url: webhookUrl });

        // Generate schedule image
        const scheduleImage = await imageGenerator.createScheduleImage(allFarmsForWeek);
        const attachment = new AttachmentBuilder(scheduleImage, { name: 'schedule.png' });

        const embeds = [];
        if (allFarmsToday.length === 0) {
            const emptyEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setDescription('Nenhum farm agendado para hoje. Use o comando `/farming` para criar um!');
            embeds.push(emptyEmbed);
        } else {
            const farmsByHost = allFarmsToday.reduce((acc, farm) => {
                if (!acc[farm.hostId]) {
                    acc[farm.hostId] = {
                        hostUsername: farm.hostUsername,
                        farms: []
                    };
                }
                acc[farm.hostId].farms.push(farm);
                return acc;
            }, {});

            for (const hostId in farmsByHost) {
                const hostData = farmsByHost[hostId];
                const hostUser = await client.users.fetch(hostId).catch(() => ({
                    username: hostData.hostUsername,
                    displayAvatarURL: () => client.user.displayAvatarURL()
                }));

                const hostEmbed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setAuthor({ name: `Farms de ${hostUser.username}`, iconURL: hostUser.displayAvatarURL() })
                    .setTimestamp();
                
                hostData.farms.forEach(farm => {
                    hostEmbed.addFields({
                        name: `Raid: ${farm.raidName} às ${farm.time}`,
                        value: `> Quantidade Média: **${farm.quantity}**\n> Participantes: **${farm.participants.length}**`,
                        inline: false
                    });
                });
                embeds.push(hostEmbed);
            }
        }
        
        // Participation Menu
        const participationMenu = new StringSelectMenuBuilder()
            .setCustomId('farming_participate')
            .setPlaceholder('Clique para participar de um farm...')
            .setOptions(allFarmsToday.length > 0 ? allFarmsToday.map(farm => ({
                label: `${farm.time} - ${farm.raidName}`,
                description: `Host: ${farm.hostUsername} | ${farm.participants.length} participante(s)`,
                value: farm.id,
            })) : [{label: 'Nenhum farm hoje', value: 'no_farm'}]);

        if (participationMenu.options.length === 0) {
            participationMenu.addOptions({label: 'Nenhum farm disponível para hoje', value: 'none'}).setDisabled(true);
        }

        const row = new ActionRowBuilder().addComponents(participationMenu);

        const payload = {
            username: `${PERSISTENT_WEBHOOK_NAME} - ${WEEKDAYS_PT[currentDay]}`,
            avatarURL: client.user.displayAvatarURL(),
            embeds: embeds,
            components: [row],
            files: [attachment]
        };

        if (messageId) {
            try {
                await webhookClient.editMessage(messageId, payload);
            } catch (error) {
                const newMessage = await webhookClient.send({ ...payload, wait: true });
                await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
            }
        } else {
            const newMessage = await webhookClient.send({ ...payload, wait: true });
            await setDoc(panelWebhookDocRef, { messageId: newMessage.id }, { merge: true });
        }

    } catch (error) {
        logger.error('Erro ao atualizar o painel de farms:', error);
    }
}
