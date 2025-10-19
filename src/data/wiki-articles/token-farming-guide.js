
export const tokenFarmingGuideArticle = {
  id: 'token-farming-guide',
  title: 'Guia do Melhor Método para Farm de Tokens',
  summary: 'Aprenda o método mais eficiente para farmar qualquer tipo de token no jogo, empilhando todos os bônus de drop disponíveis para maximizar seus ganhos.',
  content: `Este guia explica o método definitivo para maximizar a coleta de **qualquer token** no Anime Eternal, seja de Respiração (Breathing), Artes Demoníacas (Demon Arts) ou outros. A estratégia consiste em acumular e multiplicar todos os bônus de drop de itens disponíveis.

### A Fórmula do Farm Otimizado

Para calcular o ganho máximo de tokens, você deve multiplicar o drop base do NPC (ou da fonte do token) por todos os seus bônus de multiplicador. A fórmula é:

**Ganho Final = (Drop Base) * (Bônus de Ficha) * (Bônus de Aura) * (Bônus de Poção) * (Bônus de Macarrão)**

### Detalhes de Cada Bônus

- **Drop Base:** A quantidade de tokens que um NPC ou fonte dropa sem nenhum bônus. Este valor varia.
- **Bônus de Ficha (Gamepass):** Um multiplicador direto de **x2** no ganho, geralmente vindo de uma gamepass como "2x Tokens".
- **Bônus de Aura:** Aumenta o ganho em 25%, resultando em um multiplicador de **x1.25**.
- **Bônus de Poção (2x Drop):** Multiplica o ganho por **x2**.
- **Bônus de Macarrão (Comida de Drop):** Aumenta o ganho em 50%, resultando em um multiplicador de **x1.5**.

### O Multiplicador Máximo

Ao combinar todos esses bônus, você alcança um multiplicador massivo:

\`2 (Ficha) * 1.25 (Aura) * 2 (Poção) * 1.5 (Macarrão) = 7.5x\`

Isso significa que, com o método otimizado, você pode ganhar **7.5 vezes mais tokens** do que o normal.

### Exemplos de Ganho na Prática

A tabela abaixo demonstra o poder deste método, mostrando o potencial de ganho para diferentes quantidades de drop base quando todos os bônus estão ativos.

`,
  tags: ['tokens', 'farm', 'guia', 'método', 'otimização', 'bônus', 'cálculo', 'eficiente'],
  imageUrl: 'wiki-13',
  tables: {
    tokenFarmingExamples: {
      headers: ['Drop Base do NPC/Fonte', 'Seu Ganho Final (com todos os bônus)'],
      rows: [
        { 'Drop Base do NPC/Fonte': '100k', 'Seu Ganho Final (com todos os bônus)': '750k' },
        { 'Drop Base do NPC/Fonte': '200k', 'Seu Ganho Final (com todos os bônus)': '1.5M' },
        { 'Drop Base do NPC/Fonte': '500k', 'Seu Ganho Final (com todos os bônus)': '3.75M' },
        { 'Drop Base do NPC/Fonte': '1M (1,000k)', 'Seu Ganho Final (com todos os bônus)': '7.5M' },
      ],
    },
  },
};
