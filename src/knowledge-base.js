// src/knowledge-base.js
import { allWikiArticles } from './data/wiki-data.js';

function formatArticle(article) {
  let content = `INÍCIO DO ARTIGO: ${article.title}\n`;
  content += `RESUMO: ${article.summary}\n`;
  
  if (article.content) {
    content += `CONTEÚDO:\n${article.content}\n`;
  }

  if (article.tables) {
    content += 'TABELAS:\n';
    for (const key in article.tables) {
      const table = article.tables[key];
      content += `Tabela "${key}":\n`;
      content += table.headers.join(' | ') + '\n';
      content += table.headers.map(() => '---').join(' | ') + '\n';
      table.rows.forEach((row) => {
        const rowContent = table.headers.map((header) => row[header] !== undefined ? row[header] : 'N/A').join(' | ');
        content += rowContent + '\n';
      });
      content += '\n';
    }
  }
  
  // Handling for world data specifically
  if (article.npcs || article.pets || article.powers || article.accessories || article.dungeons || article.shadows || article.stands) {
     content += 'DADOS DO MUNDO:\n';
  }

  if (article.npcs) {
    content += 'NPCs:\n';
    article.npcs.forEach(item => content += `- ${item.name} (Rank: ${item.rank}, HP: ${item.hp})\n`);
  }
  if (article.pets) {
    content += 'Pets:\n';
    article.pets.forEach(item => content += `- ${item.name} (Rank: ${item.rank}, Bônus: ${item.energy_bonus})\n`);
  }
    if (article.accessories) {
    content += 'Acessórios:\n';
    article.accessories.forEach(item => content += `- ${item.name} (Chefe: ${item.boss}, Raridade: ${item.rarity})\n`);
  }
  if (article.dungeons) {
    content += 'Dungeons:\n';
    article.dungeons.forEach(item => content += `- ${item.name} (Chefe: ${item.boss})\n`);
  }
    if (article.shadows) {
    content += 'Shadows:\n';
    article.shadows.forEach(item => content += `- ${item.name} (Tipo: ${item.type})\n`);
  }
  if (article.stands) {
    content += 'Stands:\n';
    article.stands.forEach(item => content += `- ${item.name} (Raridade: ${item.rarity}, Bônus: ${item.energy_bonus})\n`);
  }
  if(article.powers) {
    content += 'Poderes:\n';
    article.powers.forEach(power => {
        content += `- ${power.name} (Tipo: ${power.type}, Categoria: ${power.statType})\n`;
        if (power.stats) {
            power.stats.forEach(stat => {
                content += `  - Stat: ${stat.name} (Multiplicador: ${stat.multiplier}, Raridade: ${stat.rarity})\n`;
            });
        }
    });
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
