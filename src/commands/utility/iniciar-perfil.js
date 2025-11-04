// src/commands/utility/iniciar-perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
const ALLOWED_CHANNELS = [FORMULARIO_CHANNEL_ID, COMMUNITY_HELP_CHANNEL_ID];

export const CUSTOM_ID_PREFIX = 'iniciar-perfil';
export const FORM_BUTTON_ID = `${CUSTOM_ID_PREFIX}_abrir`;
export const IMPORT_BUTTON_ID = `${CUSTOM_ID_PREFIX}_importar`;
export const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal`;
export const IMPORT_MODAL_ID = `${CUSTOM_ID_PREFIX}_importar_modal`;
const DUNGEON_SETTINGS_BUTTON_ID = `dungeonconfig_soling_open`;
export const PROFILE_CATEGORY_ID = '1426957344897761280';

export const INVENTORY_CATEGORIES = [
    { id: 'estatisticas', name: 'Estatísticas', emoji: '📊' },
    { id: 'armas', name: 'Armas', emoji: '⚔️' },
    { id: 'poderes', name: 'Poderes', emoji: '⚡' },
    { id: 'pets', name: 'Pets', emoji: '🐾' },
    { id: 'acessorios', name: 'Acessórios', emoji: '🧢' },
    { id: 'auras', name: 'Auras', emoji: '✨' },
    { id: 'gamepasses', name: 'Gamepasses', emoji: '🎟️' },
    { id: 'sombras', name: 'Sombras', emoji: '👤' },
    { id: 'stands', name: 'Stands', emoji: '🕺' },
    { id: 'configuracoes-dungeons', name: 'Configurações de Dungeons', emoji: '⚙️' },
    { id: 'notificacoes', name: 'Notificações', emoji: '🔔', isPrivate: true }
];

export const data = new SlashCommandBuilder()
    .setName('iniciar-perfil')
    .setDescription('Inicia o processo de criação e atualização de perfil de jogador.');

export async function execute(interaction) {
    if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais <#${FORMULARIO_CHANNEL_ID}> ou <#${COMMUNITY_HELP_CHANNEL_ID}>.`, ephemeral: true });
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(FORM_BUTTON_ID)
                .setLabel('Preencher Formulário')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝'),
            new ButtonBuilder()
                .setCustomId(IMPORT_BUTTON_ID)
                .setLabel('Importar do Site')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔄')
        );

    await interaction.reply({
        content: '**Bem-vindo ao Guia Eterno!**\n\n- Clique em **Preencher Formulário** para inserir ou atualizar suas informações manualmente.\n- Clique em **Importar do Site** para sincronizar seus dados usando o e-mail da sua conta do site.',
        components: [row],
        ephemeral: true,
    });
}

// Funções auxiliares que agora são exportadas para serem usadas pelo handler de interação
export async function findOrCreateUserChannel(interaction, user) {
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    let userChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
        try {
            userChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: PROFILE_CATEGORY_ID,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages]
                    },
                    {
                        id: interaction.client.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageThreads],
                    },
                ],
            });
             await userChannel.send(`Bem-vindo ao seu canal de perfil, <@${user.id}>! Suas informações foram salvas.`);

        } catch (error) {
            console.error("Falha ao criar canal privado:", error);
            return null;
        }
    }
    return userChannel;
}

export async function createInventoryThreads(channel, userData, discordUser) {
    const existingThreads = await channel.threads.fetch();
    const existingThreadNames = new Set(existingThreads.threads.map(t => t.name));

    for (const category of INVENTORY_CATEGORIES) {
        let thread = existingThreads.threads.find(t => t.name === category.name.toLowerCase());
        
        if (!thread) {
            try {
                 thread = await channel.threads.create({
                    name: category.name.toLowerCase(),
                    autoArchiveDuration: 10080,
                    reason: `Tópico de inventário para ${category.name}`
                });
            } catch (error) {
                console.error(`Falha ao criar tópico para ${category.name}:`, error);
                continue;
            }
        }
        
        const messages = await thread.messages.fetch({ limit: 50 });
        const botMessages = messages.filter(m => m.author.id === channel.client.user.id);
        if (botMessages.size > 0) {
            await thread.bulkDelete(botMessages).catch(err => console.log("Não foi possível apagar mensagens antigas, elas podem ter mais de 14 dias.", err.message));
        }

        if (category.id === 'estatisticas') {
            const imageBuffer = await createProfileImage(userData, discordUser);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'profile-stats.png' });
            await thread.send({ files: [attachment] });
        } else if (category.isPrivate) {
             const embed = new EmbedBuilder()
                .setColor(0x808080)
                .setTitle(`${category.emoji} ${category.name}`)
                .setDescription('Este é o seu feed de notificações sobre o bot.');
             await thread.send({ embeds: [embed] });
        } else if (category.id === 'configuracoes-dungeons') {
            const embed = new EmbedBuilder()
                .setColor(0x7289DA)
                .setTitle(`${category.emoji} ${category.name}`)
                .setDescription('Aqui você pode configurar as opções para o comando `/soling`.\n\nClique no botão abaixo para definir ou atualizar suas configurações.');

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(DUNGEON_SETTINGS_BUTTON_ID)
                    .setLabel('Configurar Soling')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔗')
            );
            await thread.send({ embeds: [embed], components: [actionRow] });
        } else {
            const embed = new EmbedBuilder()
                .setColor(0x4BC5FF)
                .setTitle(`${category.emoji} Gerenciador de ${category.name}`)
                .setDescription('Aqui você pode gerenciar seus itens equipados. A imagem acima exibirá seus itens.\n\nUse os botões abaixo para interagir.')
                .setImage('https://via.placeholder.com/400x100/2f3136/2f3136.png');

            const actionRow = new ActionRowBuilder();
            
            if (category.id === 'gamepasses' || category.id === 'auras') {
                actionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gerenciar_${category.id}_equipar`)
                        .setLabel('Equipar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('➕'),
                    new ButtonBuilder()
                        .setCustomId(`gerenciar_${category.id}_desequipar`)
                        .setLabel('Desequipar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('➖')
                );
            } else {
                actionRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`gerenciar_${category.id}_equipar`)
                        .setLabel('Equipar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('➕'),
                    new ButtonBuilder()
                        .setCustomId(`gerenciar_${category.id}_desequipar`)
                        .setLabel('Desequipar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('➖'),
                    new ButtonBuilder()
                        .setCustomId(`gerenciar_${category.id}_editar`)
                        .setLabel('Ver/Editar')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('✏️')
                );
            }
            
            await thread.send({ embeds: [embed], components: [actionRow] });
        }
    }
}

export async function openDungeonSettingsModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const dungeonSettings = userData.dungeonSettings || {};

    const modal = new ModalBuilder()
        .setCustomId(`dungeonconfig_soling_modal`) // ID do modal de configuração de dungeon
        .setTitle('Configurações de Dungeons');

    const serverLinkInput = new TextInputBuilder()
        .setCustomId('server_link')
        .setLabel("Link do seu servidor privado do Roblox")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("https://www.roblox.com/games/...")
        .setValue(dungeonSettings.serverLink || '')
        .setRequired(false);

    const alwaysSendInput = new TextInputBuilder()
        .setCustomId('always_send')
        .setLabel("Sempre enviar o link? (sim/não)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("sim ou não")
        .setValue(dungeonSettings.alwaysSendLink ? 'sim' : 'não')
        .setRequired(true);

    const deleteAfterInput = new TextInputBuilder()
        .setCustomId('delete_after')
        .setLabel("Apagar post após X minutos (opcional)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Deixe em branco para não apagar automaticamente")
        .setValue(String(dungeonSettings.deleteAfterMinutes || ''))
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(serverLinkInput),
        new ActionRowBuilder().addComponents(alwaysSendInput),
        new ActionRowBuilder().addComponents(deleteAfterInput)
    );

    await interaction.showModal(modal);
}
