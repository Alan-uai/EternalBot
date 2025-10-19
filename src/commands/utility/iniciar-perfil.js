// src/commands/utility/iniciar-perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const CUSTOM_ID_PREFIX = 'iniciar-perfil';
const BUTTON_ID = `${CUSTOM_ID_PREFIX}_abrir`;
const MODAL_ID = `${CUSTOM_ID_PREFIX}_modal`;

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
                .setCustomId(BUTTON_ID)
                .setLabel('Abrir Formulário de Perfil')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

    await interaction.reply({
        content: '**Bem-vindo ao Guia Eterno!**\n\nClique no botão abaixo para preencher ou atualizar as informações do seu perfil de jogador no Anime Eternal.',
        components: [row],
        ephemeral: true, // Apenas o usuário que digitou o comando vê isso
    });
}

async function handleInteraction(interaction) {
    if (interaction.isButton() && interaction.customId === BUTTON_ID) {
        await handleOpenFormButton(interaction);
    } else if (interaction.isModalSubmit() && interaction.customId === MODAL_ID) {
        await handleFormSubmit(interaction);
    }
}

async function handleOpenFormButton(interaction) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', interaction.user.id);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const modal = new ModalBuilder()
        .setCustomId(MODAL_ID)
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
    
    await updateDoc(userRef, profileData);

    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    let userChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName);

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
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ],
            });
             await userChannel.send(`Bem-vindo ao seu canal de perfil, <@${user.id}>! Suas informações foram salvas.`);

        } catch (error) {
            console.error("Falha ao criar canal privado:", error);
            return interaction.editReply('Seu perfil foi atualizado, mas houve um erro ao criar seu canal privado. Por favor, contate um administrador.');
        }
    }
    
    const confirmationMessage = `**Suas estatísticas foram atualizadas com sucesso!**

- **Mundo Atual:** ${profileData.currentWorld}
- **Rank:** ${profileData.rank}
- **Dano Total (DPS):** ${profileData.dps}
- **Energia Atual (Acumulada):** ${profileData.totalEnergy}
- **Ganho de Energia (por clique):** ${profileData.energyPerClick}
`;
    await userChannel.send(confirmationMessage);

    await interaction.editReply(`Seu perfil foi atualizado com sucesso! Veja as informações no seu canal privado: <#${userChannel.id}>`);
}

export { handleInteraction };
