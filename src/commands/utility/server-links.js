// src/commands/utility/server-links.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { initializeFirebase } from '../../firebase/index.js';

const staticServers = [
    { name: 'Servidor do Jotinha (Discord)', url: 'https://discord.gg/YvB3bT5Pdp' },
    { name: 'Servidor do wKayann (Discord)', url: 'https://discord.gg/3EQnvNucKY' },
    { name: 'Servidor VIP do TheSaw', url: 'https://www.roblox.com/share?code=eb40821f59cf2a40b5af63c27730170e&type=Server' },
    { name: 'Servidor VIP do Duart', url: 'https://www.roblox.com/share?code=77afe38b2a3af341972b61348b37de2e&type=Server' },
    { name: 'Servidor VIP do Kenpachi', url: 'https://www.roblox.com/share?code=12cf422a7b83e745b1826304b40c61fd&type=Server' }
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

    // Adiciona os servidores estáticos
    const staticLinksDescription = staticServers
        .map(server => `**${server.name}**: [Clique aqui](${server.url})`)
        .join('\n');
    embed.addFields({ name: '🌐 Servidores da Comunidade', value: staticLinksDescription });

    // Busca por servidores de jogadores no Firestore
    try {
        const usersRef = collection(firestore, 'users');
        // Acessamos o campo aninhado 'serverLink' usando a notação de ponto.
        const q = query(usersRef, where("dungeonSettings.serverLink", "!=", null));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            let playerLinksDescription = '';
            querySnapshot.forEach(doc => {
                const userData = doc.data();
                // Adiciona o link do jogador à descrição.
                playerLinksDescription += `**Servidor de ${userData.username}**: [Clique aqui](${userData.dungeonSettings.serverLink})\n`;
            });
            // Adiciona um novo campo para os servidores dos jogadores.
            embed.addFields({ name: '🎮 Servidores de Jogadores (do /soling)', value: playerLinksDescription });
        } else {
             embed.addFields({ name: '🎮 Servidores de Jogadores (do /soling)', value: 'Nenhum jogador cadastrou um servidor privado ainda.' });
        }

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('Erro ao buscar links de servidores de jogadores:', error);
        await interaction.editReply('Ocorreu um erro ao buscar os links dos servidores. Por favor, tente novamente mais tarde.');
    }
}
