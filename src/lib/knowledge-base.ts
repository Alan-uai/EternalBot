/**
 * @fileOverview Compila uma base de conhecimento unificada a partir de todos os artigos da wiki e dados estáticos do jogo.
 * Este "livro" é usado pela IA para fornecer contexto consistente e rápido.
 */
import { allWikiArticles } from '@/lib/wiki-data';
import { world1Data } from '@/lib/world-1-data';
import { world2Data } from '@/lib/world-2-data';
import { world3Data } from '@/lib/world-3-data';
import { world4Data } from '@/lib/world-4-data';
import { world5Data } from '@/lib/world-5-data';
import { world6Data } from '@/lib/world-6-data';
import { world7Data } from '@/lib/world-7-data';
import { world8Data } from '@/lib/world-8-data';
import { world9Data } from '@/lib/world-9-data';
import { world10Data } from '@/lib/world-10-data';
import { world11Data } from '@/lib/world-11-data';
import { world12Data } from '@/lib/world-12-data';
import { world13Data } from '@/lib/world-13-data';
import { world14Data } from '@/lib/world-14-data';
import { world15Data } from '@/lib/world-15-data';
import { world16Data } from '@/lib/world-16-data';
import { world17Data } from '@/lib/world-17-data';
import { world18Data } from '@/lib/world-18-data';
import { world19Data } from '@/lib/world-19-data';
import { world20Data } from '@/lib/world-20-data';
import { world21Data } from '@/lib/world-21-data';
import { world22Data } from '@/lib/world-22-data';

// Agrupa todos os dados estáticos dos mundos
const allWorldsData = [
  world1Data, world2Data, world3Data, world4Data, world5Data,
  world6Data, world7Data, world8Data, world9Data, world10Data,
  world11Data, world12Data, world13Data, world14Data, world15Data,
  world16Data, world17Data, world18Data, world19Data, world20Data,
  world21Data, world22Data
];

// Converte os artigos da wiki em uma string formatada
const articlesContext = allWikiArticles
  .map(article => `
--- INÍCIO DO ARTIGO: ${article.title} ---
ID: ${article.id}
Resumo: ${article.summary}
Conteúdo:
${article.content}
Tags: ${Array.isArray(article.tags) ? article.tags.join(', ') : ''}
${article.tables ? `Tabelas de Dados:\n${JSON.stringify(article.tables, null, 2)}` : ''}
--- FIM DO ARTIGO: ${article.title} ---
`).join('\n\n');

// Converte os dados estáticos dos mundos em uma string formatada
const worldsDataContext = allWorldsData
  .map(world => `
--- INÍCIO DOS DADOS DO MUNDO: ${world.name} ---
${JSON.stringify(world, null, 2)}
--- FIM DOS DADOS DO MUNDO: ${world.name} ---
`).join('\n\n');

// Combina tudo em uma única base de conhecimento
export const KNOWLEDGE_BASE_CONTEXT = `
# BASE DE CONHECIMENTO DO JOGO ANIME ETERNAL

## SEÇÃO 1: ARTIGOS DA WIKI

${articlesContext}

## SEÇÃO 2: DADOS ESTATÍSTICOS BRUTOS POR MUNDO

${worldsDataContext}
`;
