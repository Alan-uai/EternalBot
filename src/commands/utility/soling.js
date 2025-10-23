// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { lobbyDungeonsArticle } from '../../data/wiki-articles/lobby-dungeons.js';
import { raidRequirementsArticle } from '../../data/wiki-articles/raid-requirements.js';

const SOLING_CHANNEL_ID = '1429295597374144563';
const WEBHOOK_URL = process.env.SOLING_WEBHOOK_URL; // Certifique-se de adicionar esta variável ao seu .env

export const data = new SlashCommandBuilder()
    .setName('soling')
    .setDescription('Procura ou oferece ajuda para solar raids.');

function getAvailableRaids() {
    const raids = new Set();
    
    // Raids do Lobby
    lobbyDungeonsArticle.tables.lobbySchedule.rows.forEach(raid => {
        raids.add(raid['Dificuldade']);
    });

    // Raids dos Mundos (de outros artigos)
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
    if (!interaction.isModalSubmit() || interaction.customId !== 'soling_modal_submit') return;
    
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

    const { firestore } = initializeFirebase();
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
                // Tenta deletar a mensagem antiga postada pelo webhook
                await webhookClient.deleteMessage(oldRequestData.messageId);
            } catch (error) {
                // Se a mensagem não puder ser deletada pelo webhook (ex: permissões, já deletada), tenta pelo canal
                try {
                     const oldMessage = await solingChannel.messages.fetch(oldRequestData.messageId);
                     await oldMessage.delete();
                } catch(e) {
                     console.warn(`Não foi possível deletar a mensagem antiga de /soling (ID: ${oldRequestData.messageId}). Pode já ter sido removida.`, e.message);
                }
            }
            // Marca o documento antigo como fechado
            batch.update(requestDoc.ref, { status: 'closed' });
        }


        // 2. Salvar as configurações de dungeon atualizadas do usuário
        const userRef = doc(firestore, 'users', user.id);
        const alwaysSend = alwaysSendStr === 'sim';
        const settings = { serverLink: serverLink || null, alwaysSendLink: alwaysSend };
        batch.update(userRef, { dungeonSettings: settings });
        
        // 3. Criar e postar a nova mensagem
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
            wait: true // Essencial para obter o ID da mensagem criada
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
            status: 'active'
        };
        batch.set(newRequestRef, newRequestData);
        
        // 5. Executar todas as operações no banco de dados
        await batch.commit();

        await interaction.editReply({ content: 'Seu pedido foi postado com sucesso! Pedidos antigos foram removidos.' });

    } catch (error) {
        console.error('Erro no fluxo de /soling:', error);
        await interaction.editReply({ content: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.' });
    }
}

export { handleInteraction };
