// src/events/guild/guildMemberUpdate.js
import { Events, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const name = Events.GuildMemberUpdate;

export async function execute(oldMember, newMember) {
    const { services, config, logger } = newMember.client.container;
    const { firestore } = services.firebase;

    // --- Lógica para Cargo de Verificado (Bloxlink) ---
    const hadVerifiedRole = oldMember.roles.cache.has(config.VERIFIED_ROLE_ID);
    const hasVerifiedRole = newMember.roles.cache.has(config.VERIFIED_ROLE_ID);

    if (!hadVerifiedRole && hasVerifiedRole) {
        const userRef = doc(firestore, 'users', newMember.id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            try {
                const newUserProfile = {
                    id: newMember.id,
                    username: newMember.user.username,
                    email: null,
                    reputationPoints: 0,
                    credits: 0,
                    createdAt: serverTimestamp(),
                };
                await setDoc(userRef, newUserProfile);
                logger.info(`Perfil criado automaticamente para o usuário verificado: ${newMember.user.tag} (${newMember.id})`);
            } catch (error) {
                logger.error(`Falha ao criar perfil automático para ${newMember.id}:`, error);
            }
        }
    }

    // --- Lógica para Cargo "ALL" de Raids ---
    const hadAllRaidsRole = oldMember.roles.cache.has(config.ALL_RAIDS_ROLE_ID);
    const hasAllRaidsRole = newMember.roles.cache.has(config.ALL_RAIDS_ROLE_ID);

    if (!hadAllRaidsRole && hasAllRaidsRole) {
        logger.info(`Usuário ${newMember.user.tag} recebeu o cargo ALL. Verificando e adicionando cargos de raid...`);
        const rolesToAdd = [];
        for (const roleId of config.RAID_NOTIFICATION_ROLES) {
            if (!newMember.roles.cache.has(roleId)) {
                rolesToAdd.push(roleId);
            }
        }

        if (rolesToAdd.length > 0) {
            try {
                await newMember.roles.add(rolesToAdd, 'Atribuição automática pelo cargo ALL Raids');
                logger.info(`Adicionados ${rolesToAdd.length} cargos de raid para ${newMember.user.tag}.`);
            } catch (error) {
                logger.error(`Falha ao adicionar cargos de raid para ${newMember.user.tag}:`, error);
            }
        }
    }
}
