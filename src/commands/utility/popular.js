// src/commands/utility/popular.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { allWikiArticles } from '../../data/wiki-data.js';

const ADMIN_ROLE_ID = '1429318984716521483';
const BATCH_LIMIT = 500; // Limite de operações por lote do Firestore

function normalizeId(name) {
    if (!name) return null;
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

async function commitBatch(batch, logger, totalCount) {
    if (batch._writes.length > 0) {
        await batch.commit();
        logger.info(`Lote de ${batch._writes.length} escritas concluído. Total até agora: ${totalCount}`);
    }
    return writeBatch(initializeFirebase().firestore); // Retorna um novo batch
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
    let batch = writeBatch(firestore);
    let totalCount = 0;
    let currentBatchSize = 0;

    try {
        interaction.editReply('Iniciando a população do Firestore... Isso pode levar vários minutos.');
        console.log('Iniciando a população do Firestore...');

        for (const article of allWikiArticles) {
            const articleId = article.id;
            
            // Função para adicionar uma operação ao lote e comitar se necessário
            const addToBatch = async (ref, data) => {
                batch.set(ref, data);
                totalCount++;
                currentBatchSize++;
                if (currentBatchSize >= BATCH_LIMIT) {
                    batch = await commitBatch(batch, console, totalCount);
                    currentBatchSize = 0;
                }
            };

            if (article.id.startsWith('world-')) {
                const worldNumber = article.id.split('-')[1];
                const paddedWorldId = worldNumber.padStart(3, '0');
                const worldRef = doc(firestore, 'worlds', paddedWorldId);

                const { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks, missions, dailyQuests, ...worldData } = article;
                
                await addToBatch(worldRef, { name: article.title, ...worldData });

                const subCollections = { npcs, pets, powers, accessories, dungeons, shadows, stands, ghouls, obelisks, missions, dailyQuests };

                for (const [key, items] of Object.entries(subCollections)) {
                    if (items && Array.isArray(items)) {
                        for (const item of items) {
                            const itemId = normalizeId(item.id || item.name);
                            if (!itemId) continue;

                            const itemRef = doc(firestore, `worlds/${paddedWorldId}/${key}`, itemId);
                            const { stats, ...itemData } = item;
                            await addToBatch(itemRef, itemData);

                            if (key === 'powers' && stats && Array.isArray(stats)) {
                                for(const stat of stats) {
                                    const statId = normalizeId(stat.id || stat.name);
                                    if (!statId) continue;
                                    const statRef = doc(firestore, `worlds/${paddedWorldId}/powers/${itemId}/stats`, statId);
                                    await addToBatch(statRef, stat);
                                }
                            }
                        }
                    }
                }
            } else {
                const wikiRef = doc(firestore, 'wikiContent', articleId);
                await addToBatch(wikiRef, article);
            }
        }

        // Comita o lote final com as operações restantes
        await commitBatch(batch, console, totalCount);
        
        console.log(`População concluída! ${totalCount} operações de escrita realizadas.`);
        await interaction.editReply(`Firestore populado com sucesso! **${totalCount}** documentos foram escritos.`);

    } catch (error) {
        console.error('Erro ao popular o Firestore:', error);
        await interaction.editReply('Ocorreu um erro ao tentar popular o Firestore. Verifique os logs.');
    }
}
