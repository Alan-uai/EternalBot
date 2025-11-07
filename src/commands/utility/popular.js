// src/commands/utility/popular.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { allWikiArticles } from '../../data/wiki-data.js';

const ADMIN_ROLE_ID = '1429318984716521483';

function normalizeId(name) {
    if (!name) return null;
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

async function populateCollection(batch, firestore, collectionName, items) {
    if (!items || !Array.isArray(items)) return 0;
    
    let count = 0;
    for (const item of items) {
        const itemId = normalizeId(item.id || item.name);
        if (!itemId) continue;
        
        const itemRef = doc(firestore, collectionName, itemId);
        batch.set(itemRef, item);
        count++;
    }
    return count;
}


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
            const articleId = article.id;
            
            if (article.id.startsWith('world-')) {
                const worldNumber = article.id.split('-')[1];
                const paddedWorldId = worldNumber.padStart(3, '0');
                const worldRef = doc(firestore, 'worlds', paddedWorldId);

                // Separa os dados do mundo das sub-coleções
                const { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks, missions, dailyQuests, ...worldData } = article;
                
                batch.set(worldRef, { name: article.title, ...worldData });
                count++;

                const subCollections = { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks, missions, dailyQuests };

                for (const [key, items] of Object.entries(subCollections)) {
                    if (items && Array.isArray(items)) {
                        for (const item of items) {
                            const itemId = normalizeId(item.id || item.name);
                            if (!itemId) continue;

                            const itemRef = doc(firestore, `worlds/${paddedWorldId}/${key}`, itemId);
                            const { stats, ...itemData } = item;
                            batch.set(itemRef, itemData);
                            count++;

                            // Lógica para sub-sub-coleções como 'stats' de 'powers'
                            if (key === 'powers' && stats && Array.isArray(stats)) {
                                for(const stat of stats) {
                                    const statId = normalizeId(stat.id || stat.name);
                                    if (!statId) continue;

                                    const statRef = doc(firestore, `worlds/${paddedWorldId}/powers/${itemId}/stats`, statId);
                                    batch.set(statRef, stat);
                                    count++;
                                }
                            }
                        }
                    }
                }
            } else if (article.tables) { // Apenas processa se o artigo tiver tabelas
                 // Trata outros artigos com tabelas como coleções
                if (article.id === 'stands-world-16') {
                    count += await populateCollection(batch, firestore, 'stands', article.tables.stands.rows);
                } else if (article.id === 'titans-world-11') {
                     count += await populateCollection(batch, firestore, 'titans', article.tables.baseTitans.rows);
                } else if (article.id === 'shadows-guide') {
                     count += await populateCollection(batch, firestore, 'shadows_bonus', article.tables.shadowBonuses.rows);
                } else if (article.id === 'scythes-world-21') {
                    count += await populateCollection(batch, firestore, 'scythes', article.tables.scythes.rows);
                } else if (article.id === 'jewelry-crafting') {
                    count += await populateCollection(batch, firestore, 'jewelry_bonuses', article.tables.jewelryBonuses.rows);
                } else {
                    // Artigos genéricos com tabelas vão para wikiContent
                    const wikiRef = doc(firestore, 'wikiContent', articleId);
                    batch.set(wikiRef, article);
                    count++;
                }
            }
            else {
                // Artigos sem tabelas estruturadas (guias, etc.) vão para wikiContent
                const wikiRef = doc(firestore, 'wikiContent', articleId);
                batch.set(wikiRef, article);
                count++;
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
