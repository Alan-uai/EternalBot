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
  
  // CORREÇÃO: Lógica aprimorada para detalhar NPCs e seus DROPS
  if (article.npcs && Array.isArray(article.npcs)) {
      content += `NPCS DESTE MUNDO:\n`;
      article.npcs.forEach(npc => {
          let npcDetails = `- **${npc.name}** (Rank: ${npc.rank}, HP: ${npc.hp}, Exp: ${npc.exp})`;
          if (npc.drops) {
              const dropStrings = Object.entries(npc.drops).map(([dropName, dropDetails]) => {
                  if (typeof dropDetails === 'object' && dropDetails !== null) {
                      const details = Object.entries(dropDetails)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ');
                      return `${dropName} (${details})`;
                  }
                  return dropName; // Fallback
              });
              if (dropStrings.length > 0) {
                  npcDetails += ` | Drops: ${dropStrings.join('; ')}`;
              }
          }
          content += npcDetails + '\n';
      });
      content += '\n';
  }

  // Lógica para outras entidades como pets, poderes, etc.
  const worldData = {
      Pets: article.pets,
      Acessórios: article.accessories,
      Dungeons: article.dungeons,
      Shadows: article.shadows,
      Stands: article.stands,
      Ghouls: article.ghouls,
      Poderes: article.powers,
      Missões: article.missions,
      Obeliscos: article.obelisks,
  };

  for (const [key, items] of Object.entries(worldData)) {
      if (items && Array.isArray(items) && items.length > 0) {
          content += `${key.toUpperCase()}:\n`;
          items.forEach(item => {
              const details = Object.entries(item)
                  .filter(([prop]) => typeof item[prop] !== 'object') // Não mostra objetos aninhados de forma genérica
                  .map(([prop, value]) => `${prop}: ${value}`)
                  .join(', ');
              content += `- ${item.name || item.id}: ${details}\n`;
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
