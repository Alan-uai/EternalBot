// src/knowledge-base.js
import { allWikiArticles } from './data/wiki-data.js';

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

  const excludedKeys = ['id', 'title', 'summary', 'content'];

  for (const key in article) {
    if (excludedKeys.includes(key)) continue;

    const value = article[key];
    content += `SEÇÃO: ${key.toUpperCase()}\n`;

    if (Array.isArray(value)) {
        value.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                const name = item.name || item.id || 'Item';
                content += `- **${name}**:\n`;
                for (const prop in item) {
                    if (prop === 'name' || prop === 'id') continue;
                    const propValue = item[prop];
                    if (propValue !== undefined) {
                        content += `  - ${prop}: ${formatValue(propValue, 2)}\n`;
                    }
                }
            } else {
                 content += `- ${formatValue(item, 1)}\n`;
            }
        });
    } else if (typeof value === 'object' && value !== null) {
        for (const subKey in value) {
            const subValue = value[subKey];
            content += `- **${subKey}**:\n`;
            content += `${formatValue(subValue, 2)}\n`;
        }
    } else {
         content += `${formatValue(value, 1)}\n`;
    }
     content += `\n`;
  }

  content += 'FIM DO ARTIGO\n';
  return content;
}

export function loadKnowledgeBase() {
  console.log('Compilando a base de conhecimento...');
  const knowledge = allWikiArticles.map(formatArticle).join('\n---\n');
  console.log('Base de conhecimento compilada com sucesso.');
  return knowledge;
}
