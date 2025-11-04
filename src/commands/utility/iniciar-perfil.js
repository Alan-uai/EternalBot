// src/commands/utility/iniciar-perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';
import { createProfileImage } from '../../utils/createProfileImage.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
const ALLOWED_CHANNELS = [FORMULARIO_CHANNEL_ID, COMMUNITY_HELP_CHANNEL_ID];

const CUSTOM_ID_PREFIX = 'iniciar-perfil';
const FORM_BUTTON_ID = `${CUSTOM_ID_PREFIX}_abrir`;
const IMPORT_BUTTON_ID = `${CUSTOM_ID_PREFIX}_importar`;
const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal`;
const IMPORT_MODAL_ID = `${CUSTOM_ID_PREFIX}_importar_modal`;
const DUNGEON_SETTINGS_BUTTON_ID = `dungeonconfig_soling_open`; // Alterado para corresponder ao novo comando
const DUNGEON_SETTINGS_MODAL_ID = `dungeonconfig_soling_modal`; // Alterado para corresponder ao novo comando
const PROFILE_CATEGORY_ID = '1426957344897761280'; // ID da Categoria "Perfis"

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

async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === FORM_BUTTON_ID) {
            await handleOpenFormButton(interaction);
        } else if (interaction.customId === IMPORT_BUTTON_ID) {
            await handleOpenImportModal(interaction);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === FORM_MODAL_ID) {
            await handleFormSubmit(interaction);
        } else if (interaction.customId === IMPORT_MODAL_ID) {
            await handleImportSubmit(interaction);
        }
    }
}

async function handleOpenImportModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId(IMPORT_MODAL_ID)
        .setTitle('Importar Perfil do Site');

    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel("E-mail da sua conta do site")
        .setPlaceholder("Ex: seuemail@gmail.com")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(emailInput));
    await interaction.showModal(modal);
}

async function handleImportSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const email = interaction.fields.getTextInputValue('email');
    const { firestore } = initializeFirebase();
    const discordUser = interaction.user;

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("email", "==", email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return interaction.editReply({ content: `Nenhum perfil encontrado no site com o e-mail \`${email}\`. Verifique o e-mail e tente novamente.`, ephemeral: true });
    }

    const webUserData = querySnapshot.docs[0].data();
    
    const discordUserRef = doc(firestore, 'users', discordUser.id);
    
    const profileDataToUpdate = {
        ...webUserData,
        id: discordUser.id, 
        username: discordUser.username,
        email: email, // Salva o e-mail usado para a importação
    };

    const userSnap = await getDoc(discordUserRef);
    if(userSnap.exists()) {
        await updateDoc(discordUserRef, { ...profileDataToUpdate, lastUpdated: serverTimestamp() });
    } else {
        await setDoc(discordUserRef, { ...profileDataToUpdate, createdAt: serverTimestamp() }, { merge: true });
    }


    const channel = await findOrCreateUserChannel(interaction, discordUser);
    if (!channel) {
         return interaction.editReply('Seu perfil foi importado, mas houve um erro ao criar seu canal privado. Por favor, contate um administrador.');
    }
    
    // Dispara a criação dos tópicos do inventário e atualização da imagem
    await createInventoryThreads(channel, { ...userSnap.data(), ...profileDataToUpdate }, discordUser);
    
    await interaction.editReply(`Seu perfil foi importado com sucesso! Seus painéis de inventário foram criados e atualizados nos tópicos do seu canal privado: <#${channel.id}>`);
}


async function handleOpenFormButton(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(FORM_MODAL_ID)
        .setTitle('Formulário de Perfil - Guia Eterno');

    const worldInput = new TextInputBuilder()
        .setCustomId('currentWorld')
        .setLabel("Mundo Atual")
        .setPlaceholder("Ex: 23")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.currentWorld || ''))
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId('rank')
        .setLabel("Seu Rank")
        .setPlaceholder("Ex: 115")
        .setStyle(TextInputStyle.Short)
        .setValue(String(userData.rank || ''))
        .setRequired(true);
    
    const dpsInput = new TextInputBuilder()
        .setCustomId('dps')
        .setLabel("Dano Total (DPS)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.dps || '')
        .setRequired(true);

    const birthdayInput = new TextInputBuilder()
        .setCustomId('birthday')
        .setLabel("Aniversário (DD/MM)")
        .setPlaceholder("Ex: 25/12. Opcional.")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.birthday ? userData.birthday.split('-').reverse().join('/') : '')
        .setRequired(false);

    const energyInput = new TextInputBuilder()
        .setCustomId('totalEnergy')
        .setLabel("Energia Atual (Acumulada)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.totalEnergy || '')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(worldInput),
        new ActionRowBuilder().addComponents(rankInput),
        new ActionRowBuilder().addComponents(dpsInput),
        new ActionRowBuilder().addComponents(energyInput),
        new ActionRowBuilder().addComponents(birthdayInput)
    );

    await interaction.showModal(modal);
}

async function handleFormSubmit(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const user = interaction.user;
    const userRef = doc(firestore, 'users', user.id);

    const profileData = {
        currentWorld: interaction.fields.getTextInputValue('currentWorld'),
        rank: interaction.fields.getTextInputValue('rank'),
        dps: interaction.fields.getTextInputValue('dps'),
        totalEnergy: interaction.fields.getTextInputValue('totalEnergy'),
        lastUpdated: serverTimestamp()
    };

    const birthdayValue = interaction.fields.getTextInputValue('birthday');
    if (birthdayValue) {
        const parts = birthdayValue.split(/[-/]/);
        if (parts.length === 2) {
            const [dia, mes] = parts;
            const date = new Date(2000, mes - 1, dia);
             if (date.getMonth() === parseInt(mes, 10) - 1 && date.getDate() === parseInt(dia, 10)) {
                profileData.birthday = `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`; // MM-DD
             } else {
                 return interaction.editReply('A data de aniversário fornecida é inválida. Use o formato DD/MM.');
             }
        } else if (birthdayValue.trim() !== '') {
            return interaction.editReply('Formato de data de aniversário inválido. Use DD/MM.');
        }
    }
    
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        await updateDoc(userRef, profileData);
    } else {
        await setDoc(userRef, { 
            ...profileData, 
            id: user.id, 
            username: user.username, 
            createdAt: serverTimestamp(),
            reputationPoints: 0,
            credits: 0
        });
    }

    const channel = await findOrCreateUserChannel(interaction, user);
    if (!channel) {
        return interaction.editReply('Seu perfil foi atualizado, mas houve um erro ao criar seu canal privado. Por favor, contate um administrador.');
    }
    
    // Dispara a criação/atualização dos tópicos do inventário e da imagem
    const updatedUserSnap = await getDoc(userRef);
    await createInventoryThreads(channel, updatedUserSnap.data(), user);
    
    await interaction.editReply(`Seu perfil foi atualizado com sucesso! Seus painéis de inventário foram criados e atualizados nos tópicos do seu canal privado: <#${channel.id}>`);
}

export async function openDungeonSettingsModal(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    const dungeonSettings = userData.dungeonSettings || {};

    const modal = new ModalBuilder()
        .setCustomId(DUNGEON_SETTINGS_MODAL_ID)
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



export async function findOrCreateUserChannel(interaction, user) {
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    let userChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
        try {
            userChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: PROFILE_CATEGORY_ID, // Adiciona o canal à categoria especificada
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages] // Usuário não pode digitar no canal principal
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
                    autoArchiveDuration: 10080, // 7 dias
                    reason: `Tópico de inventário para ${category.name}`
                });
            } catch (error) {
                console.error(`Falha ao criar tópico para ${category.name}:`, error);
                continue; // Pula para a próxima categoria se a criação do tópico falhar
            }
        }
        
        // Limpa mensagens antigas do bot no tópico para manter apenas a mais recente
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
                .setImage('https://via.placeholder.com/400x100/2f3136/2f3136.png'); // Placeholder

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

export { handleInteraction };
