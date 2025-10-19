// src/commands/utility/iniciar-perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const CUSTOM_ID_PREFIX = 'iniciar-perfil';
const FORM_BUTTON_ID = `${CUSTOM_ID_PREFIX}_abrir`;
const IMPORT_BUTTON_ID = `${CUSTOM_ID_PREFIX}_importar`;
const FORM_MODAL_ID = `${CUSTOM_ID_PREFIX}_modal`;
const IMPORT_MODAL_ID = `${CUSTOM_ID_PREFIX}_importar_modal`;

const INVENTORY_CATEGORIES = [
    { id: 'armas', name: 'Armas', emoji: '⚔️' },
    { id: 'poderes', name: 'Poderes', emoji: '⚡' },
    { id: 'pets', name: 'Pets', emoji: '🐾' },
    { id: 'acessorios', name: 'Acessórios', emoji: '🧢' },
    { id: 'auras', name: 'Auras', emoji: '✨' },
    { id: 'gamepasses', name: 'Gamepasses', emoji: '🎟️' },
    { id: 'sombras', name: 'Sombras', emoji: '👤' },
    { id: 'stands', name: 'Stands', emoji: '🕺' }
];

export const data = new SlashCommandBuilder()
    .setName('iniciar-perfil')
    .setDescription('Inicia o processo de criação e atualização de perfil de jogador.');

export async function execute(interaction) {
    if (interaction.channelId !== FORMULARIO_CHANNEL_ID) {
        return interaction.reply({ content: `Este comando só pode ser usado no canal <#${FORMULARIO_CHANNEL_ID}>.`, ephemeral: true });
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
        lastUpdated: serverTimestamp()
    };

    await setDoc(discordUserRef, profileDataToUpdate, { merge: true });

    const channel = await findOrCreateUserChannel(interaction, discordUser);
    if (!channel) {
         return interaction.editReply('Seu perfil foi importado, mas houve um erro ao criar seu canal privado. Por favor, contate um administrador.');
    }
    
    // Dispara a criação dos tópicos do inventário
    await createInventoryThreads(channel);
    
    const confirmationMessage = `**Perfil importado do site com sucesso!**

- **Mundo Atual:** ${profileDataToUpdate.currentWorld || 'N/D'}
- **Rank:** ${profileDataToUpdate.rank || 'N/D'}
- **Dano Total (DPS):** ${profileDataToUpdate.dps || 'N/D'}
- **Energia Atual (Acumulada):** ${profileDataToUpdate.totalEnergy || 'N/D'}
- **Ganho de Energia (por clique):** ${profileDataToUpdate.energyPerClick || 'N/D'}
`;
    await channel.send(confirmationMessage);

    await interaction.editReply(`Seu perfil foi importado com sucesso! Seus painéis de inventário foram criados nos tópicos do seu canal privado: <#${channel.id}>`);
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

    const energyInput = new TextInputBuilder()
        .setCustomId('totalEnergy')
        .setLabel("Energia Atual (Acumulada)")
        .setPlaceholder("Ex: 1.5sx")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.totalEnergy || '')
        .setRequired(true);

    const energyPerClickInput = new TextInputBuilder()
        .setCustomId('energyPerClick')
        .setLabel("Ganho de Energia (por clique)")
        .setPlaceholder("Ex: 87.04O")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.energyPerClick || '')
        .setRequired(true);

    modal.addComponents(
        new ActionRowBuilder().addComponents(worldInput),
        new ActionRowBuilder().addComponents(rankInput),
        new ActionRowBuilder().addComponents(dpsInput),
        new ActionRowBuilder().addComponents(energyInput),
        new ActionRowBuilder().addComponents(energyPerClickInput)
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
        energyPerClick: interaction.fields.getTextInputValue('energyPerClick'),
        lastUpdated: serverTimestamp()
    };
    
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
    
    // Dispara a criação dos tópicos do inventário
    await createInventoryThreads(channel);
    
    const confirmationMessage = `**Suas estatísticas foram atualizadas com sucesso!**

- **Mundo Atual:** ${profileData.currentWorld}
- **Rank:** ${profileData.rank}
- **Dano Total (DPS):** ${profileData.dps}
- **Energia Atual (Acumulada):** ${profileData.totalEnergy}
- **Ganho de Energia (por clique):** ${profileData.energyPerClick}
`;
    await channel.send(confirmationMessage);

    await interaction.editReply(`Seu perfil foi atualizado com sucesso! Seus painéis de inventário foram criados nos tópicos do seu canal privado: <#${channel.id}>`);
}

async function findOrCreateUserChannel(interaction, user) {
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    let userChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
        try {
            userChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
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

async function createInventoryThreads(channel) {
    const existingThreads = await channel.threads.fetch();
    const existingThreadNames = new Set(existingThreads.threads.map(t => t.name));

    for (const category of INVENTORY_CATEGORIES) {
        if (!existingThreadNames.has(category.name.toLowerCase())) {
            try {
                const thread = await channel.threads.create({
                    name: category.name.toLowerCase(),
                    autoArchiveDuration: 10080, // 7 dias
                    reason: `Tópico de inventário para ${category.name}`
                });

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

            } catch (error) {
                console.error(`Falha ao criar tópico para ${category.name}:`, error);
            }
        }
    }
}

export { handleInteraction };
