// src/interactions/buttons/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ChannelType } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { getAvailableRaids } from '../../commands/utility/soling.js'; // Importa a função
import { createProfileImage } from '../../utils/createProfileImage.js';

export const customIdPrefix = 'soling';

const SOLING_POST_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_NAME = 'Soling Bot';
const ADMIN_ROLE_ID = '1429318984716521483';

async function getOrCreateWebhook(channel) {
    if (!channel || channel.type !== ChannelType.GuildText) return null;
    const webhooks = await channel.fetchWebhooks().catch(() => new Map());
    let webhook = webhooks.find(wh => wh.name === WEBHOOK_NAME && wh.owner.id === channel.client.user.id);

    if (!webhook) {
        try {
            webhook = await channel.createWebhook({
                name: WEBHOOK_NAME,
                avatar: channel.client.user.displayAvatarURL(),
                reason: 'Webhook para o sistema de /soling'
            });
            console.log(`Webhook '${WEBHOOK_NAME}' criado no canal ${channel.name}.`);
        } catch (error) {
            console.error("Erro ao criar o webhook:", error);
            return null;
        }
    }
    return webhook;
}

async function handleTypeSelection(interaction, type) {
    try {
        const raids = getAvailableRaids();
        const raidMenu = new StringSelectMenuBuilder()
            .setCustomId(`soling_raid_${type}`)
            .setPlaceholder('Selecione a raid desejada...')
            .addOptions(raids.slice(0, 25)); // Limite de 25 opções

        const row = new ActionRowBuilder().addComponents(raidMenu);

        await interaction.update({
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

        interaction.client.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel });
        
        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        const dungeonSettings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

        if (dungeonSettings.alwaysSendLink && dungeonSettings.serverLink) {
            await handlePostRequest(interaction, {
                serverLink: dungeonSettings.serverLink,
                alwaysSend: dungeonSettings.alwaysSendLink,
                deleteAfter: dungeonSettings.deleteAfterMinutes,
            });
        } else {
            const modal = new ModalBuilder()
                .setCustomId('soling_modal_submit')
                .setTitle(`Pedido para: ${selectedRaidLabel}`);
            
            const serverLinkInput = new TextInputBuilder()
                .setCustomId('server_link')
                .setLabel("Link do seu servidor privado (Opcional)")
                .setStyle(TextInputStyle.Short)
                .setValue(dungeonSettings.serverLink || '')
                .setRequired(false);

            const alwaysSendInput = new TextInputBuilder()
                .setCustomId('always_send')
                .setLabel("Sempre enviar o link acima? (sim/não)")
                .setStyle(TextInputStyle.Short)
                .setValue(dungeonSettings.alwaysSendLink ? 'sim' : 'não')
                .setRequired(true);

            const deleteAfterInput = new TextInputBuilder()
                .setCustomId('delete_after')
                .setLabel("Apagar post após X minutos (opcional)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Deixe em branco para não apagar")
                .setValue(String(dungeonSettings.deleteAfterMinutes || ''))
                .setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(serverLinkInput),
                new ActionRowBuilder().addComponents(alwaysSendInput),
                new ActionRowBuilder().addComponents(deleteAfterInput)
            );

            await interaction.showModal(modal);
        }
    } catch(error) {
        console.error('Erro em handleRaidSelection:', error);
         await interaction.followUp({ content: 'Ocorreu um erro ao selecionar a raid.', ephemeral: true }).catch(console.error);
    }
}

async function handleModalSubmit(interaction) {
    try {
        const serverLink = interaction.fields.getTextInputValue('server_link');
        const alwaysSendStr = interaction.fields.getTextInputValue('always_send').toLowerCase();
        const deleteAfterStr = interaction.fields.getTextInputValue('delete_after');

        if (alwaysSendStr !== 'sim' && alwaysSendStr !== 'não') {
            return interaction.reply({ content: 'Valor inválido para "Sempre enviar o link?". Por favor, use "sim" ou "não".', ephemeral: true });
        }
        
        const deleteAfter = parseInt(deleteAfterStr, 10);
        if (deleteAfterStr && (isNaN(deleteAfter) || deleteAfter <= 0)) {
            return interaction.reply({ content: 'O tempo para apagar deve ser um número positivo de minutos.', ephemeral: true });
        }
        
        await handlePostRequest(interaction, {
            serverLink,
            alwaysSend: alwaysSendStr === 'sim',
            deleteAfter: deleteAfter || null
        });

    } catch (error) {
        console.error("Erro em handleModalSubmit:", error);
    }
}

async function handlePostRequest(interaction, settings) {
    if (interaction.isModalSubmit()) {
         await interaction.deferReply({ ephemeral: true });
    }
    else if (interaction.isStringSelectMenu()) {
        await interaction.update({ content: 'Processando seu pedido...', components: [] });
    }

    try {
        const { firestore } = initializeFirebase();
        const tempData = interaction.client.interactions.get(`soling_temp_${interaction.user.id}`);
        if (!tempData) {
            return interaction.editReply({ content: 'Sua sessão expirou. Por favor, use o comando /soling novamente.' });
        }
        const { type, raid: raidNome } = tempData;
        const { serverLink, alwaysSend, deleteAfter } = settings;
        const user = interaction.user;
        
        const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
        if (!solingChannel) {
            return interaction.editReply({ content: 'O canal de postagem de /soling não foi encontrado.' });
        }
        
        const webhook = await getOrCreateWebhook(solingChannel);
        if (!webhook) {
             return interaction.editReply({ content: 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.' });
        }
        
        const requestsRef = collection(firestore, 'dungeon_requests');
        const q = query(requestsRef, where("userId", "==", user.id), where("status", "==", "active"), where("type", "==", type));
        const oldRequestsSnap = await getDocs(q);

        const batch = writeBatch(firestore);

        for (const requestDoc of oldRequestsSnap.docs) {
            const oldRequestData = requestDoc.data();
            try {
                const oldMessage = await solingChannel.messages.fetch(oldRequestData.messageId);
                await oldMessage.delete();
            } catch(e) {
                 console.warn(`Não foi possível deletar a mensagem antiga de /soling (ID: ${oldRequestData.messageId}). Pode já ter sido removida.`, e.message);
            }
            batch.update(requestDoc.ref, { status: 'closed' });
        }

        const userRef = doc(firestore, 'users', user.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const newSettings = { serverLink: serverLink || null, alwaysSendLink: alwaysSend, deleteAfterMinutes: deleteAfter || null };
        batch.set(userRef, { dungeonSettings: newSettings }, { merge: true });
        
        const newRequestRef = doc(collection(firestore, 'dungeon_requests'));
        const newRequestId = newRequestRef.id;

        let messageContent = '';
        if (type === 'help') {
            messageContent = `Buscando ajuda para solar a **${raidNome}**, ficarei grato com quem puder ajudar.`;
        } else { // hosting
            messageContent = `Solando a **${raidNome}** para quem precisar, só entrar pelo link.`;
        }

        if (alwaysSend && serverLink) {
            messageContent += `\n\n**Servidor:** ${serverLink}`;
        }
        
        const webhookClient = new WebhookClient({ url: webhook.url });
        
        const confirmLabel = type === 'help' ? 'Vou Ajudar' : 'Vou Precisar';
        const confirmButton = new ButtonBuilder()
            .setCustomId(`soling_confirm_${newRequestId}_${user.id}`)
            .setLabel(confirmLabel)
            .setStyle(ButtonStyle.Success)
            .setEmoji('1240836511391485982');

        const finishButton = new ButtonBuilder()
            .setCustomId(`soling_finish_${newRequestId}_${user.id}`)
            .setLabel('Finalizar')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');
        
        const row = new ActionRowBuilder().addComponents(confirmButton, finishButton);

        if (userData.robloxId) {
             const profileButton = new ButtonBuilder()
                .setLabel('Ver Perfil (Web)')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://www.roblox.com/users/${userData.robloxId}/profile`);
            
            const copyIdButton = new ButtonBuilder()
                .setCustomId(`soling_copyid_${user.id}_${userData.robloxId}`)
                .setLabel('Copiar ID')
                .setStyle(ButtonStyle.Secondary);

            row.addComponents(profileButton, copyIdButton);
        }

        const message = await webhookClient.send({
            content: messageContent,
            username: user.displayName,
            avatarURL: user.displayAvatarURL(),
            components: [row],
            wait: true 
        });
        
        if (deleteAfter && message) {
            setTimeout(() => {
                solingChannel.messages.delete(message.id)
                    .catch(e => console.warn(`Não foi possível apagar a mensagem agendada (ID: ${message.id}): ${e.message}`));
                updateDoc(newRequestRef, { status: 'closed' }).catch(console.error);
            }, deleteAfter * 60 * 1000);
        }

        const newRequestData = {
            id: newRequestId,
            userId: user.id,
            username: user.username,
            avatarUrl: user.displayAvatarURL(),
            type: type,
            raidName: raidNome,
            messageId: message.id,
            createdAt: serverTimestamp(),
            status: 'active',
            confirmedUsers: []
        };
        batch.set(newRequestRef, newRequestData);
        
        await batch.commit();
        
        await interaction.editReply({ content: 'Seu pedido foi postado com sucesso!' });
        interaction.client.interactions.delete(`soling_temp_${interaction.user.id}`);
    } catch(error) {
        console.error("Erro em handlePostRequest:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Ocorreu um erro ao postar seu pedido.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.followUp({ content: 'Ocorreu um erro ao postar seu pedido.', ephemeral: true }).catch(console.error);
        }
    }
}


async function handleConfirm(interaction, requestId, ownerId) {
    try {
        const { firestore } = initializeFirebase();
        const requestRef = doc(firestore, 'dungeon_requests', requestId);
        
        if (interaction.user.id === ownerId) {
            await interaction.deferReply({ ephemeral: true });
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists() || !requestSnap.data().confirmedUsers || requestSnap.data().confirmedUsers.length === 0) {
                return interaction.editReply({ content: 'Ninguém confirmou presença ainda.' });
            }
            
            const confirmedUsers = requestSnap.data().confirmedUsers;
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`soling_selectuser_${requestId}_${ownerId}`)
                .setPlaceholder('Selecione um usuário para ver o perfil')
                .addOptions(confirmedUsers.map(u => ({
                    label: u.username,
                    value: u.userId
                })));
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({ content: 'Selecione um participante para ver seus dados:', components: [row] });
        
        } else { 
            await interaction.deferUpdate();
            const newUser = { userId: interaction.user.id, username: interaction.user.username };
            await updateDoc(requestRef, {
                confirmedUsers: arrayUnion(newUser)
            });
            await interaction.followUp({ content: 'Sua presença foi confirmada! O líder do grupo foi notificado.', ephemeral: true });
        }
    } catch (error) {
         console.error("Erro em handleConfirm:", error);
         await interaction.followUp({ content: 'Ocorreu um erro ao confirmar presença.', ephemeral: true }).catch(console.error);
    }
}

async function handleSelectUser(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const { firestore } = initializeFirebase();
        const selectedUserId = interaction.values[0];
        const userRef = doc(firestore, 'users', selectedUserId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return interaction.editReply({ content: `O usuário selecionado ainda não possui um perfil no Guia Eterno.` });
        }

        const userData = userSnap.data();
        const discordUser = await interaction.client.users.fetch(selectedUserId);

        const profileImage = await createProfileImage(userData, discordUser);
        const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
        await interaction.editReply({ files: [attachment] });
    } catch (e) {
        console.error("Erro ao criar imagem de perfil no /soling (handleSelectUser):", e);
        await interaction.editReply({ content: 'Ocorreu um erro ao gerar a imagem de perfil do usuário.'});
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

        if (requestSnap.exists()) {
            await updateDoc(requestRef, { status: 'closed' });
            const messageId = requestSnap.data().messageId;
            const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID);
            const messageToDelete = await solingChannel.messages.fetch(messageId);
            await messageToDelete.delete();
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
            if (action === 'type') await handleTypeSelection(interaction, params[0]);
            else if (action === 'confirm') await handleConfirm(interaction, params[0], params[1]);
            else if (action === 'finish') await handleFinish(interaction, params[0], params[1]);
            else if (action === 'copyid') await handleCopyId(interaction, params[0], params[1]);
        } else if (interaction.isStringSelectMenu()) {
            if (action === 'raid') await handleRaidSelection(interaction, params[0]);
            else if (action === 'selectuser') await handleSelectUser(interaction);
        } else if (interaction.isModalSubmit()) {
            if (action === 'modal') await handleModalSubmit(interaction);
        }
    } catch (error) {
        console.error(`Erro no manipulador de interação de /soling (Ação: ${interaction.customId}):`, error);
         if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Ocorreu um erro ao processar esta ação.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.followUp({ content: 'Ocorreu um erro ao processar esta ação.', ephemeral: true }).catch(console.error);
        }
    }
}
