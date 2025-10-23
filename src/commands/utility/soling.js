
// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, arrayUnion } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const SOLING_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_URL = process.env.SOLING_WEBHOOK_URL; 

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Procura ou oferece ajuda para solar raids.');

function getAvailableRaids() {
    const raids = new Set();
    
    lobbyDungeonsArticle.tables.lobbySchedule.rows.forEach(raid => {
        raids.add(raid['Dificuldade']);
    });

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
    if (interaction.channelId !== SOLING_CHANNEL_ID) {
        return interaction.reply({ content: `Este comando só pode ser usado no canal <#${SOLING_CHANNEL_ID}>.`, ephemeral: true });
    }
    
    if (!WEBHOOK_URL) {
        console.error("[ERRO] A URL do Webhook de /soling não está configurada no .env (SOLING_WEBHOOK_URL).");
        return interaction.reply({ content: 'Desculpe, este comando está temporariamente desativado por um problema de configuração.', ephemeral: true });
    }

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return interaction.reply({ content: 'Você precisa ter um perfil criado para usar este comando. Use `/iniciar-perfil`.', ephemeral: true });
    }

    const userData = userSnap.data();
    const dungeonSettings = userData.dungeonSettings || {};

    const modal = new ModalBuilder()
        .setCustomId('soling_modal_submit')
        .setTitle('Procurar/Oferecer Ajuda em Raid');

    const tipoInput = new TextInputBuilder()
        .setCustomId('tipo')
        .setLabel("Você está procurando AJUDA ou vai SOLAR?")
        .setPlaceholder('Digite "ajuda" ou "solar"')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
        
    const raidNomeInput = new TextInputBuilder()
        .setCustomId('raid')
        .setLabel("Qual o nome da Raid?")
        .setPlaceholder('Ex: Crazy, Leaf Raid, Green Planet Raid...')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

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
        new ActionRowBuilder().addComponents(tipoInput),
        new ActionRowBuilder().addComponents(raidNomeInput),
        new ActionRowBuilder().addComponents(serverLinkInput),
        new ActionRowBuilder().addComponents(alwaysSendInput)
    );

    await interaction.showModal(modal);
}

async function handleInteraction(interaction) {
    const { firestore } = initializeFirebase();
    
    // Handler para o modal principal de /soling
    if (interaction.isModalSubmit() && interaction.customId === 'soling_modal_submit') {
        await interaction.deferReply({ ephemeral: true });

        const tipo = interaction.fields.getTextInputValue('tipo').toLowerCase();
        const raidNome = interaction.fields.getTextInputValue('raid');
        const serverLink = interaction.fields.getTextInputValue('server_link');
        const alwaysSendStr = interaction.fields.getTextInputValue('always_send').toLowerCase();
        const user = interaction.user;

        if (tipo !== 'ajuda' && tipo !== 'solar') {
            return interaction.editReply({ content: 'Tipo de procura inválido. Por favor, digite "ajuda" ou "solar".' });
        }
        if (alwaysSendStr !== 'sim' && alwaysSendStr !== 'não') {
            return interaction.editReply({ content: 'Valor inválido para "Sempre enviar o link?". Por favor, use "sim" ou "não".' });
        }

        const webhookClient = new WebhookClient({ url: WEBHOOK_URL });

        try {
            // 1. Encontrar e fechar pedidos antigos
            const requestsRef = collection(firestore, 'dungeon_requests');
            const q = query(requestsRef, where("userId", "==", user.id), where("status", "==", "active"));
            const oldRequestsSnap = await getDocs(q);

            const batch = writeBatch(firestore);
            const solingChannel = await interaction.client.channels.fetch(SOLING_CHANNEL_ID);

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
            batch.update(userRef, { dungeonSettings: settings });
            
            // 3. Criar e postar a nova mensagem via Webhook
            let messageContent = '';
            let requestType = '';

            if (tipo === 'ajuda') {
                messageContent = `Buscando ajuda para solar a **${raidNome}**, ficarei grato com quem puder ajudar.`;
                requestType = 'help';
            } else { // solar
                messageContent = `Solando a **${raidNome}** para quem precisar, só entrar pelo link.`;
                requestType = 'hosting';
            }

            if (alwaysSend && serverLink) {
                messageContent += `\n\n**Servidor:** ${serverLink}`;
            }
            
            const message = await webhookClient.send({
                content: messageContent,
                username: user.displayName,
                avatarURL: user.displayAvatarURL(),
                wait: true 
            });

            // 4. Armazenar o novo pedido no Firestore
            const newRequestRef = doc(firestore, 'dungeon_requests', message.id);
            const newRequestData = {
                id: message.id,
                userId: user.id,
                username: user.username,
                avatarUrl: user.displayAvatarURL(),
                type: requestType,
                raidName: raidNome,
                messageId: message.id,
                createdAt: serverTimestamp(),
                status: 'active',
                confirmedUsers: []
            };
            batch.set(newRequestRef, newRequestData);
            
            // 5. Executar todas as operações no banco de dados
            await batch.commit();

            // 6. Editar a mensagem do webhook para adicionar o botão
            const confirmButton = new ButtonBuilder()
                .setCustomId(`soling_confirm_${message.id}_${user.id}`)
                .setLabel('Vou Ajudar')
                .setStyle(ButtonStyle.Success)
                .setEmoji('👁️');
            const row = new ActionRowBuilder().addComponents(confirmButton);

            await webhookClient.editMessage(message.id, {
                components: [row]
            });
            
            await interaction.editReply({ content: 'Seu pedido foi postado com sucesso! Pedidos antigos foram removidos.' });

        } catch (error) {
            console.error('Erro no fluxo de /soling:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.' });
        }
        return;
    }

    // Handler para os botões e menus de seleção do /soling
    if(interaction.customId.startsWith('soling_')) {
        const [_, action, messageId, ownerId] = interaction.customId.split('_');

        if (action === 'confirm') {
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

            const profileImage = await createProfileImage(userData, discordUser);
            const attachment = new AttachmentBuilder(profileImage, { name: 'profile-image.png' });

            await interaction.editReply({ files: [attachment] });
        }
    }
}

export { handleInteraction };
