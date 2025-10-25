// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ChannelType } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';
import { createProfileImage } from '../../utils/createProfileImage.js';
import axios from 'axios';

const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];
const SOLING_POST_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_NAME = 'Soling Bot';
const ADMIN_ROLE_ID = '1429318984716521483';
const VERIFIED_ROLE_ID = '1429278854874140734';


// Função para encontrar ou criar o webhook necessário
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

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Procura ou oferece ajuda para solar raids.');

function getAvailableRaids() {
    const raids = new Set();
    
    // Raids do Lobby
    lobbyDungeonsArticle.tables.lobbySchedule.rows.forEach(raid => {
        raids.add(raid['Dificuldade']);
    });

    // Raids de Mundo
    raidRequirementsArticle.tables.requirements.rows.forEach(row => {
        Object.keys(row).forEach(key => {
            if (key !== 'Wave' && row[key] && !raids.has(key)) {
                raids.add(key);
            }
        });
    });

    return Array.from(raids).map(raidName => ({
        label: raidName,
        value: raidName.toLowerCase().replace(/ /g, '_'),
    }));
}


async function usernameToId(username) {
  try {
    const res = await axios.post('https://users.roblox.com/v1/usernames/users', {
        "usernames": [username],
        "excludeBannedUsers": true
    });
    return res.data?.data?.[0]?.id ?? null;
  } catch(e) {
      console.error("Erro ao buscar ID do Roblox:", e);
      return null;
  }
}

export async function execute(interaction) {
    if (!ALLOWED_CHANNEL_IDS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais designados de /soling, ajuda ou chat.`, ephemeral: true });
    }
    
    const initialButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('soling_type_help')
                .setLabel('Preciso de Ajuda')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🙋‍♂️'),
            new ButtonBuilder()
                .setCustomId('soling_type_hosting')
                .setLabel('Vou Solar (Hosting)')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👑')
        );

    await interaction.reply({
        content: 'O que você gostaria de fazer?',
        components: [initialButtons],
        ephemeral: true
    });
}

async function handleTypeSelection(interaction, type) {
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
}

async function handleRaidSelection(interaction, type) {
    const { firestore } = initializeFirebase();
    const selectedRaidValue = interaction.values[0];
    const raids = getAvailableRaids();
    const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

    // Armazenar temporariamente a escolha
    interaction.client.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel });
    
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const dungeonSettings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

    if (dungeonSettings.alwaysSendLink && dungeonSettings.serverLink) {
        // A interaction do menu de seleção precisa ser "reconhecida" antes de processar
        await interaction.update({ content: 'Processando seu pedido com as configurações salvas...', components: [] });
        await handlePostRequest(interaction, dungeonSettings);
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
        // A interaction do menu de seleção já foi usada para mostrar o modal
        await interaction.showModal(modal);
    }
}

async function handleModalSubmit(interaction) {
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
    
    // A interaction do modal precisa ser "reconhecida" antes de processar
    await interaction.deferReply({ ephemeral: true });
    
    const settings = {
        serverLink: serverLink || null,
        alwaysSendLink: alwaysSendStr === 'sim',
        deleteAfterMinutes: deleteAfter || null
    };

    await handlePostRequest(interaction, settings);
}

async function handlePostRequest(interaction, settings) {
    const { firestore } = initializeFirebase();
    const user = interaction.user;

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
         return interaction.editReply({ content: 'Não foi possível encontrar suas informações no servidor.', ephemeral: true });
    }

    const tempData = interaction.client.interactions.get(`soling_temp_${user.id}`);
    if (!tempData) {
        return interaction.editReply({ content: 'Sua sessão expirou. Por favor, use o comando /soling novamente.', ephemeral: true });
    }
    const { type, raid: raidName } = tempData;
    const { serverLink, alwaysSendLink, deleteAfterMinutes } = settings;
    
    const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
    if (!solingChannel) {
        return interaction.editReply({ content: 'O canal de postagem de /soling não foi encontrado.', ephemeral: true });
    }
    
    const webhook = await getOrCreateWebhook(solingChannel);
    if (!webhook) {
         return interaction.editReply({ content: 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.', ephemeral: true });
    }
    
    const requestsRef = collection(firestore, 'dungeon_requests');
    // Consulta por pedidos ativos DO MESMO TIPO.
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
    
    const nick = member.nickname || user.username;
    const match = nick.match(/(.*) \(@(.+)\)/);
    const displayName = match ? match[1].trim() : nick;
    const robloxUsername = match ? match[2] : null;

    let robloxId = null;
    if (robloxUsername && member.roles.cache.has(VERIFIED_ROLE_ID)) {
         robloxId = await usernameToId(robloxUsername);
    }
    
    const userRef = doc(firestore, 'users', user.id);
    batch.set(userRef, { dungeonSettings: { serverLink, alwaysSendLink, deleteAfterMinutes } }, { merge: true });

    const newRequestRef = doc(collection(firestore, 'dungeon_requests'));
    const newRequestId = newRequestRef.id;

    const authorText = robloxUsername ? `${displayName} (@${robloxUsername})` : `${displayName} (não verificado)`;
    
    const embed = new EmbedBuilder()
        .setColor(type === 'help' ? 0x3498DB : 0x2ECC71)
        .setTitle(`🏯 Sala: ${raidName}`)
        .setAuthor({ name: authorText, iconURL: user.displayAvatarURL() })
        .setDescription(`**Jogadores na sala:** 1/10\n\n*Clique no olho para confirmar presença e ver a lista de jogadores!*`)
        .setTimestamp();
    
    const webhookClient = new WebhookClient({ url: webhook.url });
    
    const confirmLabel = type === 'help' ? 'Vou Ajudar' : 'Vou Precisar';
    const confirmButton = new ButtonBuilder()
        .setCustomId(`soling_confirm_${newRequestId}`)
        .setLabel(confirmLabel)
        .setEmoji('👁️')
        .setStyle(ButtonStyle.Primary);

    const profileButton = new ButtonBuilder()
        .setCustomId(`soling_profile_${newRequestId}`)
        .setEmoji('👤')
        .setStyle(ButtonStyle.Secondary);
        
    const joinButton = new ButtonBuilder()
         .setCustomId(`soling_join_${newRequestId}`)
        .setEmoji('🎮')
        .setStyle(ButtonStyle.Secondary);

    const finishButton = new ButtonBuilder()
        .setCustomId(`soling_finish_${newRequestId}`)
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirmButton, profileButton, joinButton, finishButton);
    
    const message = await webhookClient.send({
        username: displayName,
        avatarURL: user.displayAvatarURL(),
        embeds: [embed],
        components: [row],
        wait: true 
    });
    
    if (deleteAfterMinutes && message) {
        setTimeout(() => {
            solingChannel.messages.delete(message.id)
                .catch(e => console.warn(`Não foi possível apagar a mensagem agendada (ID: ${message.id}): ${e.message}`));
            updateDoc(newRequestRef, { status: 'closed' }).catch(console.error);
        }, deleteAfterMinutes * 60 * 1000);
    }

    const newRequestData = {
        id: newRequestId,
        userId: user.id,
        username: displayName, // Salva o DisplayName
        robloxUsername: robloxUsername,
        robloxId: robloxId,
        avatarUrl: user.displayAvatarURL(),
        type: type,
        raidName: raidName,
        messageId: message.id,
        createdAt: serverTimestamp(),
        status: 'active',
        confirmedUsers: []
    };
    batch.set(newRequestRef, newRequestData);
    
    await batch.commit();
    
    // interaction.editReply já foi feito no handleModalSubmit ou handleRaidSelection
    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: 'Seu pedido foi postado com sucesso!' });
    } else {
        await interaction.reply({ content: 'Seu pedido foi postado com sucesso!', ephemeral: true });
    }
    interaction.client.interactions.delete(`soling_temp_${user.id}`);
}


async function handleConfirm(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.editReply({ content: 'Este pedido de soling não existe mais.' });
    }
    const requestData = requestSnap.data();
    const ownerId = requestData.userId;

    if (interaction.user.id === ownerId) {
        if (!requestData.confirmedUsers || requestData.confirmedUsers.length === 0) {
            return interaction.editReply({ content: 'Ninguém confirmou presença ainda.' });
        }
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`soling_selectuser_${requestId}`)
            .setPlaceholder('Selecione um usuário para ver o perfil')
            .addOptions(requestData.confirmedUsers.map(u => ({
                label: u.username,
                value: u.userId
            })));
        
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.editReply({ content: 'Selecione um participante para ver seus dados:', components: [row] });
    
    } else { 
        const newUser = { userId: interaction.user.id, username: interaction.user.username };
        
        if (requestData.confirmedUsers.some(u => u.userId === newUser.userId)) {
             await interaction.editReply({ content: 'Você já confirmou sua presença.' });
             return;
        }

        await updateDoc(requestRef, {
            confirmedUsers: arrayUnion(newUser)
        });

        // Atualiza o embed
        const updatedUsers = [...requestData.confirmedUsers, newUser];
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(originalEmbed)
            .setDescription(`**Jogadores na sala:** ${updatedUsers.length + 1}/10\n\n*Clique no olho para confirmar presença e ver a lista de jogadores!*`);
        await interaction.message.edit({ embeds: [updatedEmbed] });

        await interaction.editReply({ content: 'Sua presença foi confirmada! O líder do grupo foi notificado.' });
    }
}

async function handleProfile(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.editReply({ content: 'Este pedido de soling não existe mais.' });
    }

    const requestData = requestSnap.data();
    
    if (!requestData.robloxUsername || !requestData.robloxId) {
        return interaction.editReply({ content: '⚠️ O host não tem um perfil Roblox verificado ou o nome de usuário não pôde ser encontrado.' });
    }
    
    const webLink = `https://www.roblox.com/users/${requestData.robloxId}/profile`;
    const appLink = `roblox://users/${requestData.robloxId}/profile`;

    const profileRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Web').setStyle(ButtonStyle.Link).setURL(webLink),
        new ButtonBuilder().setLabel('Mobile').setStyle(ButtonStyle.Link).setURL(appLink)
    );
    await interaction.editReply({ content: `Clique para ver o perfil Roblox do host **${requestData.username} (@${requestData.robloxUsername})**:`, components: [profileRow] });

}

async function handleJoin(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists() || requestSnap.data().status !== 'active') {
        return interaction.editReply({ content: 'Este pedido de soling não existe mais.' });
    }

    const requestData = requestSnap.data();
    const userRef = doc(firestore, 'users', requestData.userId);
    const userSnap = await getDoc(userRef);

    const serverLink = userSnap.exists() ? userSnap.data().dungeonSettings?.serverLink : null;

    if (serverLink) {
        await interaction.editReply({ content: `**Link do Servidor Privado do Host:**\n${serverLink}` });
    } else {
        await interaction.editReply({ content: 'O host não forneceu um link de servidor privado.' });
    }
}


async function handleSelectUser(interaction, requestId) {
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
}

async function handleFinish(interaction, requestId) {
    await interaction.deferReply({ ephemeral: true });
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if(!requestSnap.exists() || requestSnap.data().status !== 'active') {
        await interaction.editReply({ content: 'Este anúncio não existe mais ou já foi finalizado.' });
        return;
    }
    
    const ownerId = requestSnap.data().userId;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isOwner = interaction.user.id === ownerId;
    const isModerator = member.roles.cache.has(ADMIN_ROLE_ID);

    if (!isOwner && !isModerator) {
        return interaction.editReply({ content: 'Apenas o dono do anúncio ou um moderador pode finalizá-lo.' });
    }
    
    await updateDoc(requestRef, { status: 'closed' });
    
    try {
        await interaction.message.delete();
        await interaction.editReply({ content: 'Anúncio finalizado com sucesso.'});
    } catch (e) {
        console.warn(`Não foi possível deletar a mensagem (ID: ${interaction.message.id}), pode já ter sido removida.`);
        await interaction.editReply({ content: 'Anúncio finalizado, mas não foi possível remover a mensagem (pode já ter sido apagada).'});
    }
}


export async function handleInteraction(interaction) {
    try {
        const [command, action, ...params] = interaction.customId.split('_');
        if (command !== 'soling') return;

        if (interaction.isButton()) {
            if (action === 'type') {
                await handleTypeSelection(interaction, params[0]);
            } else if (action === 'confirm') {
                await handleConfirm(interaction, params[0]);
            } else if (action === 'profile') {
                await handleProfile(interaction, params[0]);
            } else if (action === 'join') {
                await handleJoin(interaction, params[0]);
            } else if (action === 'finish') {
                await handleFinish(interaction, params[0]);
            }
        } else if (interaction.isStringSelectMenu()) {
            if (action === 'raid') {
                await handleRaidSelection(interaction, params[0]);
            } else if (action === 'selectuser') {
                await handleSelectUser(interaction, params[0]);
            }
        } else if (interaction.isModalSubmit()) {
            if (action === 'modal') {
                 await handleModalSubmit(interaction);
            }
        }
    } catch (error) {
        console.error(`Erro no manipulador de interação de /soling (ID: ${interaction.customId}):`, error);
        if (interaction.replied || interaction.deferred) {
           await interaction.followUp({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true }).catch(e => {
                if (e.code !== 10062) console.error("Falha no followup do erro de interação:", e.message);
           });
        } else {
             try {
                // A interaction pode ter expirado, então a resposta pode falhar.
                if (!interaction.isExpired()) {
                    await interaction.reply({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
                }
             } catch(e) {
                 if (e.code !== 10062 && e.message !== 'The reply to this interaction has not been sent or deferred.') {
                    console.error("Falha no reply do erro de interação:", e);
                 }
             }
        }
    }
}
