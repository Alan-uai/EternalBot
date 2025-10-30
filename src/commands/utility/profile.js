// src/commands/utility/profile.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Mostra suas estatísticas de jogador ou de outro usuário.')
    .addUserOption(option => 
        option.setName('usuario')
              .setDescription('O usuário do qual você quer ver o perfil.')
              .setRequired(false));

export async function execute(interaction) {
    const { firestore } = initializeFirebase();
    const targetUser = interaction.options.getUser('usuario') || interaction.user;

    await interaction.deferReply();

    const userRef = doc(firestore, 'users', targetUser.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const notFoundMessage = targetUser.id === interaction.user.id
            ? `Você ainda não tem um perfil. Use o comando /iniciar-perfil no canal de formulários.`
            : `O usuário ${targetUser.username} ainda não tem um perfil no Guia Eterno.`;
        await interaction.editReply(notFoundMessage);
        return;
    }

    const userData = userSnap.data();

    const creationDate = userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString('pt-BR') : 'Data não registrada';
    const birthday = userData.birthday ? userData.birthday.split('-').reverse().join('/') : 'Não informado';

    const embed = new EmbedBuilder()
      .setColor(0x4BC5FF)
      .setTitle(`Perfil de ${userData.username || targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Reputação', value: `\`${userData.reputationPoints || 0}\``, inline: true },
        { name: 'Créditos', value: `\`${userData.credits || 0}\``, inline: true },
        { name: 'Aniversário', value: `\`${birthday}\``, inline: true },
        { name: 'Mundo Atual', value: `\`${userData.currentWorld || 'N/D'}\``, inline: true },
        { name: 'Rank', value: `\`${userData.rank || 'N/D'}\``, inline: true },
        { name: 'Membro Desde', value: creationDate, inline: true },
        { name: '\u200B', value: '\u200B' }, // Linha em branco para espaçamento
        { name: 'Dano Total (DPS)', value: `\`${userData.dps || 'N/D'}\``, inline: false },
        { name: 'Energia Atual (Acumulada)', value: `\`${userData.totalEnergy || 'N/D'}\``, inline: false },
      )
      .setTimestamp()
      .setFooter({ text: `ID do Usuário: ${targetUser.id}` });
      
    await interaction.editReply({ embeds: [embed] });
};

async function handleInteraction(interaction) {
    // Esta função será para interações futuras no perfil, se necessário.
    await interaction.reply({ content: 'Interação de perfil recebida!', ephemeral: true });
}

export { handleInteraction };