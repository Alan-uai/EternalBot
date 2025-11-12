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

// Function to delete farms from past days and cleanup their resources
async function cleanupOldFarmsAndResources(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    const guild = await client.guilds.fetch(config.GUILD_ID).catch(() => null);
    if (!guild) return;

    const now = new Date();
    const currentDayIndex = now.getDay();
    
    const batch = writeBatch(firestore);
    let deletedCount = 0;

    // Cleanup expired farms from today
    const expiredTodayQuery = query(collection(firestore, 'scheduled_farms'), where("expiresAt", "<=", now));
    const expiredSnapshot = await getDocs(expiredTodayQuery);

    for (const farmDoc of expiredSnapshot.docs) {
        const farm = farmDoc.data();
        logger.info(`[farmingPanel] Limpando farm expirado de hoje: ${farm.raidName} (ID: ${farmDoc.id})`);
        if (farm.tempRoleId) {
            const role = await guild.roles.fetch(farm.tempRoleId).catch(() => null);
            if (role) await role.delete('Limpeza de cargo de farm expirado.');
        }
        batch.delete(farmDoc.ref);
        deletedCount++;
    }

    // Cleanup farms from past days
    for (let i = 0; i < WEEKDAYS.length; i++) {
        if (i < currentDayIndex) {
            const pastDay = WEEKDAYS[i];
            const q = query(collection(firestore, 'scheduled_farms'), where("dayOfWeek", "==", pastDay));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                    deletedCount++;
                });
                 logger.info(`[farmingPanel] Agendando para limpeza ${snapshot.size} farm(s) de ${WEEKDAYS_PT[pastDay]}.`);
            }
        }
    }


    if (deletedCount > 0) {
        await batch.commit();
        logger.info(`[farmingPanel] Limpeza concluída: ${deletedCount} registro(s) de farm antigo(s) e/ou expirado(s) removido(s).`);
    }
}


export const name = 'farmingPanelManager';
export const schedule = '*/60 * * * * *'; // A cada minuto

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firebase, imageGenerator } = services;
    const { firestore } = firebase;

    try {
        await cleanupOldFarmsAndResources(container);

        const now = new Date();
        const currentDay = WEEKDAYS[now.getDay()];
        
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
