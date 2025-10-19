
export const tokenFarmingGuideArticle = {
  id: 'token-farming-guide',
  title: 'Guia de Farm de Tokens',
  summary: 'Aprenda a otimizar seu ganho de Tokens de Respiração e Artes Demoníacas, calculando os bônus de drop de itens e gamepasses.',
  content: `Este guia explica como maximizar a coleta de Tokens de Respiração (Breathing) e Tokens de Artes Demoníacas (Demon Arts), que são essenciais para evoluir suas armas de dano. A estratégia se baseia em acumular diferentes bônus de drop.

### NPCs que Dropam Tokens
A principal forma de obter esses tokens é derrotando NPCs específicos, geralmente os de rank mais baixo em cada mundo, que têm uma chance de dropar uma certa quantidade de tokens.

### Fórmula de Cálculo de Ganho de Tokens
Para calcular quantos tokens você pode ganhar, a IA deve usar a seguinte fórmula, que considera todos os multiplicadores de bônus disponíveis no jogo:

**Ganho Final = (Drop Base do NPC) * (Bônus de Ficha) * (Bônus de Aura) * (Bônus de Poção) * (Bônus de Macarrão)**

**Detalhes dos Bônus:**
- **Drop Base:** A quantidade de tokens que um NPC dropa sem nenhum bônus. Varia por NPC.
- **Bônus de Ficha (Gamepass):** Multiplica o ganho por 2 (\`x2\`). Este é geralmente uma gamepass de "2x Tokens".
- **Bônus de Aura:** Aumenta o ganho em 25% (\`x1.25\`).
- **Bônus de Poção (2x Drop):** Multiplica o ganho por 2 (\`x2\`).
- **Bônus de Macarrão (Drop):** Aumenta o ganho em 50% (\`x1.5\`).

### Exemplo de Cálculo
Vamos supor que um NPC dropa **100 tokens** como base.

- Com **Bônus de Ficha**: 100 * 2 = 200 tokens
- Com **Ficha + Aura**: 100 * 2 * 1.25 = 250 tokens
- Com **Ficha + Aura + Poção**: 100 * 2 * 1.25 * 2 = 500 tokens
- Com **Todos os Bônus (Ficha + Aura + Poção + Macarrão)**: 100 * 2 * 1.25 * 2 * 1.5 = **750 tokens**

Isso representa um aumento de **7.5x** sobre o drop base.

### Cenários de Farm
A tabela abaixo mostra o potencial de ganho para diferentes quantidades de drop base, considerando todos os bônus ativos.`,
  tags: ['tokens', 'farm', 'guia', 'respiração', 'breathing', 'artes demoníacas', 'demon arts', 'cálculo', 'bônus'],
  imageUrl: 'wiki-13',
  tables: {
    tokenFarmingExamples: {
      headers: ['Drop Base', 'Ganho Final (com todos os bônus)'],
      rows: [
        { 'Drop Base': '100k', 'Ganho Final (com todos os bônus)': '750k' },
        { 'Drop Base': '200k', 'Ganho Final (com todos os bônus)': '1.5M' },
        { 'Drop Base': '500k', 'Ganho Final (com todos os bônus)': '3.75M' },
        { 'Drop Base': '1M (1000k)', 'Ganho Final (com todos os bônus)': '7.5M' },
      ],
    },
  },
};
