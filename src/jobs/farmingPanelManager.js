// src/jobs/farmingPanelManager.js
import { EmbedBuilder, WebhookClient, ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';

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

async function handleAnnouncements(container, farms) {
    const { client, config, logger, services } = container;
    const { firebase, assetService } = services;
    const { firestore } = firebase;
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    for (const farm of farms) {
        const [hour, minute] = farm.time.split(':');
        const farmTime = new Date(now);
        farmTime.setHours(hour, minute, 0, 0);

        const farmTimeMs = farmTime.getTime();

        // 5-minute warning
        if (farmTime > now && farmTime <= fiveMinutesFromNow && !farm.announced5m) {
            if (!farm.webhookUrl) {
                logger.warn(`[farmingPanel] Webhook URL ausente para o farm ${farm.id}. Anúncio de 5min ignorado.`);
                continue;
            }
            const channel = await client.channels.fetch(config.FARMING_PANEL_CHANNEL_ID).catch(() => null);
            if(channel) {
                const host = await client.users.fetch(farm.hostId).catch(() => null);
                const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
                const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;

                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setAuthor({ name: `Farm de ${host?.username || farm.hostUsername}`, iconURL: host?.displayAvatarURL() })
                    .setTitle(`A Raid ${farm.raidName} começa em 5 minutos!`)
                    .setDescription('Prepare-se para o farm!');
                if (serverLink) {
                    embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${serverLink})**` });
                }

                const webhook = new WebhookClient({ url: farm.webhookUrl });
                const announcementMessage = await webhook.send({
                    username: `5m | ${farm.raidName}`,
                    embeds: [embed],
                    wait: true
                });

                await updateDoc(doc(firestore, 'scheduled_farms', farm.id), { 
                    announced5m: true,
                    announcementId: announcementMessage.id
                });
                logger.info(`[farmingPanel] Anúncio de 5 minutos enviado para a raid ${farm.raidName}.`);
            }
        }

        // "Open" announcement
        if (farmTime <= now && !farm.announcedOpen) {
             if (!farm.webhookUrl) {
                logger.warn(`[farmingPanel] Webhook URL ausente para o farm ${farm.id}. Anúncio de ABERTURA ignorado.`);
                continue;
            }
            const channel = await client.channels.fetch(config.FARMING_PANEL_CHANNEL_ID).catch(() => null);
            if(channel) {
                const webhook = new WebhookClient({ url: farm.webhookUrl });
                
                // Delete the 5-minute warning message if it exists
                if (farm.announcementId) {
                    await webhook.deleteMessage(farm.announcementId).catch(e => logger.warn(`[farmingPanel] Não foi possível deletar a mensagem de 5min: ${e.message}`));
                }

                const host = await client.users.fetch(farm.hostId).catch(() => null);
                const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
                const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;

                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setAuthor({ name: `Farm de ${host?.username || farm.hostUsername}`, iconURL: host?.displayAvatarURL() })
                    .setTitle(`✅ Farm Aberto: ${farm.raidName}`)
                    .setDescription('O farm começou! Boa sorte!');
                 if (serverLink) {
                    embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${serverLink})**` });
                }

                await webhook.send({
                    username: `${farm.raidName} Aberta`,
                    embeds: [embed],
                    content: farm.participants.map(id => `<@${id}>`).join(' ')
                });

                await updateDoc(doc(firestore, 'scheduled_farms', farm.id), { 
                    announcedOpen: true 
                });
                logger.info(`[farmingPanel] Anúncio de ABERTURA enviado para a raid ${farm.raidName}.`);
            }
        }
    }
}

export const name = 'farmingPanelManager';
export const schedule = '*/60 * * * * *'; // A cada minuto

export async function run(container) {
    const { client, config, logger, services } = container;
    const { firebase, imageGenerator } = services;
    const { firestore } = firebase;

    try {
        const now = new Date();
        const currentDay = WEEKDAYS[now.getDay()];
        
        await cleanupOldFarms(firestore, now.getDay(), logger);

        const allFarmsForWeek = [];
        for (const day of WEEKDAYS) {
            allFarmsForWeek.push(...await getFarmsForDay(firestore, day));
        }

        const allFarmsToday = allFarmsForWeek.filter(farm => farm.dayOfWeek === currentDay);
        
        // Handle announcements
        await handleAnnouncements(container, allFarmsToday);

        const panelWebhookDocRef = doc(firestore, 'bot_config', PANEL_DOC_ID);
        const docSnap = await getDoc(panelWebhookDocRef);
        
        let webhookUrl = docSnap.exists() ? docSnap.data().webhookUrl : null;
        let messageId = docSnap.exists() ? docSnap.data().messageId : null;

        const channel = await client.channels.fetch(config.FARMING_PANEL_CHANNEL_ID);
        if (!webhookUrl) {
            const webhooks = await channel.fetchWebhooks();
            let webhook = webhooks.find(wh => wh.name.startsWith('Farms de'));
            if (!webhook) {
                 webhook = await channel.createWebhook({ name: `Farms de ${WEEKDAYS_PT[currentDay]}`, reason: 'Painel de agendamento de farms.'});
            }
            webhookUrl = webhook.url;
            await setDoc(panelWebhookDocRef, { webhookUrl }, { merge: true });
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
            username: `Painel de Farms - ${WEEKDAYS_PT[currentDay]}`,
            avatarURL: client.user.displayAvatarURL(),
            embeds: embeds,
            components: [row],
            files: [attachment]
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
        logger.error('Erro ao atualizar o painel de farms:', error);
    }
}
