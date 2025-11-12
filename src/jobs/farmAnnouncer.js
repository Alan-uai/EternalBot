// src/jobs/farmAnnouncer.js
import { EmbedBuilder, WebhookClient, Role, Guild } from 'discord.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'farmAnnouncer';
const FARM_ROLE_PREFIX = 'Farm: ';
const ANNOUNCEMENT_LIFETIME_MS = 60 * 60 * 1000; // 1 hora

async function handleAnnouncements(container, farms) {
    const { client, config, logger, services } = container;
    const { firebase } = services;
    const { firestore } = firebase;
    
    const announcerDocRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    const announcerDoc = await getDoc(announcerDocRef);
    if (!announcerDoc.exists() || !announcerDoc.data().webhookUrl) {
        logger.warn(`[farmAnnouncer] Webhook de anúncio de farm (${ANNOUNCER_DOC_ID}) não encontrado. Nenhum anúncio será enviado.`);
        return;
    }
    const webhookUrl = announcerDoc.data().webhookUrl;
    const webhookClient = new WebhookClient({ url: webhookUrl });

    const guild = await client.guilds.fetch(config.GUILD_ID).catch(e => {
        logger.error(`[farmAnnouncer] Não foi possível encontrar a guilda com ID ${config.GUILD_ID}.`);
        return null;
    });
    if (!guild) return;

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    for (const farm of farms) {
        const [hour, minute] = farm.time.split(':');
        const farmTime = new Date(now);
        farmTime.setHours(hour, minute, 0, 0);

        // --- Anúncio de 5 minutos ---
        if (farmTime > now && farmTime <= fiveMinutesFromNow && !farm.announced5m) {
            const host = await client.users.fetch(farm.hostId).catch(() => null);
            const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
            const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setAuthor({ name: `Farm de ${host?.username || farm.hostUsername}`, iconURL: host?.displayAvatarURL() })
                .setTitle(`A Raid ${farm.raidName} começa em 5 minutos!`)
                .setDescription('Preparem-se para o farm!');
            if (serverLink) {
                embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${serverLink})**` });
            }

            const announcementMessage = await webhookClient.send({
                username: `5m | ${farm.raidName}`,
                embeds: [embed],
                wait: true
            });

            await updateDoc(doc(firestore, 'scheduled_farms', farm.id), { 
                announced5m: true,
                announcementId: announcementMessage.id
            });
            logger.info(`[farmAnnouncer] Anúncio de 5 minutos enviado para a raid ${farm.raidName}.`);
        }

        // --- Anúncio de Abertura ---
        if (farmTime <= now && !farm.announcedOpen) {
            if (farm.announcementId) {
                await webhookClient.deleteMessage(farm.announcementId).catch(e => logger.warn(`[farmAnnouncer] Não foi possível deletar a mensagem de 5min: ${e.message}`));
            }

            const host = await client.users.fetch(farm.hostId).catch(() => null);
            const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
            const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;

            // Criar o cargo temporário
            let tempRole = null;
            try {
                const roleName = `${FARM_ROLE_PREFIX}${farm.raidName}`.substring(0, 100);
                tempRole = await guild.roles.create({
                    name: roleName,
                    mentionable: true,
                    reason: `Cargo temporário para o farm de ${farm.raidName}`
                });

                for (const participantId of farm.participants) {
                    const member = await guild.members.fetch(participantId).catch(() => null);
                    if (member) await member.roles.add(tempRole);
                }
                logger.info(`[farmAnnouncer] Cargo temporário '${roleName}' criado e membros adicionados.`);
            } catch (roleError) {
                logger.error('[farmAnnouncer] Erro ao criar ou atribuir cargo temporário:', roleError);
            }

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setAuthor({ name: `Farm de ${host?.username || farm.hostUsername}`, iconURL: host?.displayAvatarURL() })
                .setTitle(`✅ Farm Aberto: ${farm.raidName}`)
                .setDescription('O farm começou! Boa sorte!');
             if (serverLink) {
                embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${serverLink})**` });
            }

            const messagePayload = {
                username: `${farm.raidName} Aberta`,
                embeds: [embed],
                content: tempRole ? `${tempRole}` : farm.participants.map(id => `<@${id}>`).join(' ')
            };

            const openAnnouncement = await webhookClient.send(messagePayload);

            await updateDoc(doc(firestore, 'scheduled_farms', farm.id), { 
                announcedOpen: true,
                announcementId: openAnnouncement.id,
                tempRoleId: tempRole ? tempRole.id : null,
                expiresAt: new Date(Date.now() + ANNOUNCEMENT_LIFETIME_MS) // Define a expiração
            });
            logger.info(`[farmAnnouncer] Anúncio de ABERTURA enviado para a raid ${farm.raidName}.`);
        }
    }
}

async function cleanupExpiredAnnouncements(container) {
    const { client, config, logger, services } = container;
    const { firestore } = services.firebase;

    const guild = await client.guilds.fetch(config.GUILD_ID).catch(() => null);
    if (!guild) return;

    const announcerDocRef = doc(firestore, 'bot_config', ANNOUNCER_DOC_ID);
    const announcerDoc = await getDoc(announcerDocRef);
    if (!announcerDoc.exists()) return;
    const webhookClient = new WebhookClient({ url: announcerDoc.data().webhookUrl });

    const q = query(collection(firestore, 'scheduled_farms'), where("expiresAt", "<=", new Date()));
    const snapshot = await getDocs(q);

    for (const farmDoc of snapshot.docs) {
        const farm = farmDoc.data();
        logger.info(`[farmAnnouncer] Limpando recursos expirados para o farm ${farm.raidName} (ID: ${farmDoc.id})`);
        
        // Deletar mensagem de anúncio
        if(farm.announcementId) {
            await webhookClient.deleteMessage(farm.announcementId).catch(() => {});
        }
        
        // Deletar cargo temporário
        if(farm.tempRoleId) {
            const role = await guild.roles.fetch(farm.tempRoleId).catch(() => null);
            if(role) await role.delete('Limpeza de cargo de farm expirado.');
        }

        // Deletar o farm do Firestore
        await deleteDoc(farmDoc.ref);
    }
}

export const name = 'farmAnnouncer';
export const schedule = '*/20 * * * * *'; // A cada 20 segundos

export async function run(container) {
    const { logger, services } = container;
    const { firestore } = services.firebase;
    
    try {
        const now = new Date();
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        
        const q = query(collection(firestore, 'scheduled_farms'), where("dayOfWeek", "==", currentDay));
        const snapshot = await getDocs(q);
        const farmsToday = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        await handleAnnouncements(container, farmsToday);
        await cleanupExpiredAnnouncements(container);

    } catch (error) {
        logger.error('[farmAnnouncer] Erro ao executar o job de anúncios de farm:', error);
    }
}
