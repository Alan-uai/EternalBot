// src/interactions/buttons/soling.js
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ChannelType } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../commands/utility/soling.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

export const customIdPrefix = 'soling';

const SOLING_POST_CHANNEL_ID = '1429295597374144563';
const ADMIN_ROLE_ID = '1429318984716521483';
const GAME_LINK = 'https://www.roblox.com/games/90462358603255/15-Min-Anime-Eternal';

const RAID_AVATAR_PREFIXES = {
    'Easy': 'Easy', 'Medium': 'Med', 'Hard': 'Hd', 'Insane': 'Isne',
    'Crazy': 'Czy', 'Nightmare': 'Mare', 'Leaf Raid (1800)': 'Lf'
};

async function getOrCreateWebhook(channel, webhookName, avatarUrl) {
    if (!channel || channel.type !== ChannelType.GuildText) return null;
    const webhooks = await channel.fetchWebhooks().catch(() => new Map());
    let webhook = webhooks.find(wh => wh.name === webhookName && wh.owner.id === channel.client.user.id);

    if (!webhook) {
        try {
            webhook = await channel.createWebhook({
                name: webhookName,
                avatar: avatarUrl,
                reason: `Webhook para o sistema de /soling para a raid ${webhookName}`
            });
            console.log(`Webhook '${webhookName}' criado no canal ${channel.name}.`);
        } catch (error) {
            console.error(`Erro ao criar o webhook '${webhookName}':`, error);
            return null;
        }
    } else {
        if (webhook.name !== webhookName || webhook.avatarURL() !== avatarUrl) {
            await webhook.edit({ name: webhookName, avatar: avatarUrl });
        }
    }
    return webhook;
}

function createStatusEmbed(requestData, hostUser, hostRobloxId) {
    const confirmedUsersList = requestData.confirmedUsers && requestData.confirmedUsers.length > 0
        ? requestData.confirmedUsers.map(u => `• <@${u.userId}>`).join('\n')
        : 'Ninguém confirmado ainda.';
    
    const totalMembers = (requestData.confirmedUsers?.length || 0) + (requestData.manualCount || 0);

    const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setAuthor({ name: `Anúncio de ${hostUser.username}`, iconURL: hostUser.displayAvatarURL() })
        .setTitle(`Painel de Status: ${requestData.raidName}`)
        .addFields(
            { name: '👥 Membros Confirmados', value: String(totalMembers), inline: true },
            { name: '🙋 Lista de Participantes', value: confirmedUsersList }
        )
        .setTimestamp();
    
    if (requestData.serverLink) {
        embed.addFields({ name: '🔗 Servidor Privado', value: `**[Clique aqui para entrar](${requestData.serverLink})**` });
    }

    if(hostRobloxId) {
         embed.addFields(
            { name: '➡️ Conexão Roblox', value: `**[Perfil de ${hostUser.username}](${`https://www.roblox.com/users/${hostRobloxId}/profile`})**` },
            { name: '🆔 ID Roblox', value: `\`${hostRobloxId}\`` }
        );
    }
    
    embed.addFields({ name: '➡️ Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${GAME_LINK})**` });
    
    return embed;
}

async function handleTypeSelection(interaction, type) {
    const replyOrFollowUp = async (options) => {
        const ephemeralOptions = { ...options, ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp(ephemeralOptions);
        }
        return await interaction.reply(ephemeralOptions);
    };

    try {
        await interaction.deferUpdate();
        const raids = getAvailableRaids();
        if (raids.length === 0) {
            return replyOrFollowUp({ content: 'Não há raids disponíveis para selecionar no momento.' });
        }
        const raidMenu = new StringSelectMenuBuilder()
            .setCustomId(`soling_raid_${type}`)
            .setPlaceholder('Selecione a raid desejada...')
            .addOptions(raids.slice(0, 25));

        const row = new ActionRowBuilder().addComponents(raidMenu);

        await interaction.followUp({
            content: 'Agora, selecione a raid:',
            components: [row],
            ephemeral: true,
        });
    } catch(error) {
        console.error('Erro em handleTypeSelection:', error);
        await replyOrFollowUp({ content: 'Ocorreu um erro ao selecionar o tipo.' }).catch(console.error);
    }
}

async function handleRaidSelection(interaction, type) {
    const replyOrFollowUp = async (options) => {
        const ephemeralOptions = { ...options, ephemeral: true, components: [] };
         if (interaction.replied || interaction.deferred) {
            return await interaction.followUp(ephemeralOptions);
        }
        return await interaction.reply(ephemeralOptions);
    };
    try {
        await interaction.deferUpdate();
        const { firestore } = initializeFirebase();
        const selectedRaidValue = interaction.values[0];
        const raids = getAvailableRaids();
        const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
             return replyOrFollowUp({ content: 'Você precisa criar um perfil com o comando `/perfil` antes de usar esta função.' });
        }

        const userData = userSnap.data();
        
        interaction.client.container.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel, robloxId: userData.robloxId || null });
        
        await handlePostRequest(interaction);

    } catch(error) {
        console.error('Erro em handleRaidSelection:', error);
        await replyOrFollowUp({ content: 'Ocorreu um erro ao selecionar a raid.' }).catch(console.error);
    }
}

async function handlePostRequest(interaction) {
    const replyOrFollowUp = async (options) => {
        const ephemeralOptions = { ...options, ephemeral: true, components: [] };
        // Interactions from a menu select must use followUp after deferUpdate
        if (interaction.isStringSelectMenu()) {
            return await interaction.followUp(ephemeralOptions);
        }
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp(ephemeralOptions);
        }
        return await interaction.reply(ephemeralOptions);
    };

    try {
        const { firestore } = initializeFirebase();
        const { assetService } = interaction.client.container.services;

        const tempData = interaction.client.container.interactions.get(`soling_temp_${interaction.user.id}`);
        if (!tempData) {
            return replyOrFollowUp({ content: 'Sua sessão expirou. Por favor, use o comando /soling novamente.' });
        }
        const { type, raid: raidNome, robloxId } = tempData;
        const user = interaction.user;
        
        const userSnap = await getDoc(doc(firestore, 'users', user.id));
        const dungeonSettings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};
        
        const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
        if (!solingChannel) {
            return replyOrFollowUp({ content: 'O canal de postagem de /soling não foi encontrado.' });
        }
        
        const assetPrefix = RAID_AVATAR_PREFIXES[raidNome] || 'Easy';
        const raidAvatarUrl = await assetService.getAsset(assetPrefix);
        
        const webhook = await getOrCreateWebhook(solingChannel, raidNome, raidAvatarUrl);
        if (!webhook) {
             return replyOrFollowUp({ content: 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.' });
        }
        
        const requestsRef = collection(firestore, 'dungeon_requests');
        const q = query(requestsRef, where("userId", "==", user.id), where("status", "==", "active"), where("type", "==", type));
        const oldRequestsSnap = await getDocs(q);

        const batch = writeBatch(firestore);

        for (const requestDoc of oldRequestsSnap.docs) {
            const oldRequestData = requestDoc.data();
            try {
                 if (oldRequestData.messageId && oldRequestData.webhookUrl) {
                    const oldWebhookClient = new WebhookClient({url: oldRequestData.webhookUrl});
                    await oldWebhookClient.deleteMessage(oldRequestData.messageId).catch(()=>{});
                }
            } catch(e) {
                 console.warn(`Não foi possível deletar a mensagem antiga de /soling (ID: ${oldRequestData.messageId}). Pode já ter sido removida.`, e.message);
            }
            batch.update(requestDoc.ref, { status: 'closed' });
        }
        
        const newRequestRef = doc(collection(firestore, 'dungeon_requests'));
        const newRequestId = newRequestRef.id;

        const newRequestData = {
            id: newRequestId,
            userId: user.id,
            username: user.username,
            avatarUrl: user.displayAvatarURL(),
            type: type,
            raidName: raidNome,
            createdAt: serverTimestamp(),
            status: 'active',
            confirmedUsers: [],
            manualCount: 0,
            serverLink: (dungeonSettings.alwaysSendLink && dungeonSettings.serverLink) ? dungeonSettings.serverLink : null,
            webhookUrl: webhook.url,
        };
        
        let messageContent = `Postado por <@${user.id}>`;
        
        const statusEmbed = createStatusEmbed(newRequestData, user, robloxId);
        
        const webhookClient = new WebhookClient({ url: webhook.url });
        
        const confirmLabel = type === 'help' ? 'Vou Ajudar' : 'Vou Precisar';
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`soling_confirm_${newRequestId}_${user.id}`)
                    .setLabel(confirmLabel)
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🤝'),
                new ButtonBuilder()
                    .setCustomId(`soling_manage_${newRequestId}_${user.id}`)
                    .setLabel('Gerenciar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚙️'),
                new ButtonBuilder()
                    .setCustomId(`soling_finish_${newRequestId}_${user.id}`)
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );
        
        const message = await webhookClient.send({
            content: messageContent,
            username: webhook.name,
            avatarURL: webhook.avatarURL(),
            embeds: [statusEmbed],
            components: [row],
            wait: true 
        });
        
        newRequestData.messageId = message.id;
        
        if (dungeonSettings.deleteAfterMinutes && message) {
            setTimeout(async () => {
                try {
                    await webhookClient.deleteMessage(message.id);
                    await updateDoc(newRequestRef, { status: 'closed' });
                } catch (e) {
                    console.warn(`Não foi possível apagar a mensagem agendada (ID: ${message.id}): ${e.message}`);
                }
            }, dungeonSettings.deleteAfterMinutes * 60 * 1000);
        }

        batch.set(newRequestRef, newRequestData);
        
        await batch.commit();
        
        await replyOrFollowUp({ content: 'Seu pedido foi postado com sucesso!' });

        interaction.client.container.interactions.delete(`soling_temp_${interaction.user.id}`);
    } catch(error) {
        console.error("Erro em handlePostRequest:", error);
        await replyOrFollowUp({ content: 'Ocorreu um erro ao postar seu pedido.' }).catch(console.error);
    }
}

async function handleConfirm(interaction, requestId, ownerId) {
    try {
        const { firestore } = initializeFirebase();
        const requestRef = doc(firestore, 'dungeon_requests', requestId);
        
        // Ação do dono: abrir menu para gerenciar lista
        if (interaction.user.id === ownerId) {
            await handleManageMembers(interaction, requestId, ownerId, true);
        } else {
             // Ação de usuário comum: confirmar presença
            await interaction.deferUpdate();
            const newUser = { userId: interaction.user.id, username: interaction.user.username };
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
                return interaction.followUp({ content: 'Este pedido de /soling não está mais ativo.', ephemeral: true });
            }

            const requestData = requestSnap.data();
            const confirmedUsers = requestData?.confirmedUsers || [];
            if (confirmedUsers.some(u => u.userId === newUser.userId)) {
                return interaction.followUp({ content: 'Você já confirmou sua presença.', ephemeral: true });
            }

            await updateDoc(requestRef, {
                confirmedUsers: arrayUnion(newUser)
            });

            const owner = await interaction.client.users.fetch(ownerId).catch(() => null);
            const userSnap = await getDoc(doc(firestore, 'users', ownerId));
            const robloxId = userSnap.exists() ? userSnap.data().robloxId : null;

            const updatedData = { ...requestData, confirmedUsers: [...confirmedUsers, newUser] };
            const updatedEmbed = createStatusEmbed(updatedData, owner, robloxId);
            await interaction.message.edit({ embeds: [updatedEmbed] });

            if (owner) {
                const ownerSettingsSnap = await getDoc(doc(firestore, 'users', ownerId));
                const sendDm = ownerSettingsSnap.data()?.dungeonSettings?.notificationsEnabled ?? true;
                if (sendDm) {
                    try {
                        await owner.send(`🙋‍♂️ **${interaction.user.username}** confirmou presença no seu pedido de /soling para **${requestData.raidName}**!`);
                    } catch (dmError) {
                        console.warn(`Não foi possível notificar ${owner.tag} por DM.`);
                    }
                }
            }
            await interaction.followUp({ content: 'Sua presença foi confirmada! O anúncio foi atualizado.', ephemeral: true });
        }
    
    } catch (error) {
         console.error("Erro em handleConfirm:", error);
         await interaction.followUp({ content: 'Ocorreu um erro ao confirmar presença.', ephemeral: true }).catch(console.error);
    }
}

async function handleOpenManagementModal(interaction, requestId, ownerId) {
    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar esta função.', ephemeral: true });
    }
    
    const modal = new ModalBuilder()
        .setCustomId(`soling_modalsubmitmanual_${requestId}`)
        .setTitle('Contagem Manual de Membros');

    const countInput = new TextInputBuilder()
        .setCustomId('count')
        .setLabel('Número de membros')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const actionInput = new TextInputBuilder()
        .setCustomId('action')
        .setLabel("Ação (Adicionar/Remover)")
        .setPlaceholder("Use 'Adicionar' ou 'A', 'Remover' ou 'R'")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(countInput), new ActionRowBuilder().addComponents(actionInput));
    await interaction.showModal(modal);
}

async function handleManageMembers(interaction, requestId, ownerId) {
    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar esta função.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.editReply({ content: 'Este anúncio não está mais ativo.' });
    }

    const confirmedUsers = requestSnap.data().confirmedUsers || [];
    if (confirmedUsers.length === 0) {
        return interaction.editReply({ content: 'Nenhum usuário confirmou presença para gerenciar.' });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`soling_managertoggle_${requestId}_${ownerId}`)
        .setPlaceholder('Remover um usuário da lista...')
        .addOptions(confirmedUsers.map(u => ({ label: u.username, value: u.userId })));

    await interaction.editReply({
        content: 'Selecione um usuário para remover da lista. Clicar em um usuário o removerá.',
        components: [new ActionRowBuilder().addComponents(selectMenu)],
        ephemeral: true,
    });
}

async function handleManualCountSubmit(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const countStr = interaction.fields.getTextInputValue('count');
    const actionRaw = interaction.fields.getTextInputValue('action') || '';
    
    const count = parseInt(countStr, 10);
    const action = actionRaw.trim().toUpperCase().charAt(0);

    if (isNaN(count) || count <= 0) {
        return interaction.editReply({ content: 'O número de membros deve ser um valor positivo.' });
    }
    if (action !== 'A' && action !== 'R') {
        return interaction.editReply({ content: "Ação inválida. Use 'Adicionar' (ou 'A') ou 'Remover' (ou 'R')." });
    }

    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists() && requestSnap.data().status === 'active') {
        const currentManualCount = requestSnap.data().manualCount || 0;
        const newManualCount = action === 'A' ? currentManualCount + count : Math.max(0, currentManualCount - count);

        await updateDoc(requestRef, { manualCount: newManualCount });
        
        const requestData = requestSnap.data();
        const webhookUrl = requestData.webhookUrl;
        const messageId = requestData.messageId;

        if (webhookUrl && messageId) {
            const webhookClient = new WebhookClient({ url: webhookUrl });
            const owner = await interaction.client.users.fetch(requestData.userId).catch(() => null);
            const userSnap = await getDoc(doc(firestore, 'users', requestData.userId));
            const robloxId = userSnap.exists() ? userSnap.data().robloxId : null;
            const updatedData = { ...requestSnap.data(), manualCount: newManualCount };
            const updatedEmbed = createStatusEmbed(updatedData, owner, robloxId);
            await webhookClient.editMessage(messageId, { embeds: [updatedEmbed] }).catch(e => console.error("Falha ao editar mensagem do webhook:", e));
        }

        await interaction.editReply({ content: `Contagem manual atualizada para ${newManualCount}.` });
    } else {
        await interaction.editReply({ content: 'O anúncio não está mais ativo.' });
    }
}


async function handleToggleUserConfirmation(interaction, requestId, ownerId) {
    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar esta função.', ephemeral: true });
    }
    await interaction.deferUpdate();
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const userIdToToggle = interaction.values[0];

    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.followUp({ content: 'Este anúncio não está mais ativo.', ephemeral: true });
    }

    const requestData = requestSnap.data();
    const currentConfirmed = requestData.confirmedUsers || [];
    const userObject = currentConfirmed.find(u => u.userId === userIdToToggle);

    let newConfirmedList;
    let replyMessage;

    if (userObject) {
        // Se o usuário está na lista, remove
        await updateDoc(requestRef, { confirmedUsers: arrayRemove(userObject) });
        newConfirmedList = currentConfirmed.filter(u => u.userId !== userIdToToggle);
        replyMessage = `Usuário ${userObject.username} foi removido da lista.`;
    } else {
        // Se o usuário não está na lista (isso não deveria acontecer com o fluxo atual, mas por segurança), adiciona
        const userToAdd = await interaction.client.users.fetch(userIdToToggle).catch(() => null);
        if (userToAdd) {
            const newUserObject = { userId: userToAdd.id, username: userToAdd.username };
            await updateDoc(requestRef, { confirmedUsers: arrayUnion(newUserObject) });
            newConfirmedList = [...currentConfirmed, newUserObject];
            replyMessage = `Usuário ${userToAdd.username} foi adicionado à lista.`;
        } else {
            return interaction.followUp({ content: 'Não foi possível encontrar o usuário para adicionar.', ephemeral: true });
        }
    }
    
    // Atualiza a mensagem do webhook
    const webhookUrl = requestData.webhookUrl;
    const messageId = requestData.messageId;

    if(webhookUrl && messageId) {
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const owner = await interaction.client.users.fetch(ownerId).catch(() => null);
        const userSnap = await getDoc(doc(firestore, 'users', ownerId));
        const robloxId = userSnap.exists() ? userSnap.data().robloxId : null;
        const updatedData = { ...requestData, confirmedUsers: newConfirmedList };
        const updatedEmbed = createStatusEmbed(updatedData, owner, robloxId);
        await webhookClient.editMessage(messageId, { embeds: [updatedEmbed] }).catch(e => console.error("Falha ao editar mensagem do webhook:", e));
    }

    await interaction.followUp({ content: replyMessage, ephemeral: true });
}

async function handleFinish(interaction, requestId, ownerId) {
    try {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const isOwner = interaction.user.id === ownerId;
        const isModerator = member.roles.cache.has(ADMIN_ROLE_ID);

        if (!isOwner && !isModerator) {
            return interaction.reply({ content: 'Apenas o dono do anúncio ou um moderador pode finalizá-lo.', ephemeral: true });
        }
        
        await interaction.deferUpdate();

        const { firestore } = initializeFirebase();
        const requestRef = doc(firestore, 'dungeon_requests', requestId);
        const requestSnap = await getDoc(requestRef);

        if (requestSnap.exists() && requestSnap.data().status === 'active') {
            await updateDoc(requestRef, { status: 'closed' });
            
            const messageId = requestSnap.data().messageId;
            const webhookUrl = requestSnap.data().webhookUrl;

            if (messageId && webhookUrl) {
                const webhookClient = new WebhookClient({ url: webhookUrl });
                await webhookClient.deleteMessage(messageId).catch(() => null);
            }
             await interaction.followUp({ content: 'Seu anúncio de /soling foi finalizado e removido.', ephemeral: true });
        } else {
             await interaction.followUp({ content: 'Este anúncio já foi finalizado.', ephemeral: true });
        }
    } catch(e) {
        console.warn(`Não foi possível finalizar o anúncio (Request ID: ${requestId}):`, e.message);
        await interaction.followUp({ content: 'Não foi possível encontrar ou remover o anúncio. Ele pode já ter sido removido.', ephemeral: true }).catch(console.error);
    }
}

export async function handleInteraction(interaction, container) {
    try {
        const [command, action, ...params] = interaction.customId.split('_');
        
        if (command !== 'soling') return;

        if (interaction.isButton()) {
            const requestId = params[0];
            const ownerId = params[1];

            if (action === 'type') {
                await handleTypeSelection(interaction, requestId); // requestId aqui é o 'type'
            } else if (action === 'confirm') {
                await handleConfirm(interaction, requestId, ownerId);
            } else if (action === 'finish') {
                await handleFinish(interaction, requestId, ownerId);
            } else if (action === 'manage') {
                await handleOpenManagementModal(interaction, requestId, ownerId);
            }

        } else if (interaction.isStringSelectMenu()) {
            const requestId = params[0];
            const ownerId = params[1];

            if (action === 'raid') {
                await handleRaidSelection(interaction, requestId); // requestId aqui é o 'type'
            } else if (action === 'managertoggle') {
                await handleToggleUserConfirmation(interaction, requestId, ownerId);
            }
            
        } else if (interaction.isModalSubmit()) {
            if (action === 'modalsubmitmanual') {
                await handleManualCountSubmit(interaction, params[0]);
            }
        }
    } catch (error) {
        console.error(`Erro no manipulador de interação de /soling (Ação: ${interaction.customId}):`, error);
         try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Ocorreu um erro ao processar esta ação.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Ocorreu um erro ao processar esta ação.', ephemeral: true });
            }
        } catch (e) {
            console.error("Falha ao enviar resposta de erro no manipulador de /soling:", e);
        }
    }
}
