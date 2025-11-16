// src/commands/utility/perfil.js
import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

async function getOrCreateUserProfile(userId, username) {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    let userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUserProfile = {
            id: userId,
            username,
            reputationPoints: 0,
            credits: 0,
            createdAt: serverTimestamp(),
            following: [],
        };
        await setDoc(userRef, newUserProfile);
        userSnap = await getDoc(userRef);
    }
    return userSnap.data();
}

export const data = new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Exibe seu perfil de jogador, hosts seguidos e permite gerenciar o contexto da IA.')
    .addUserOption(option =>
        option.setName('usuario')
            .setDescription('Veja o perfil de outro usuário (opcional).')
            .setRequired(false));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const isSelf = targetUser.id === interaction.user.id;

    const userData = await getOrCreateUserProfile(targetUser.id, targetUser.username);

    const embed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle(`👤 Perfil de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
            { name: 'Rank', value: `\`${userData.rank || 'Não definido'}\``, inline: true },
            { name: 'Mundo', value: `\`${userData.currentWorld || 'Não definido'}\``, inline: true },
            { name: 'DPS', value: `\`${userData.dps || 'Não definido'}\``, inline: true },
            { name: 'Pontos de Reputação', value: `\`${userData.reputationPoints || 0}\``, inline: true },
            { name: 'Créditos', value: `\`${userData.credits || 0}\``, inline: true }
        );

    const followingList = userData.following || [];
    if (followingList.length > 0) {
        const followingMentions = followingList.map(id => `<@${id}>`).join(', ');
        embed.addFields({ name: 'Hosts Seguidos', value: followingMentions });
    } else if (isSelf) {
        embed.addFields({ name: 'Hosts Seguidos', value: 'Você não segue ninguém. Use `/seguir` para seguir um host.' });
    }

    const components = [];
    if (isSelf) {
        const useContext = userData.aiUseProfileContext === true;
        embed.addFields({ name: 'Uso de Contexto pela IA', value: `**${useContext ? 'Ativado' : 'Desativado'}**`, inline: true });
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('personalize_profile_update')
                .setLabel('Atualizar Dados')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId('personalize_profile_context_toggle')
                .setLabel(useContext ? 'Desativar Contexto' : 'Ativar Contexto')
                .setStyle(useContext ? ButtonStyle.Danger : ButtonStyle.Success)
        );
        components.push(row);
    } else {
        const selfData = await getOrCreateUserProfile(interaction.user.id, interaction.user.username);
        const isFollowing = (selfData.following || []).includes(targetUser.id);
        const followButton = new ButtonBuilder()
            .setCustomId(`seguir_toggle_${targetUser.id}`)
            .setLabel(isFollowing ? 'Deixar de Seguir' : 'Seguir Host')
            .setStyle(isFollowing ? ButtonStyle.Danger : ButtonStyle.Success)
            .setEmoji('🔔');
        components.push(new ActionRowBuilder().addComponents(followButton));
    }


    await interaction.editReply({ embeds: [embed], components, ephemeral: true });
}
