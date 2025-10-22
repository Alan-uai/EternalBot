// src/commands/utility/atualizar-perfil.js
import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { findOrCreateUserChannel, createInventoryThreads } from './iniciar-perfil.js';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('atualizar-perfil')
    .setDescription('Verifica e cria tópicos/painéis ausentes no seu canal de perfil.');

export async function execute(interaction) {
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
