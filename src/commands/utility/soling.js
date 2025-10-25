// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ChannelType } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion, deleteDoc, arrayRemove } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];
const SOLING_POST_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_NAME = 'Soling Bot';
const ADMIN_ROLE_ID = '1429318984716521483';

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

export async function execute(interaction) {
    if (!ALLOWED_CHANNEL_IDS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais designados de /soling, ajuda ou chat.`, ephemeral: true });
    }
    
    const initialButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('soling_type_help')
                .setEmoji('🙋‍♂️')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('soling_type_hosting')
                .setEmoji('👑')
                .setStyle(ButtonStyle.Success)
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
    await interaction.deferUpdate();

    const { firestore } = initializeFirebase();
    const selectedRaidValue = interaction.values[0];
    const raids = getAvailableRaids();
    const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

    interaction.client.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel });
    
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const dungeonSettings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

    if (dungeonSettings.alwaysSendLink && dungeonSettings.serverLink) {
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
        await interaction.showModal(modal);
    }
}

async function handleModalSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const serverLink = interaction.fields.getTextInputValue('server_link');
    const alwaysSendStr = interaction.fields.getTextInputValue('always_send').toLowerCase();
    const deleteAfterStr = interaction.fields.getTextInputValue('delete_after');

    if (alwaysSendStr !== 'sim' && alwaysSendStr !== 'não') {
        return interaction.editReply({ content: 'Valor inválido para "Sempre enviar o link?". Por favor, use "sim" ou "não".' });
    }
    
    const deleteAfter = parseInt(deleteAfterStr, 10);
    if (deleteAfterStr && (isNaN(deleteAfter) || deleteAfter <= 0)) {
        return interaction.editReply({ content: 'O tempo para apagar deve ser um número positivo de minutos.' });
    }
    
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

    const tempData = interaction.client.interactions.get(`soling_temp_${user.id}`);
    if (!tempData) {
        const replyContent = 'Sua sessão expirou. Por favor, use o comando /soling novamente.';
         return interaction.replied || interaction.deferred 
            ? interaction.followUp({ content: replyContent, ephemeral: true }) 
            : interaction.reply({ content: replyContent, ephemeral: true });
    }
    const { type, raid: raidName } = tempData;
    const { serverLink, alwaysSendLink, deleteAfterMinutes } = settings;
    
    const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
    if (!solingChannel) {
        const replyContent = 'O canal de postagem de /soling não foi encontrado.';
        return interaction.replied || interaction.deferred ? interaction.followUp({ content: replyContent, ephemeral: true }) : interaction.reply({ content: replyContent, ephemeral: true });
    }
    
    const webhook = await getOrCreateWebhook(solingChannel);
    if (!webhook) {
         const replyContent = 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.';
         return interaction.replied || interaction.deferred ? interaction.followUp({ content: replyContent, ephemeral: true }) : interaction.reply({ content: replyContent, ephemeral: true });
    }
    
    const requestsRef = collection(firestore, 'dungeon_requests');
    const q = query(requestsRef, where("userId", "==", user.id), where("status", "==", "active"));
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
        batch.delete(requestDoc.ref);
    }
    
    const userRef = doc(firestore, 'users', user.id);
    batch.set(userRef, { dungeonSettings: { serverLink, alwaysSendLink, deleteAfterMinutes } }, { merge: true });
    
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const guild = await interaction.client.guilds.fetch(interaction.guildId);
    const member = await guild.members.fetch(user.id);
    const nick = member.nickname;
    
    const newRequestRef = doc(collection(firestore, 'dungeon_requests'));
    const newRequestId = newRequestRef.id;
        
    const embed = new EmbedBuilder()
        .setColor(type === 'help' ? 0x3498DB : 0x2ECC71)
        .setTitle(`🏯 ${raidName}`)
        .setAuthor({ name: nick || user.username, iconURL: user.displayAvatarURL() })
        .setDescription(`**Jogadores na sala:** 1/10\n\n*Clique no olho (👁️) para manifestar interesse e entrar na lista de espera! O dono do anúncio confirmará sua entrada.*`)
        .setTimestamp();
    
    const webhookClient = new WebhookClient({ url: webhook.url });
    
    const confirmButton = new ButtonBuilder()
        .setCustomId(`soling_confirm_${newRequestId}`)
        .setEmoji('👁️')
        .setStyle(ButtonStyle.Primary);
    
    const webLink = userData.robloxId ? `https://www.roblox.com/users/${userData.robloxId}/profile` : 'https://www.roblox.com';
    const mobileLink = userData.robloxId ? `roblox://users/${userData.robloxId}/profile` : 'https://www.roblox.com';
    
    const webButton = new ButtonBuilder()
        .setEmoji('🖥️')
        .setStyle(ButtonStyle.Link)
        .setURL(webLink)
        .setDisabled(!userData.robloxId);

    const mobileButton = new ButtonBuilder()
        .setEmoji('📱')
        .setStyle(ButtonStyle.Link)
        .setURL(mobileLink)
        .setDisabled(!userData.robloxId);
        
    const joinButton = new ButtonBuilder()
         .setEmoji('🎮')
         .setStyle(ButtonStyle.Link)
         .setURL(serverLink || 'https://www.roblox.com/games/90462358603255/15-Min-Anime-Eternal')
         .setDisabled(!serverLink);

    const finishButton = new ButtonBuilder()
        .setCustomId(`soling_finish_${newRequestId}`)
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirmButton, webButton, mobileButton, joinButton, finishButton);
    
    const message = await webhookClient.send({
        username: nick || user.username,
        avatarURL: user.displayAvatarURL(),
        embeds: [embed],
        components: [row],
        wait: true 
    });
    
    if (deleteAfterMinutes && message) {
        setTimeout(() => {
            solingChannel.messages.delete(message.id)
                .catch(e => console.warn(`Não foi possível apagar a mensagem agendada (ID: ${message.id}): ${e.message}`));
            deleteDoc(newRequestRef).catch(console.error);
        }, deleteAfterMinutes * 60 * 1000);
    }

    const newRequestData = {
        id: newRequestId,
        userId: user.id,
        raidName: raidName,
        messageId: message.id,
        createdAt: serverTimestamp(),
        status: 'active',
        confirmedUsers: [] 
    };
    batch.set(newRequestRef, newRequestData);
    
    await batch.commit();
    
    const finalReply = 'Seu pedido foi postado com sucesso!';
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: finalReply, ephemeral: true });
    } else {
        await interaction.reply({ content: finalReply, ephemeral: true });
    }
    interaction.client.interactions.delete(`soling_temp_${user.id}`);
}

async function handleConfirm(interaction, requestId) {
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    
    await interaction.deferReply({ ephemeral: true });

    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
        return interaction.editReply({ content: 'Este pedido de soling não existe mais.' });
    }

    const requestData = requestSnap.data();
    const ownerId = requestData.userId;

    if (interaction.user.id === ownerId) {
        if (!requestData.confirmedUsers || requestData.confirmedUsers.length === 0) {
            return interaction.editReply({ content: 'Ninguém manifestou interesse ainda.' });
        }
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`soling_selectuser_${requestId}`)
            .setPlaceholder('Selecione um jogador para confirmar/remover')
            .addOptions(requestData.confirmedUsers.map(u => ({
                label: `${u.inGame ? '✅' : '❔'} ${u.username}`,
                description: `Clique para confirmar a entrada ou remover da contagem.`,
                value: u.userId
            })));
        
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.editReply({ content: 'Selecione um participante para gerenciar:', components: [row] });
    
    } else { 
        const newUser = { userId: interaction.user.id, username: interaction.user.username, inGame: false };
        
        if (requestData.confirmedUsers.some(u => u.userId === newUser.userId)) {
             await interaction.editReply({ content: 'Você já está na lista de interessados.' });
             return;
        }

        await updateDoc(requestRef, {
            confirmedUsers: arrayUnion(newUser)
        });

        await interaction.editReply({ content: 'Seu interesse foi registrado! O líder do grupo irá confirmar sua entrada na sala.' });
    }
}

async function handleSelectUser(interaction, requestId) {
    await interaction.deferUpdate();
    
    const { firestore } = initializeFirebase();
    const selectedUserId = interaction.values[0];
    const requestRef = doc(firestore, 'dungeon_requests', requestId);

    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) {
        return interaction.followUp({ content: 'Este anúncio não existe mais.', ephemeral: true });
    }

    const requestData = requestSnap.data();
    let confirmedUsers = requestData.confirmedUsers || [];
    const userIndex = confirmedUsers.findIndex(u => u.userId === selectedUserId);

    if (userIndex === -1) {
        return interaction.followUp({ content: 'Usuário não encontrado na lista.', ephemeral: true });
    }

    // Alternar o status 'inGame'
    confirmedUsers[userIndex].inGame = !confirmedUsers[userIndex].inGame;

    await updateDoc(requestRef, { confirmedUsers: confirmedUsers });
    
    const inGameCount = confirmedUsers.filter(u => u.inGame).length + 1; // +1 for the owner
    const originalEmbed = interaction.message.embeds[0];
    const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setDescription(`**Jogadores na sala:** ${inGameCount}/10\n\n*Clique no olho (👁️) para manifestar interesse e entrar na lista de espera! O dono do anúncio confirmará sua entrada.*`);

    await interaction.message.edit({ embeds: [updatedEmbed] });

    // Atualiza o menu para o dono
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`soling_selectuser_${requestId}`)
        .setPlaceholder('Selecione um jogador para confirmar/remover')
        .addOptions(confirmedUsers.map(u => ({
            label: `${u.inGame ? '✅' : '❔'} ${u.username}`,
            description: `Clique para confirmar a entrada ou remover da contagem.`,
            value: u.userId
        })));
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.followUp({ content: `Status de ${confirmedUsers[userIndex].username} atualizado. Contagem: ${inGameCount}/10`, components: [row], ephemeral: true });
    
    // Verifica se atingiu o limite
    if (inGameCount >= 10) {
        await interaction.followUp({ content: 'Grupo cheio! O anúncio será fechado automaticamente.', ephemeral: true });
        await handleFinish(interaction, requestId, true); // Pass a flag to indicate auto-close
    }
}


async function handleFinish(interaction, requestId, autoClosed = false) {
    const { firestore } = initializeFirebase();
    const requestRef = doc(firestore, 'dungeon_requests', requestId);
    
    if(!autoClosed) {
        await interaction.deferReply({ ephemeral: true });
    }

    const requestSnap = await getDoc(requestRef);
    if(!requestSnap.exists()) {
        if(!autoClosed) await interaction.editReply({ content: 'Este anúncio não existe mais ou já foi finalizado.' });
        return;
    }
    
    const ownerId = requestSnap.data().userId;
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const isOwner = interaction.user.id === ownerId;
    const isModerator = member.roles.cache.has(ADMIN_ROLE_ID);

    if (!isOwner && !isModerator && !autoClosed) {
        return interaction.editReply({ content: 'Apenas o dono do anúncio ou um moderador pode finalizá-lo.' });
    }
    
    await deleteDoc(requestRef);
    
    try {
        await interaction.message.delete();
        if(!autoClosed) await interaction.editReply({ content: 'Anúncio finalizado e removido com sucesso.'});
    } catch (e) {
        console.warn(`Não foi possível deletar a mensagem (ID: ${interaction.message.id}), pode já ter sido removida.`);
        if(!autoClosed) await interaction.editReply({ content: 'Anúncio finalizado, mas não foi possível remover a mensagem (pode já ter sido apagada).'});
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
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true });
            } catch (e) {
                console.error("Falha no reply do erro de interação:", e);
            }
        } else {
             await interaction.followUp({ content: 'Ocorreu um erro ao processar sua ação.', ephemeral: true }).catch(e => {
                console.error("Falha no followup do erro de interação:", e.message);
           });
        }
    }
}
