// src/services/wikiService.js

function formatValue(value, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    if (Array.isArray(value)) {
        return value.map(item => `${indent}- ${formatValue(item, indentLevel + 1)}`).join('\n');
    }
    if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
            .map(([key, val]) => `${indent}${key}: ${formatValue(val, indentLevel + 1)}`)
            .join('\n');
    }
    return String(value);
}

function formatArticle(article) {
    let content = `INÍCIO DO ARTIGO: ${article.title}\n`;
    content += `RESUMO: ${article.summary}\n`;
    
    if (article.content) {
        content += `CONTEÚDO:\n${article.content}\n\n`;
    }

    // Chaves que já foram tratadas ou não devem ser iteradas como seções
    const excludedKeys = ['id', 'title', 'summary', 'content', 'type', 'worldId', 'subCollections'];

    for (const key in article) {
        if (excludedKeys.includes(key)) continue;

        const value = article[key];
        content += `SEÇÃO: ${key.toUpperCase()}\n`;
        content += `${formatValue(value, 1)}\n\n`;
    }
    
    // Processa sub-coleções de mundos
    if (article.subCollections) {
        for (const [collectionName, items] of Object.entries(article.subCollections)) {
            content += `SEÇÃO: ${collectionName.toUpperCase()}\n`;
            items.forEach(item => {
                const itemName = item.name || item.id;
                content += `- **${itemName}**:\n`;
                for (const prop in item) {
                    if (prop === 'id' || prop === 'name') continue;
                    const propValue = item[prop];
                    if (propValue !== undefined && propValue !== null) {
                         // A formatação de stats aninhados é cuidada pelo formatValue
                        content += `  - ${prop}: ${formatValue(propValue, 2)}\n`;
                    }
                }
            });
            content += '\n';
        }
    }


    content += 'FIM DO ARTIGO\n';
    return content;
}


export class WikiService {
    constructor(dataCompiler, logger) {
        this.logger = logger;
        this.dataCompiler = dataCompiler;
        this.knowledgeContext = '';
        this.compileKnowledgeBase();
    }

    compileKnowledgeBase() {
        this.logger.info('[WikiService] Compilando a base de conhecimento a partir dos dados processados...');
        const compiledData = this.dataCompiler.getCompiledData();
        this.knowledgeContext = compiledData.map(formatArticle).join('\n---\n');
        this.logger.info('[WikiService] Base de conhecimento para IA compilada com sucesso.');
    }

    getContext() {
        return this.knowledgeContext;
    }
}
