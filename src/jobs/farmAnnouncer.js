// src/jobs/farmAnnouncer.js
import { EmbedBuilder, WebhookClient, Role, Guild } from 'discord.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const ANNOUNCER_DOC_ID = 'farmAnnouncer';
const FARM_ROLE_PREFIX = 'Farm: ';
const ANNOUNCEMENT_LIFETIME_MS = 30 * 60 * 1000; // 30 minutos
const ROLE_LIFETIME_MS = 1 * 60 * 1000; // 1 minuto

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

    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    for (const farm of farms) {
        const [hour, minute] = farm.time.split(':');
        const farmTime = new Date(now);
        farmTime.setHours(hour, minute, 0, 0);

        // --- Anúncio de 5 minutos ---
        if (farmTime > now && farmTime <= fiveMinutesFromNow && !farm.announced5m) {
            const hostMember = await guild.members.fetch(farm.hostId).catch(() => null);
            const hostUser = hostMember ? hostMember.user : await client.users.fetch(farm.hostId).catch(() => null);
            const hostDisplayName = hostMember ? hostMember.displayName : farm.hostUsername;

            const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
            const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;
            const customMessage = farm.customMessage || 'Preparem-se para o farm!';

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setAuthor({ name: `Farm de ${hostDisplayName}`, iconURL: hostUser?.displayAvatarURL() })
                .setTitle(`A Raid ${farm.raidName} começa em 5 minutos!`)
                .setDescription(customMessage);
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

            const hostMember = await guild.members.fetch(farm.hostId).catch(() => null);
            const hostUser = hostMember ? hostMember.user : await client.users.fetch(farm.hostId).catch(() => null);
            const hostDisplayName = hostMember ? hostMember.displayName : farm.hostUsername;

            const userSnap = await getDoc(doc(firestore, 'users', farm.hostId));
            const serverLink = userSnap.exists() ? userSnap.data()?.dungeonSettings?.serverLink : null;
            const customMessage = farm.customMessage || 'O farm começou! Boa sorte!';
            const customTag = farm.customTag || `${FARM_ROLE_PREFIX}${farm.raidName}`;
            
            let tempRole = null;
            try {
                const roleName = customTag.substring(0, 100);
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
                .setAuthor({ name: `Farm de ${hostDisplayName}`, iconURL: hostUser?.displayAvatarURL() })
                .setTitle(`✅ Farm Aberto: ${farm.raidName}`)
                .setDescription(customMessage);
             if (serverLink) {
                embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${serverLink})**` });
            }

            let messageContent = '';
            if (tempRole) {
                const baseLine = '───────────────────────────────';
                const totalWidth = baseLine.length;
                const mentionText = `${tempRole}`;
                const centralContentLength = tempRole.name.length + 2; 
                const paddingLength = Math.max(0, Math.floor((totalWidth - centralContentLength) / 2));
                const padding = '─'.repeat(paddingLength);
                messageContent = `${padding} ${mentionText} ${padding}`;
            } else {
                messageContent = farm.participants.map(id => `<@${id}>`).join(' ');
            }

            const messagePayload = {
                username: `${farm.raidName} Aberta`,
                embeds: [embed],
                content: messageContent,
            };

            const openAnnouncement = await webhookClient.send(messagePayload);

            // AGORA DELETA O FARM DO BANCO DE DADOS
            await deleteDoc(doc(firestore, 'scheduled_farms', farm.id));
            logger.info(`[farmAnnouncer] Anúncio de ABERTURA enviado para a raid ${farm.raidName}. Registro do farm removido do Firestore.`);
            
            // AGENDAMENTO PARA DELETAR O CARGO E A MENSAGEM
            if (tempRole) {
                setTimeout(async () => {
                    try {
                        const roleToDelete = await guild.roles.fetch(tempRole.id).catch(() => null);
                        if (roleToDelete) {
                            await roleToDelete.delete('Limpeza de cargo de farm temporário.');
                            logger.info(`[farmAnnouncer] Cargo temporário '${tempRole.name}' deletado após 1 minuto.`);
                        }
                    } catch (roleDeleteError) {
                        logger.error(`[farmAnnouncer] Falha ao deletar cargo temporário ${tempRole.id}:`, roleDeleteError);
                    }
                }, ROLE_LIFETIME_MS);
            }
            
            if (openAnnouncement) {
                 setTimeout(async () => {
                    try {
                        await webhookClient.deleteMessage(openAnnouncement.id);
                        logger.info(`[farmAnnouncer] Anúncio de farm '${openAnnouncement.id}' deletado após 30 minutos.`);
                    } catch (msgDeleteError) {
                        if (msgDeleteError.code !== 10008) { // Ignore 'Unknown Message'
                           logger.error(`[farmAnnouncer] Falha ao deletar anúncio de farm ${openAnnouncement.id}:`, msgDeleteError);
                        }
                    }
                }, ANNOUNCEMENT_LIFETIME_MS);
            }


            // Notificar seguidores
            const farmRaidValue = farm.raidName.toLowerCase().replace(/ /g, '_');
            const followersSnapshot = await getDocs(query(collection(firestore, 'users'), where('following', 'array-contains', farm.hostId)));
            followersSnapshot.forEach(async (followerDoc) => {
                const followerData = followerDoc.data();
                const followerPrefs = followerData.notificationPrefs || {};
                const hostSettings = followerPrefs.hostSettings?.[farm.hostId] || {};

                if(followerPrefs.dmEnabled !== false && hostSettings.notifyFarms !== false) {
                    const followerUser = await client.users.fetch(followerDoc.id).catch(() => null);
                    if(followerUser) {
                        try {
                             await followerUser.send(`🔔 O host **${hostDisplayName}** que você segue iniciou um farm de **${farm.raidName}**! [Clique aqui para ver o anúncio](${openAnnouncement.url})`);
                        } catch(e) {
                            logger.warn(`Não foi possível enviar DM para o seguidor ${followerUser.tag}`);
                        }
                    }
                }
            });

             // Notificar interessados na raid
            const raidInterestQuery = query(collection(firestore, 'users'), where('notificationPrefs.farmInterests', 'array-contains', farmRaidValue));
            const interestedUsersSnap = await getDocs(raidInterestQuery);

            interestedUsersSnap.forEach(async (doc) => {
                const interestedUserId = doc.id;
                if (interestedUserId === farm.hostId || followersSnapshot.docs.some(d => d.id === interestedUserId)) return;
                
                const prefs = doc.data().notificationPrefs || {};
                if (prefs.dmEnabled !== false) {
                    const user = await client.users.fetch(interestedUserId).catch(()=>null);
                    if(user){
                        try {
                            await user.send(`🔔 Um novo farm para **${farm.raidName}**, uma raid de seu interesse, foi criado por **${hostDisplayName}**! [Clique aqui para ver o anúncio](${openAnnouncement.url})`);
                        } catch(e) {
                            logger.warn(`Não foi possível notificar ${user.tag} sobre o farm de interesse.`);
                        }
                    }
                }
            });
        }
    }
}

export const name = 'farmAnnouncer';
export const schedule = '*/20 * * * * *'; // A cada 20 segundos

export async function run(container) {
    const { logger, services } = container;
    const { firestore } = services.firebase;
    
    try {
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
        
        const q = query(collection(firestore, 'scheduled_farms'), where("dayOfWeek", "==", currentDay));
        const snapshot = await getDocs(q);
        const farmsToday = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        await handleAnnouncements(container, farmsToday);

    } catch (error) {
        logger.error('[farmAnnouncer] Erro ao executar o job de anúncios de farm:', error);
    }
}
