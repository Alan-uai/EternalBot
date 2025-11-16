// src/commands/utility/server-links.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const partnerServers = [
    { name: 'Servidor do Jotinha (Discord)', url: 'https://discord.gg/YvB3bT5Pdp' },
    { name: 'Servidor do wKayann (Discord)', url: 'https://discord.gg/3EQnvNucKY' },
];

const helperServers = [
    { name: 'Servidor VIP do TheSaw', url: 'https://www.roblox.com/share?code=eb40821f59cf2a40b5af63c27730170e&type=Server' },
    { name: 'Servidor VIP do Duart', url: 'https://www.roblox.com/share?code=77afe38b2a3af341972b61348b37de2e&type=Server' },
    { name: 'Servidor VIP do Kenpachi', url: 'https://www.roblox.com/share?code=12cf422a7b83e745b1826304b40c61fd&type=Server' },
    { name: 'Servidor VIP do Mike', url: 'https://www.roblox.com/share?code=27a334b553e82240bd0c2040a1b34075&type=Server' }
];

export const data = new SlashCommandBuilder()
    .setName('server-links')
    .setDescription('Mostra links para servidores VIP e da comunidade.');

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🔗 Links de Servidores')
        .setTimestamp();

    // 1. Servidores de Discord Parceiros
    if (partnerServers.length > 0) {
        const partnerLinksDesc = partnerServers
            .map(server => `**${server.name}**: [Clique aqui](${server.url})`)
            .join('\n');
        embed.addFields({ name: '🤝 Servidores de Discord Parceiros', value: partnerLinksDesc });
    }
    
    // 2. Servidores Principais Helpers
    if (helperServers.length > 0) {
        const helperLinksDesc = helperServers
            .map(server => `**${server.name}**: [Clique aqui](${server.url})`)
            .join('\n');
        embed.addFields({ name: '🆘 Servidores Principais (Helpers)', value: helperLinksDesc });
    }


    // 3. Busca por servidores de jogadores no Firestore (/soling)
    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("dungeonSettings.serverLink", "!=", null), where("dungeonSettings.serverLink", "!=", ""));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            let playerLinksDescription = '';
            // Usamos Promise.all para aguardar todas as buscas de membros
            await Promise.all(querySnapshot.docs.map(async (doc) => {
                const userData = doc.data();
                const member = await interaction.guild.members.fetch(doc.id).catch(() => null);
                // Usa o displayName se disponível, senão o username como fallback
                const name = member ? member.displayName : userData.username;

                playerLinksDescription += `**Servidor de ${name}**: [Clique aqui](${userData.dungeonSettings.serverLink})\n`;
            }));
            embed.addFields({ name: '🎮 Servidores de Jogadores (/soling)', value: playerLinksDescription });
        } else {
             embed.addFields({ name: '🎮 Servidores de Jogadores (/soling)', value: 'Nenhum jogador cadastrou um servidor privado ainda.' });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao buscar links de servidores de jogadores:', error);
        // Responde apenas com os links estáticos se a busca no DB falhar
        if (!interaction.replied) {
            await interaction.editReply({ embeds: [embed] });
        } else {
             interaction.followUp({ content: 'Ocorreu um erro ao buscar os links dinâmicos de jogadores.', ephemeral: true });
        }
    }
}
