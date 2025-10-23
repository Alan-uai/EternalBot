// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, ChannelType } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const ALLOWED_CHANNEL_IDS = ['1429295597374144563', '1426957344897761282', '1429309293076680744'];
const SOLING_POST_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_NAME = 'Soling Bot';

// Função para encontrar ou criar o webhook necessário
async function getOrCreateWebhook(channel) {
    const webhooks = await channel.fetchWebhooks();
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
    
    const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
     if (!solingChannel || solingChannel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: 'O canal de postagem para /soling não foi encontrado ou não é um canal de texto.', ephemeral: true });
    }

    const webhook = await getOrCreateWebhook(solingChannel);
    if (!webhook) {
        return interaction.reply({ content: 'Desculpe, este comando está temporariamente desativado por um problema de configuração do webhook. O administrador foi notificado.', ephemeral: true });
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

async function handleInteraction(interaction) {
    const { firestore } = initializeFirebase();
    const [command, action, ...params] = interaction.customId.split('_');

    if (command !== 'soling') return;

    if (action === 'type' && interaction.isButton()) {
        const type = params[0]; // 'help' or 'hosting'
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

    } else if (action === 'raid' && interaction.isStringSelectMenu()) {
        const type = params[0];
        const selectedRaidValue = interaction.values[0];
        const raids = getAvailableRaids();
        const selectedRaidLabel = raids.find(r => r.value === selectedRaidValue)?.label || selectedRaidValue;

        // Armazenar temporariamente a escolha
        interaction.client.interactions.set(`soling_temp_${interaction.user.id}`, { type, raid: selectedRaidLabel });
        
        // Buscar dados do usuário para pré-preencher
        const userRef = doc(firestore, 'users', interaction.user.id);
        const userSnap = await getDoc(userRef);
        const dungeonSettings = userSnap.exists() ? userSnap.data().dungeonSettings || {} : {};

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

        modal.addComponents(
            new ActionRowBuilder().addComponents(serverLinkInput),
            new ActionRowBuilder().addComponents(alwaysSendInput)
        );

        await interaction.showModal(modal);

    } else if (action === 'modal' && interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const tempData = interaction.client.interactions.get(`soling_temp_${interaction.user.id}`);
        if (!tempData) {
            return interaction.editReply({ content: 'Sua sessão expirou. Por favor, use o comando /soling novamente.' });
        }
        const { type, raid: raidNome } = tempData;

        const serverLink = interaction.fields.getTextInputValue('server_link');
        const alwaysSendStr = interaction.fields.getTextInputValue('always_send').toLowerCase();
        const user = interaction.user;

        if (alwaysSendStr !== 'sim' && alwaysSendStr !== 'não') {
            return interaction.editReply({ content: 'Valor inválido para "Sempre enviar o link?". Por favor, use "sim" ou "não".' });
        }
        
        const solingChannel = await interaction.client.channels.fetch(SOLING_POST_CHANNEL_ID).catch(() => null);
        if (!solingChannel) {
            return interaction.editReply({ content: 'O canal de postagem de /soling não foi encontrado.' });
        }
        
        const webhook = await getOrCreateWebhook(solingChannel);
        if (!webhook) {
             return interaction.editReply({ content: 'Não foi possível criar ou encontrar o webhook necessário para postar a mensagem.' });
        }
        const webhookClient = new WebhookClient({ url: webhook.url });


        try {
            // 1. Encontrar e fechar pedidos antigos
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
                batch.update(requestDoc.ref, { status: 'closed' });
            }

            // 2. Salvar as configurações de dungeon atualizadas do usuário
            const userRef = doc(firestore, 'users', user.id);
            const alwaysSend = alwaysSendStr === 'sim';
            const settings = { serverLink: serverLink || null, alwaysSendLink: alwaysSend };
            batch.set(userRef, { dungeonSettings: settings }, { merge: true });
            
            // 3. Criar e postar a nova mensagem via Webhook
            let messageContent = '';
            
            if (type === 'help') {
                messageContent = `Buscando ajuda para solar a **${raidNome}**, ficarei grato com quem puder ajudar.`;
            } else { // hosting
                messageContent = `Solando a **${raidNome}** para quem precisar, só entrar pelo link.`;
            }

            if (alwaysSend && serverLink) {
                messageContent += `\n\n**Servidor:** ${serverLink}`;
            }

            const confirmButton = new ButtonBuilder()
                .setCustomId(`soling_confirm_placeholder_${user.id}`) // Placeholder
                .setLabel('Vou Ajudar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👁️');
            const row = new ActionRowBuilder().addComponents(confirmButton);
            
            const message = await webhookClient.send({
                content: messageContent,
                username: user.displayName,
                avatarURL: user.displayAvatarURL(),
                components: [row],
                wait: true 
            });

            // 4. Armazenar o novo pedido no Firestore com o ID da mensagem real
            const newRequestRef = doc(firestore, 'dungeon_requests', message.id);
            const newRequestData = {
                id: message.id,
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
            
            // 5. Executar todas as operações no banco de dados
            await batch.commit();

            // 6. Atualizar o customId do botão na mensagem já postada
             const finalConfirmButton = new ButtonBuilder()
                .setCustomId(`soling_confirm_${message.id}_${user.id}`)
                .setLabel('Vou Ajudar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👁️');
            const finalRow = new ActionRowBuilder().addComponents(finalConfirmButton);

            await webhookClient.editMessage(message.id, {
                components: [finalRow]
            });
            
            await interaction.editReply({ content: 'Seu pedido foi postado com sucesso! Pedidos antigos foram removidos.' });
            interaction.client.interactions.delete(`soling_temp_${interaction.user.id}`); // Limpar dados temporários

        } catch (error) {
            console.error('Erro no fluxo de /soling:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.' });
        }
    } else if (action === 'confirm' && interaction.isButton()) {
        const messageId = params[0];
        const ownerId = params[1];
        
        const requestRef = doc(firestore, 'dungeon_requests', messageId);
        
        // Se o dono do post clicar
        if (interaction.user.id === ownerId) {
            const requestSnap = await getDoc(requestRef);
            if (!requestSnap.exists() || !requestSnap.data().confirmedUsers || requestSnap.data().confirmedUsers.length === 0) {
                return interaction.reply({ content: 'Ninguém confirmou presença ainda.', ephemeral: true });
            }
            
            const confirmedUsers = requestSnap.data().confirmedUsers;
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`soling_selectuser_${messageId}_${ownerId}`)
                .setPlaceholder('Selecione um usuário para ver o perfil')
                .addOptions(confirmedUsers.map(u => ({
                    label: u.username,
                    value: u.userId
                })));
            
            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: 'Selecione um participante para ver seus dados:', components: [row], ephemeral: true });
        
        } else { // Se outro usuário clicar
            await interaction.deferUpdate();
            const newUser = { userId: interaction.user.id, username: interaction.user.username };
            await updateDoc(requestRef, {
                confirmedUsers: arrayUnion(newUser)
            });
            await interaction.followUp({ content: 'Sua presença foi confirmada! O líder do grupo foi notificado.', ephemeral: true });
        }

    } else if (action === 'selectuser' && interaction.isStringSelectMenu()) {
        const selectedUserId = interaction.values[0];
        const userRef = doc(firestore, 'users', selectedUserId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return interaction.reply({ content: `O usuário selecionado ainda não possui um perfil no Guia Eterno.`, ephemeral: true });
        }

        const userData = userSnap.data();
        const discordUser = await interaction.client.users.fetch(selectedUserId);

        await interaction.deferReply({ ephemeral: true });

        try {
            const profileImage = await createProfileImage(userData, discordUser);
            const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });
            await interaction.editReply({ files: [attachment] });
        } catch (e) {
            console.error("Erro ao criar imagem de perfil no /soling:", e);
            await interaction.editReply({ content: 'Ocorreu um erro ao gerar a imagem de perfil do usuário.'});
        }
    }
}

export { handleInteraction };

    