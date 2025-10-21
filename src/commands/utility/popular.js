// src/commands/utility/popular.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { collection, doc, setDoc, writeBatch, getDocs, query } from 'firebase/firestore';
import { allWikiArticles } from '../../data/wiki-data.js';

const ADMIN_ROLE_ID = '1429318984716521483';

export const data = new SlashCommandBuilder()
    .setName('popular')
    .setDescription('Popula o Firestore com os dados dos arquivos de jogo.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);

export async function execute(interaction) {
    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    await interaction.deferReply({ ephemeral: true });

    const { firestore } = initializeFirebase();
    const batch = writeBatch(firestore);
    let count = 0;

    try {
        console.log('Iniciando a população do Firestore...');

        for (const article of allWikiArticles) {
            // Se o 'article' é um dado de mundo (tem 'npcs', 'pets', etc.)
            if (article.id.startsWith('world-')) {
                const worldId = article.id;
                const worldRef = doc(firestore, 'worlds', worldId);

                // Separa os dados do documento principal das sub-coleções
                const { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks, ...worldData } = article;
                
                batch.set(worldRef, {
                    name: article.title, // Adiciona o nome do mundo ao documento principal
                    ...worldData 
                });
                count++;

                const subCollections = { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks };

                for (const [key, items] of Object.entries(subCollections)) {
                    if (items && Array.isArray(items)) {
                        for (const item of items) {
                            // Garante que o item tenha um ID, se não tiver, usa o nome
                            const itemId = item.id || item.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
                            if (!itemId) continue;

                            const itemRef = doc(firestore, `worlds/${worldId}/${key}`, itemId);
                             const { stats, ...itemData } = item;
                            batch.set(itemRef, itemData);
                            count++;

                            // Lida com a sub-sub-coleção 'stats' para poderes
                            if (key === 'powers' && stats && Array.isArray(stats)) {
                                for(const stat of stats) {
                                    const statId = stat.id || stat.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
                                    if (!statId) continue;

                                    const statRef = doc(firestore, `worlds/${worldId}/powers/${itemId}/stats`, statId);
                                    batch.set(statRef, stat);
                                    count++;
                                }
                            }
                        }
                    }
                }
            } 
            // Se for um artigo da wiki (achievement, guia, etc.)
            else {
                // Aqui podemos adicionar lógica para outras coleções, como 'achievements' ou 'wikiContent'
                // Por enquanto, vamos pular para não poluir o DB com artigos que não são entidades diretas.
                // Exemplo:
                // if (article.id === 'achievements-guide') {
                //     const achievementsRef = collection(firestore, 'achievements');
                //     // lógica para adicionar achievements...
                // }
            }
        }

        await batch.commit();
        console.log(`População concluída! ${count} operações de escrita realizadas.`);
        await interaction.editReply(`Firestore populado com sucesso! **${count}** documentos foram escritos.`);

    } catch (error) {
        console.error('Erro ao popular o Firestore:', error);
        await interaction.editReply('Ocorreu um erro ao tentar popular o Firestore.');
    }
}
