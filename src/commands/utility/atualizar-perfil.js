// src/commands/utility/atualizar-perfil.js
import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { findOrCreateUserChannel, createInventoryThreads } from './iniciar-perfil.js';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const FORMULARIO_CHANNEL_ID = '1429260045371310200';
const COMMUNITY_HELP_CHANNEL_ID = '1426957344897761282';
const ALLOWED_CHANNELS = [FORMULARIO_CHANNEL_ID, COMMUNITY_HELP_CHANNEL_ID];

export const data = new SlashCommandBuilder()
    .setName('atualizar-perfil')
    .setDescription('Verifica e cria tópicos/painéis ausentes no seu canal de perfil.');

export async function execute(interaction) {
     if (!ALLOWED_CHANNELS.includes(interaction.channelId)) {
        return interaction.reply({ content: `Este comando só pode ser usado nos canais <#${FORMULARIO_CHANNEL_ID}> ou <#${COMMUNITY_HELP_CHANNEL_ID}>.`, ephemeral: true });
    }
    
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.user;
    const channelName = `perfil-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const userChannel = interaction.guild.channels.cache.find(ch => ch.name === channelName && ch.type === ChannelType.GuildText);

    if (!userChannel) {
        return interaction.editReply('Você não possui um canal de perfil. Use `/iniciar-perfil` primeiro.');
    }

    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
         return interaction.editReply('Não encontrei seus dados no banco de dados. Use `/iniciar-perfil` para criar seu perfil.');
    }

    try {
        await createInventoryThreads(userChannel, userSnap.data(), user);
        await interaction.editReply(`Seu perfil foi verificado e atualizado com sucesso em <#${userChannel.id}>!`);
    } catch (error) {
        console.error('Erro ao atualizar tópicos do perfil:', error);
        await interaction.editReply('Ocorreu um erro ao tentar atualizar os tópicos do seu perfil.');
    }
}
