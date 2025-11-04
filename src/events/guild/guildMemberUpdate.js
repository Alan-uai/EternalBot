// src/events/guild/guildMemberUpdate.js
import { Events } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

async function getRobloxIdFromUsername(username, logger) {
    if (!username) return null;
    try {
        const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
            "usernames": [username],
            "excludeBannedUsers": true
        });
        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0].id;
        }
    } catch (error) {
        logger.error(`Erro ao buscar ID do Roblox para o usuário ${username}:`, error.response ? error.response.data : error.message);
    }
    return null;
}

export const name = Events.GuildMemberUpdate;

export async function execute(oldMember, newMember) {
    const { services, config, logger } = newMember.client.container;
    const { firestore } = services.firebase;

    const hadVerifiedRole = oldMember.roles.cache.has(config.VERIFIED_ROLE_ID);
    const hasVerifiedRole = newMember.roles.cache.has(config.VERIFIED_ROLE_ID);

    // --- Lógica para Cargo de Verificado (Bloxlink) ---
    if (!hadVerifiedRole && hasVerifiedRole) {
        logger.info(`Usuário ${newMember.user.tag} recebeu o cargo de verificado. Processando perfil no banco de dados...`);
        const userRef = doc(firestore, 'users', newMember.id);
        const userSnap = await getDoc(userRef);

        // Extrair nome de usuário Roblox
        const displayName = newMember.displayName;
        const match = displayName.match(/@(\w+)/);
        const robloxUsername = match ? match[1] : null;
        const robloxId = await getRobloxIdFromUsername(robloxUsername, logger);

        const profileData = {
            id: newMember.id,
            username: newMember.user.username,
            robloxId: robloxId || null,
        };

        if (userSnap.exists()) {
            // Atualiza o perfil existente com o ID do Roblox se não tiver
            if (!userSnap.data().robloxId && robloxId) {
                try {
                    await updateDoc(userRef, { robloxId: robloxId });
                    logger.info(`ID do Roblox (${robloxId}) adicionado ao perfil existente de ${newMember.user.tag}.`);
                } catch (error) {
                    logger.error(`Falha ao atualizar o perfil de ${newMember.id} com o ID do Roblox:`, error);
                }
            }
        } else {
            // Cria um novo perfil se não existir
            try {
                const newUserProfile = {
                    ...profileData,
                    email: null,
                    reputationPoints: 0,
                    credits: 0,
                    createdAt: serverTimestamp(),
                };
                await setDoc(userRef, newUserProfile);
                logger.info(`Perfil criado automaticamente no DB para o usuário verificado: ${newMember.user.tag} (Roblox ID: ${robloxId || 'não encontrado'})`);
            } catch (error) {
                logger.error(`Falha ao criar perfil automático no DB para ${newMember.id}:`, error);
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
