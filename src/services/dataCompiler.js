// src/services/dataCompiler.js
import { allWikiArticles } from '../data/wiki-data.js';

function normalizeId(name) {
    if (!name) return null;
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

export class DataCompilerService {
    constructor(logger) {
        this.logger = logger;
        this.compiledData = [];
        this.compile();
    }

    compile() {
        this.logger.info('[DataCompiler] Compilando e processando todos os dados brutos do jogo...');
        
        this.compiledData = allWikiArticles.map(article => {
            const articleId = article.id;
            let processedArticle = { ...article };

            if (articleId.startsWith('world-')) {
                const worldNumber = articleId.split('-')[1];
                const paddedWorldId = worldNumber.padStart(3, '0');
                
                processedArticle.type = 'world';
                processedArticle.worldId = paddedWorldId;

                const subCollectionKeys = ['npcs', 'pets', 'powers', 'accessories', 'dungeons', 'shadows', 'stands', 'ghouls', 'obelisks', 'missions', 'dailyQuests'];
                const subCollections = {};

                for (const key of subCollectionKeys) {
                    if (Array.isArray(processedArticle[key])) {
                        subCollections[key] = processedArticle[key].map(item => {
                            const newItem = { ...item };
                            newItem.id = normalizeId(item.id || item.name);

                            if (key === 'powers' && Array.isArray(item.stats)) {
                                newItem.stats = item.stats.map(stat => ({
                                    ...stat,
                                    id: normalizeId(stat.id || stat.name)
                                }));
                            }
                            return newItem;
                        });
                        // Remove the original array from the top-level article object
                        delete processedArticle[key];
                    }
                }
                 processedArticle.subCollections = subCollections;
            } else {
                processedArticle.type = 'wiki_article';
            }
            
            return processedArticle;
        });

        this.logger.info(`[DataCompiler] Compilação concluída. ${this.compiledData.length} artigos/mundos processados.`);
    }

    getCompiledData() {
        return this.compiledData;
    }
}
