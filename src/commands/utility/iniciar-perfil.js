// src/commands/utility/iniciar-perfil.js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionsBitField } from 'discord.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
        .setLabel("Qual é o seu mundo atual?")
        .setPlaceholder("Ex: Mundo 19 - Ilha do Inferno")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.currentWorld || '')
        .setRequired(true);

    const rankInput = new TextInputBuilder()
        .setCustomId('rank')
        .setLabel("Qual é o seu Rank?")
        .setPlaceholder("Ex: 125")
        .setStyle(TextInputStyle.Short)
        .setValue(userData.rank || '')
        .setRequired(true);
    
    const petsInput = new TextInputBuilder()
        .setCustomId('pets')
        .setLabel("Quais são seus melhores PETS equipados?")
        .setPlaceholder("Ex: 2x Phantom King, 1x Mythic Dragon")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(userData.pets || '')
        .setRequired(false);

    const aurasInput = new TextInputBuilder()
        .setCustomId('auras')
        .setLabel("Quais AURAS você tem equipadas?")
        .setPlaceholder("Ex: Aura do Imperador Vermelho, Aura da Folha")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(userData.auras || '')
        .setRequired(false);

    const powersInput = new TextInputBuilder()
        .setCustomId('powers')
        .setLabel("Quais PODERES (Gacha/Progressão) você usa?")
        .setPlaceholder("Ex: Super Saiyajin Blue, Poder do Pirata (Phantom)")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(userData.powers || '')
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(worldInput),
        new ActionRowBuilder().addComponents(rankInput),
        new ActionRowBuilder().addComponents(petsInput),
        new ActionRowBuilder().addComponents(aurasInput),
        new ActionRowBuilder().addComponents(powersInput),
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
        pets: interaction.fields.getTextInputValue('pets') || null,
        auras: interaction.fields.getTextInputValue('auras') || null,
        powers: interaction.fields.getTextInputValue('powers') || null,
        lastUpdated: serverTimestamp()
    };
    
    // Usando updateDoc para não sobrescrever o perfil inteiro
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
                        id: interaction.guild.roles.everyone, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                        deny: [PermissionsBitField.Flags.SendMessages] // Usuário não pode enviar mensagens
                    },
                    {
                        id: interaction.client.user.id, // O Bot
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                ],
            });
             await userChannel.send(`Bem-vindo ao seu perfil, <@${user.id}>! Suas informações foram atualizadas.`);

        } catch (error) {
            console.error("Falha ao criar canal privado:", error);
            return interaction.editReply('Seu perfil foi atualizado, mas houve um erro ao criar seu canal privado. Por favor, contate um administrador.');
        }
    }
    
    // Envia a confirmação no canal privado do usuário
     const confirmationMessage = `**Suas informações foram salvas com sucesso!**

- **Mundo:** ${profileData.currentWorld}
- **Rank:** ${profileData.rank}
- **Pets:** ${profileData.pets || 'Não informado'}
- **Auras:** ${profileData.auras || 'Não informado'}
- **Poderes:** ${profileData.powers || 'Não informado'}
`;
    await userChannel.send(confirmationMessage);

    await interaction.editReply(`Seu perfil foi atualizado com sucesso! Veja as informações no seu canal privado: <#${userChannel.id}>`);
}

// Exportar handleInteraction para ser usado no bot.js
export { handleInteraction };
