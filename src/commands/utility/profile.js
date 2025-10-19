// src/commands/utility/profile.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Gerencia seu perfil de jogador.')
    .addUserOption(option => 
        option.setName('usuario')
              .setDescription('O usuário do qual você quer ver o perfil (deixe em branco para ver o seu).')
              .setRequired(false));

export async function execute(interaction) {
    const { firestore } = initializeFirebase();
    const targetUser = interaction.options.getUser('usuario') || interaction.user;

    await interaction.deferReply();

    const userRef = doc(firestore, 'users', targetUser.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        if (targetUser.id === interaction.user.id) {
            // Cria um perfil básico se for o próprio usuário e não tiver um
            const newUserProfile = {
                id: targetUser.id,
                username: targetUser.username,
                email: null, // O bot não tem acesso ao email por padrão
                reputationPoints: 0,
                credits: 0,
                createdAt: serverTimestamp(),
            };
            await setDoc(userRef, newUserProfile);
             const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Perfil de ${targetUser.username}`)
                .setDescription('Seu perfil foi criado! Você pode agora adicionar seus itens.')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields({ name: 'Pontos de Reputação', value: '0', inline: true })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });

        } else {
             await interaction.editReply(`O usuário ${targetUser.username} ainda não tem um perfil no Guia Eterno.`);
        }
        return;
    }

    const userData = userSnap.data();

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`Perfil de ${userData.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Pontos de Reputação', value: `${userData.reputationPoints || 0}`, inline: true },
        { name: 'Créditos', value: `${userData.credits || 0}`, inline: true },
        { name: 'Mundo Atual', value: `${userData.currentWorld || 'Não definido'}`, inline: true },
        { name: 'Rank', value: `${userData.rank || 'Não definido'}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `ID do Usuário: ${targetUser.id}` });
      
    await interaction.editReply({ embeds: [embed] });
};
