// src/commands/utility/soling.js
import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, WebhookClient, StringSelectMenuBuilder } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

    const modal = new ModalBuilder()
        .setCustomId('soling_modal')
        .setTitle('Procurar/Oferecer Ajuda em Raid');

    const aProcuraDeInput = new StringSelectMenuBuilder()
        .setCustomId('procurando_tipo')
        .setPlaceholder('O que você está procurando?')
        .addOptions([
            { label: 'Ajuda para solar', value: 'ajuda' },
            { label: 'Solar para quem precisar', value: 'solar' },
        ]);

    const raidInput = new StringSelectMenuBuilder()
        .setCustomId('raid_nome')
        .setPlaceholder('Qual raid você vai fazer?')
        .addOptions(getAvailableRaids().slice(0, 25)); // Limite de 25 opções

    const firstActionRow = new ActionRowBuilder().addComponents(aProcuraDeInput);
    const secondActionRow = new ActionRowBuilder().addComponents(raidInput);

    // Modais não suportam menus de seleção diretamente. Precisamos de uma abordagem diferente.
    // Vamos usar um modal com campos de texto e instruir o usuário.
     const modalForReal = new ModalBuilder()
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

    modalForReal.addComponents(
        new ActionRowBuilder().addComponents(tipoInput),
        new ActionRowBuilder().addComponents(raidNomeInput)
    );

    await interaction.showModal(modalForReal);
}

async function handleInteraction(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== 'soling_modal_submit') return;
    
    await interaction.deferReply({ ephemeral: true });

    const tipo = interaction.fields.getTextInputValue('tipo').toLowerCase();
    const raidNome = interaction.fields.getTextInputValue('raid');
    const user = interaction.user;

    if (tipo !== 'ajuda' && tipo !== 'solar') {
        return interaction.editReply({ content: 'Tipo de procura inválido. Por favor, digite "ajuda" ou "solar".' });
    }

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return interaction.editReply({ content: 'Você precisa ter um perfil criado para usar este comando. Use `/iniciar-perfil`.' });
    }
    
    const userData = userSnap.data();
    const serverLink = userData.dungeonSettings?.serverLink;
    const alwaysSend = userData.dungeonSettings?.alwaysSendLink;

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

    const webhookClient = new WebhookClient({ url: WEBHOOK_URL });
    
    try {
        const message = await webhookClient.send({
            content: messageContent,
            username: user.displayName,
            avatarURL: user.displayAvatarURL(),
        });
        
        // Armazenar no Firestore
        const requestRef = doc(firestore, 'dungeon_requests', message.id);
        await setDoc(requestRef, {
            id: message.id,
            userId: user.id,
            username: user.username,
            avatarUrl: user.displayAvatarURL(),
            type: requestType,
            raidName: raidNome,
            messageId: message.id,
            createdAt: serverTimestamp(),
            status: 'active'
        });

        // Adicionar um botão para fechar o pedido (para o usuário que o criou)
        // Isso requer que o bot edite a mensagem do webhook, o que é possível.
        // Por simplicidade inicial, vamos deixar sem o botão de fechar.

        await interaction.editReply({ content: 'Seu pedido foi postado com sucesso!' });

    } catch (error) {
        console.error('Erro ao enviar webhook de /soling:', error);
        await interaction.editReply({ content: 'Ocorreu um erro ao postar seu pedido. Por favor, tente novamente.' });
    }
}

export { handleInteraction };

    