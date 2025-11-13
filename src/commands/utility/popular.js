// src/commands/utility/popular.js
import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { initializeFirebase } from '../../firebase/index.js';
import { doc, writeBatch } from 'firebase/firestore';

const ADMIN_ROLE_ID = '1429318984716521483';
const BATCH_LIMIT = 500; // Limite de operações por lote do Firestore

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

export async function execute(interaction, container) {
    const { logger, services } = container;
    const { firebase, dataCompiler } = services;
    const { firestore } = firebase;

    if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
        return interaction.reply({
            content: 'Você não tem permissão para usar este comando.',
            ephemeral: true,
        });
    }

    await interaction.deferReply({ ephemeral: true });

    let batch = writeBatch(firestore);
    let totalCount = 0;
    let currentBatchSize = 0;

    try {
        interaction.editReply('Iniciando a população do Firestore com dados compilados... Isso pode levar vários minutos.');
        logger.info('Iniciando a população do Firestore a partir do DataCompiler...');

        const compiledData = dataCompiler.getCompiledData();

        for (const article of compiledData) {
            const articleId = article.id;
            
            // Função para adicionar uma operação ao lote e comitar se necessário
            const addToBatch = async (ref, data) => {
                batch.set(ref, data, { merge: true }); // Usar merge para ser seguro
                totalCount++;
                currentBatchSize++;
                if (currentBatchSize >= BATCH_LIMIT) {
                    batch = await commitBatch(batch, logger, totalCount);
                    currentBatchSize = 0;
                }
            };

            if (article.type === 'world') {
                const worldRef = doc(firestore, 'worlds', article.worldId);

                // Prepara os dados do mundo, removendo as subcoleções que serão tratadas separadamente
                const { subCollections, ...worldData } = article;
                await addToBatch(worldRef, worldData);

                if (subCollections) {
                    for (const [collectionName, items] of Object.entries(subCollections)) {
                        if (items && Array.isArray(items)) {
                            for (const item of items) {
                                const itemId = item.id;
                                if (!itemId) continue;

                                const itemRef = doc(firestore, `worlds/${article.worldId}/${collectionName}`, itemId);
                                const { stats, ...itemData } = item; // Remove stats se existir, para tratar a sub-sub-coleção
                                await addToBatch(itemRef, itemData);

                                if (collectionName === 'powers' && stats && Array.isArray(stats)) {
                                    for(const stat of stats) {
                                        const statId = stat.id;
                                        if (!statId) continue;
                                        const statRef = doc(firestore, `worlds/${article.worldId}/powers/${itemId}/stats`, statId);
                                        await addToBatch(statRef, stat);
                                    }
                                }
                            }
                        }
                    }
                }
            } else { // É um artigo da wiki
                const wikiRef = doc(firestore, 'wikiContent', articleId);
                await addToBatch(wikiRef, article);
            }
        }

        // Comita o lote final com as operações restantes
        await commitBatch(batch, logger, totalCount);
        
        logger.info(`População concluída! ${totalCount} operações de escrita realizadas.`);
        await interaction.editReply(`Firestore populado com sucesso! **${totalCount}** documentos foram escritos/mesclados.`);

    } catch (error) {
        logger.error('Erro ao popular o Firestore:', error);
        await interaction.editReply('Ocorreu um erro ao tentar popular o Firestore. Verifique os logs.');
    }
}
