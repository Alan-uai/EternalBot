// src/knowledge-base.js
import { allWikiArticles } from './data/wiki-data.js';

function formatArticle(article) {
  let content = `INÍCIO DO ARTIGO: ${article.title}\n`;
  content += `RESUMO: ${article.summary}\n`;
  content += `CONTEÚDO:\n${article.content}\n`;

  if (article.tables) {
    content += 'TABELAS:\n';
    for (const key in article.tables) {
      const table = article.tables[key];
      content += `Tabela "${key}":\n`;
      content += table.headers.join(' | ') + '\n';
      content += table.headers.map(() => '---').join(' | ') + '\n';
      table.rows.forEach((row) => {
        content += table.headers.map((header) => row[header]).join(' | ') + '\n';
      });
      content += '\n';
    }
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
