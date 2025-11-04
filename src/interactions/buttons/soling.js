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
    // Adicionar outros prefixos conforme necessário
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
        // Garante que o avatar esteja atualizado
        if (webhook.avatarURL() !== avatarUrl) {
            await webhook.edit({ avatar: avatarUrl });
        }
    }
    return webhook;
}

// Função para criar/atualizar o Embed de Status
function createStatusEmbed(requestData, hostUser) {
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
    
    embed.addFields({ name: '➡️ Entrar no Jogo', value: `**[Clique aqui para ir para o jogo](${GAME_LINK})**` });
    
    return embed;
}


async function handleTypeSelection(interaction, type) {
    try {
        await interaction.deferUpdate();
        const raids = getAvailableRaids();
        if (raids.length === 0) {
            return interaction.followUp({ content: 'Não há raids disponíveis para selecionar no momento.', components: [], ephemeral: true });
        }
        const raidMenu = new StringSelectMenuBuilder()
            .setCustomId(`soling_raid_${type}`)
            .setPlaceholder('Selecione a raid desejada...')
            .addOptions(raids.slice(0, 25)); // Limite de 25 opções

        const row = new ActionRowBuilder().addComponents(raidMenu);

        await interaction.editReply({
            content: 'Agora, selecione a raid:',
            components: [row],
        });
    } catch(error) {
        console.error('Erro em handleTypeSelection:', error);
         await interaction.followUp({ content: 'Ocorreu um erro ao selecionar o tipo.', ephemeral: true }).catch(console.error);
    }
}

async function handleRaidSelection(interaction, type) {
     try {
        const { firestore } = initializeFirebase();
        const selectedRaidValue = interaction.values[0];
        const raids = getAvailableRaids();
        const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
             await interaction.reply({ content: 'Você precisa criar um perfil com o comando `/perfil` antes de usar esta função.', ephemeral: true, components: []});
             return;
        }

        const userData = userSnap.data();
        const dungeonSettings = userData.dungeonSettings || {};
        
        interaction.client.container.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel, robloxId: userData.robloxId || null });
        
        await handlePostRequest(interaction, {
            serverLink: dungeonSettings.serverLink,
            alwaysSend: dungeonSettings.alwaysSendLink,
            deleteAfter: dungeonSettings.deleteAfterMinutes,
        });

    } catch(error) {
        console.error('Erro em handleRaidSelection:', error);
         try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Ocorreu um erro ao selecionar a raid.', ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Ocorreu um erro ao selecionar a raid.', ephemeral: true });
            }
        } catch (e) {
            console.error("Erro duplo em handleRaidSelection (followup):", e)
        }
    }
}


async function handlePostRequest(interaction, settings) {
    const replyOrFollowUp = async (options) => {
        // Se a interação veio de um menu, ela já foi deferida, então precisamos responder
        if (interaction.isStringSelectMenu()){
            return await interaction.update({ ...options, ephemeral: true });
        }
        if (interaction.replied || interaction.deferred) {
            return await interaction.followUp({ ...options, ephemeral: true });
        }
        return await interaction.reply({ ...options, ephemeral: true });
    };

    try {
        await interaction.deferUpdate();

        const { firestore } = initializeFirebase();
        const { assetService } = interaction.client.container.services;

        const tempData = interaction.client.container.interactions.get(`soling_temp_${interaction.user.id}`);
        if (!tempData) {
            return replyOrFollowUp({ content: 'Sua sessão expirou. Por favor, use o comando /soling novamente.', components: [] });
        }
        const { type, raid: raidNome, robloxId } = tempData;
        const { serverLink, alwaysSend, deleteAfter } = settings;
        const user = interaction.user;
        
        const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
        if (!solingChannel) {
            return replyOrFollowUp({ content: 'O canal de postagem de /soling não foi encontrado.', components: [] });
        }
        
        // Obter avatar da raid
        const assetPrefix = RAID_AVATAR_PREFIXES[raidNome] || 'Easy';
        const raidAvatarUrl = await assetService.getAsset(assetPrefix);
        
        const webhook = await getOrCreateWebhook(solingChannel, raidNome, raidAvatarUrl);
        if (!webhook) {
             return replyOrFollowUp({ content: 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.', components: [] });
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

        const userRef = doc(firestore, 'users', user.id);
        const newSettings = { serverLink: serverLink || null, alwaysSendLink: alwaysSend, deleteAfterMinutes: deleteAfter || null };
        batch.set(userRef, { dungeonSettings: newSettings }, { merge: true });
        
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
            serverLink: (alwaysSend && serverLink) ? serverLink : null,
            webhookUrl: webhook.url, // Salva a URL do webhook usado
        };
        
        let messageContent = '';
        if (type === 'help') {
            messageContent = `Buscando ajuda para solar a **${raidNome}**, ficarei grato com quem puder ajudar.`;
        } else { // hosting
            messageContent = `Solando a **${raidNome}** para quem precisar.`;
        }

        const statusEmbed = createStatusEmbed(newRequestData, user);
        
        const webhookClient = new WebhookClient({ url: webhook.url });
        
        const confirmLabel = type === 'help' ? 'Vou Ajudar' : 'Vou Precisar';
        const confirmButton = new ButtonBuilder()
            .setCustomId(`soling_confirm_${newRequestId}_${user.id}`)
            .setLabel(confirmLabel)
            .setStyle(ButtonStyle.Success)
            .setEmoji('🤝');

        const finishButton = new ButtonBuilder()
            .setCustomId(`soling_finish_${newRequestId}_${user.id}`)
            .setLabel('Finalizar')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');
        
        const row = new ActionRowBuilder().addComponents(confirmButton, finishButton);

        if (robloxId) {
             const profileButton = new ButtonBuilder()
                .setLabel('Ver Perfil (Web)')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://www.roblox.com/users/${robloxId}/profile`);
            
            const copyIdButton = new ButtonBuilder()
                .setCustomId(`soling_copyid_${user.id}_${robloxId}`)
                .setLabel('Copiar ID')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(profileButton, copyIdButton);
        }

        const message = await webhookClient.send({
            content: messageContent,
            username: webhook.name,
            avatarURL: webhook.avatarURL(),
            embeds: [statusEmbed],
            components: [row],
            wait: true 
        });
        
        newRequestData.messageId = message.id;
        
        if (deleteAfter && message) {
            setTimeout(async () => {
                try {
                    await webhookClient.deleteMessage(message.id);
                    await updateDoc(newRequestRef, { status: 'closed' });
                } catch (e) {
                    console.warn(`Não foi possível apagar a mensagem agendada (ID: ${message.id}): ${e.message}`);
                }
            }, deleteAfter * 60 * 1000);
        }

        batch.set(newRequestRef, newRequestData);
        
        await batch.commit();
        
        await replyOrFollowUp({ content: 'Seu pedido foi postado com sucesso!', components: [] });

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
        
        if (interaction.user.id === ownerId) {
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
                return interaction.reply({ content: 'Este pedido de /soling não está mais ativo.', ephemeral: true });
            }
            const confirmedUsers = requestSnap.data().confirmedUsers || [];
            
            const hubEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Painel de Gerenciamento do Anúncio')
                .setDescription('Use os botões e menus abaixo para gerenciar os participantes do seu anúncio.');

            const manageMembersButton = new ButtonBuilder()
                .setCustomId(`soling_managemembers_${requestId}_${ownerId}`)
                .setLabel('Gerenciar Membros')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👥');
            
            const manualCountButton = new ButtonBuilder()
                .setCustomId(`soling_managermanual_${requestId}_${ownerId}`)
                .setLabel('Contagem Manual')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔢');

            const hubRow = new ActionRowBuilder().addComponents(manageMembersButton, manualCountButton);
            const components = [hubRow];
            
            await interaction.reply({ embeds: [hubEmbed], components, ephemeral: true });
            return;
        }

        await interaction.deferUpdate();
        const newUser = { userId: interaction.user.id, username: interaction.user.username };
        const requestSnap = await getDoc(requestRef);
        if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
             return interaction.followUp({ content: 'Este pedido de /soling não está mais ativo.', ephemeral: true });
        }

        const confirmedUsers = requestSnap.data()?.confirmedUsers || [];
        if (confirmedUsers.some(u => u.userId === newUser.userId)) {
            return interaction.followUp({ content: 'Você já confirmou sua presença.', ephemeral: true });
        }

        await updateDoc(requestRef, {
            confirmedUsers: arrayUnion(newUser)
        });

        const owner = await interaction.client.users.fetch(ownerId).catch(() => null);
        const updatedData = { ...requestSnap.data(), confirmedUsers: [...confirmedUsers, newUser] };
        const updatedEmbed = createStatusEmbed(updatedData, owner);
        await interaction.message.edit({ embeds: [updatedEmbed] });

        if (owner) {
            const ownerSettingsSnap = await getDoc(doc(firestore, 'users', ownerId));
            const sendDm = ownerSettingsSnap.data()?.dungeonSettings?.notificationsEnabled ?? true;
            if (sendDm) {
                try {
                    await owner.send(`🙋‍♂️ **${interaction.user.username}** confirmou presença no seu pedido de /soling para **${requestSnap.data().raidName}**!`);
                } catch (dmError) {
                    console.warn(`Não foi possível notificar ${owner.tag} por DM.`);
                }
            }
        }
        await interaction.followUp({ content: 'Sua presença foi confirmada! O anúncio foi atualizado.', ephemeral: true });
    
    } catch (error) {
         console.error("Erro em handleConfirm:", error);
         await interaction.followUp({ content: 'Ocorreu um erro ao confirmar presença.', ephemeral: true }).catch(console.error);
    }
}

async function handleManageMembers(interaction, requestId, ownerId) {
    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar esta função.', ephemeral: true });
    }

    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.reply({ content: 'Este anúncio não está mais ativo.', ephemeral: true });
    }

    const confirmedUsers = requestSnap.data().confirmedUsers || [];
    if (confirmedUsers.length === 0) {
        return interaction.reply({ content: 'Nenhum usuário confirmou presença para gerenciar.', ephemeral: true });
    }

    const toggleUserMenu = new StringSelectMenuBuilder()
        .setCustomId(`soling_managertoggle_${requestId}_${ownerId}`)
        .setPlaceholder('Confirmar/Desconfirmar um usuário')
        .addOptions(confirmedUsers.map(u => ({ label: u.username, value: u.userId, description: 'Clique para alternar a confirmação.' })));
    
    const viewProfileMenu = new StringSelectMenuBuilder()
        .setCustomId(`soling_managerprofile_${requestId}_${ownerId}`)
        .setPlaceholder('Visualizar perfil de um participante')
        .addOptions(confirmedUsers.map(u => ({ label: u.username, value: u.userId })));

    await interaction.reply({
        content: 'Selecione um usuário para gerenciar.',
        components: [
            new ActionRowBuilder().addComponents(toggleUserMenu),
            new ActionRowBuilder().addComponents(viewProfileMenu)
        ],
        ephemeral: true,
    });
}

async function openManualCountModal(interaction, requestId, ownerId) {
     if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar este botão.', ephemeral: true });
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

async function handleManualCountSubmit(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const count = parseInt(interaction.fields.getTextInputValue('count'), 10);
    const actionRaw = interaction.fields.getTextInputValue('action') || '';
    const action = actionRaw.trim().toUpperCase().charAt(0); // Pega 'A' ou 'R'

    if (isNaN(count) || count <= 0) {
        return interaction.editReply({ content: 'O número de membros deve ser um valor positivo.' });
    }
    if (action !== 'A' && action !== 'R') {
        return interaction.editReply({ content: "Ação inválida. Use 'Adicionar' (ou 'A') / 'Remover' (ou 'R')." });
    }

    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (requestSnap.exists() && requestSnap.data().status === 'active') {
        const currentManualCount = requestSnap.data().manualCount || 0;
        const newManualCount = action === 'A' ? currentManualCount + count : Math.max(0, currentManualCount - count);

        await updateDoc(requestRef, { manualCount: newManualCount });
        
        const webhookUrl = requestSnap.data().webhookUrl;
        const messageId = requestSnap.data().messageId;

        if (webhookUrl && messageId) {
            const webhookClient = new WebhookClient({ url: webhookUrl });
            const owner = await interaction.client.users.fetch(requestSnap.data().userId).catch(() => null);
            const updatedData = { ...requestSnap.data(), manualCount: newManualCount };
            const updatedEmbed = createStatusEmbed(updatedData, owner);
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

    const currentConfirmed = requestSnap.data().confirmedUsers || [];
    const userObject = currentConfirmed.find(u => u.userId === userIdToToggle);

    let newConfirmedList;
    let feedbackMessage;

    if (userObject) {
        await updateDoc(requestRef, { confirmedUsers: arrayRemove(userObject) });
        newConfirmedList = currentConfirmed.filter(u => u.userId !== userIdToToggle);
        feedbackMessage = `Usuário ${userObject.username} foi removido da lista de confirmados.`;
    } else {
        const userToAdd = { userId: userIdToToggle, username: (await interaction.client.users.fetch(userIdToToggle)).username };
        await updateDoc(requestRef, { confirmedUsers: arrayUnion(userToAdd) });
        newConfirmedList = [...currentConfirmed, userToAdd];
        feedbackMessage = `Usuário ${userToAdd.username} foi adicionado à lista de confirmados.`;
    }
    
    const webhookUrl = requestSnap.data().webhookUrl;
    const messageId = requestSnap.data().messageId;

    if(webhookUrl && messageId) {
        const webhookClient = new WebhookClient({ url: webhookUrl });
        const owner = await interaction.client.users.fetch(requestSnap.data().userId).catch(() => null);
        const updatedData = { ...requestSnap.data(), confirmedUsers: newConfirmedList };
        const updatedEmbed = createStatusEmbed(updatedData, owner);
        await webhookClient.editMessage(messageId, { embeds: [updatedEmbed] }).catch(e => console.error("Falha ao editar mensagem do webhook:", e));
    }

    await interaction.followUp({ content: feedbackMessage, ephemeral: true });
}

async function handleSelectUserProfile(interaction, requestId, ownerId) {
    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: 'Apenas o dono do anúncio pode usar esta função.', ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const selectedUserId = interaction.values[0];
    const userRef = doc(firestore, 'users', selectedUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return interaction.editReply({ content: `O usuário selecionado ainda não possui um perfil no Guia Eterno.` });
    }
    try {
        const userData = userSnap.data();
        const discordUser = await interaction.client.users.fetch(selectedUserId);
        const profileImage = await createProfileImage(userData, discordUser);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        await interaction.editReply({ files: [attachment] });
    } catch(e) {
        console.error("Erro ao mostrar perfil do usuário selecionado:", e);
        await interaction.editReply({ content: 'Ocorreu um erro ao gerar o perfil do usuário.' });
    }
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

async function handleCopyId(interaction, userId, robloxId) {
    if (interaction.user.id !== userId) {
        return interaction.reply({ content: 'Você não pode usar este botão.', ephemeral: true });
    }
    await interaction.reply({
        content: `O ID Roblox de ${interaction.message.interaction.user.username} é:\n\`\`\`${robloxId}\`\`\``,
        ephemeral: true,
    });
}


export async function handleInteraction(interaction, container) {
    try {
        const [command, action, ...params] = interaction.customId.split('_');
        
        if (command !== 'soling') return;

        if (interaction.isButton()) {
            if (action === 'type') {
                await handleTypeSelection(interaction, params[0]);
            } else if (action === 'confirm') {
                await handleConfirm(interaction, params[0], params[1]);
            } else if (action === 'finish') {
                await handleFinish(interaction, params[0], params[1]);
            } else if (action === 'copyid') {
                await handleCopyId(interaction, params[0], params[1]);
            } else if (action === 'managemembers') {
                await handleManageMembers(interaction, params[0], params[1]);
            } else if (action === 'managermanual') {
                await openManualCountModal(interaction, params[0], params[1]);
            }

        } else if (interaction.isStringSelectMenu()) {
            if (action === 'raid') {
                await handleRaidSelection(interaction, params[0]);
            } else if (action === 'managertoggle') {
                await handleToggleUserConfirmation(interaction, params[0], params[1]);
            } else if (action === 'managerprofile') {
                await handleSelectUserProfile(interaction, params[0], params[1]);
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
