// src/lib/knowledge-base.ts
import { allWikiArticles } from './wiki-data';

function formatArticle(article: any): string {
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
      table.rows.forEach((row: any) => {
        content += table.headers.map((header: string) => row[header]).join(' | ') + '\n';
      });
      content += '\n';
    }
  }

  content += 'FIM DO ARTIGO\n';
  return content;
}

export function loadKnowledgeBase(): string {
  console.log('Compilando a base de conhecimento...');
  const knowledge = allWikiArticles.map(formatArticle).join('\n---\n');
  console.log('Base de conhecimento compilada com sucesso.');
  return knowledge;
}
