// src/knowledge-base.js
import { allWikiArticles } from './data/wiki-data.js';

function formatArticle(article) {
  let content = `INÍCIO DO ARTIGO: ${article.title}\n`;
  content += `RESUMO: ${article.summary}\n`;
  
  if (article.content) {
    content += `CONTEÚDO:\n${article.content}\n`;
  }

  // Novo: Lógica otimizada para tabelas
  if (article.tables) {
    content += 'DADOS TABULADOS:\n';
    for (const key in article.tables) {
      const table = article.tables[key];
      content += `Tabela "${key}":\n`;
      content += table.headers.join(' | ') + '\n';
      content += table.headers.map(() => '---').join(' | ') + '\n';
      table.rows.forEach((row) => {
        const rowContent = table.headers.map((header) => row[header] !== undefined ? String(row[header]) : 'N/A').join(' | ');
        content += rowContent + '\n';
      });
      content += '\n';
    }
  }
  
  // Novo: Lógica otimizada para dados de mundo
  const worldData = {
      NPCs: article.npcs,
      Pets: article.pets,
      Acessórios: article.accessories,
      Dungeons: article.dungeons,
      Shadows: article.shadows,
      Stands: article.stands,
      Ghouls: article.ghouls,
      Poderes: article.powers
  };

  for (const [key, items] of Object.entries(worldData)) {
      if (items && Array.isArray(items) && items.length > 0) {
          content += `${key.toUpperCase()}:\n`;
          items.forEach(item => {
              const details = Object.entries(item)
                  .map(([prop, value]) => `${prop}: ${value}`)
                  .join(', ');
              content += `- ${details}\n`;
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
