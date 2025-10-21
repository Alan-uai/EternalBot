
export const idealRankPerWorldArticle = {
  id: 'ideal-rank-per-world',
  title: 'Guia de Rank Ideal por Mundo',
  summary: 'Uma análise estratégica sobre o rank ideal para farmar em cada mundo, baseado no tempo para derrotar os chefes e na eficiência do ganho de energia.',
  content: `Este guia oferece uma perspectiva estratégica sobre qual seria o "rank ideal" para se manter e farmar em cada mundo do Anime Eternal. A metodologia se baseia em um equilíbrio entre o seu ganho de energia (dano base) e o HP do chefe principal (Rank SS) de cada mundo.

### Metodologia

A premissa é que o "rank ideal" é aquele onde, após farmar por um tempo determinado, seu poder acumulado permite derrotar o chefe principal em um tempo razoável.

- **Rank Ideal (5 min de luta):** Assume que o jogador farmou por **6 horas** nesse rank. É o ponto de farm mais eficiente antes de se tornar forte demais para o mundo.
- **Rank Médio (10 min de luta):** Assume que o jogador farmou por **12 horas**. Um bom indicador de que você está no caminho certo.
- **Rank Mínimo (15 min de luta):** Assume que o jogador farmou por **24 horas**. É o mínimo viável para começar a farmar o chefe do mundo.

**Cálculo Base:**
1.  **Dano Total Necessário:** Primeiro, calculamos o dano total necessário para derrotar o chefe no tempo de luta alvo (5, 10 ou 15 minutos).
    *   \`Dano Total = HP do Chefe\`
2.  **Energia Acumulada Requerida:** O dano total do jogador durante a luta é o resultado da sua energia acumulada multiplicada pelos cliques. Para encontrar a energia que ele precisaria ter no início da luta, a fórmula é:
    *   \`Energia Acumulada Necessária = Dano Total / (5 cliques/s * Tempo de Luta em segundos)\`
3.  **Ganho de Energia por Hora:** Calculamos quanto de energia o jogador precisaria ganhar por hora para atingir esse total no tempo de farm estipulado (6, 12 ou 24 horas).
    *   \`Ganho de Energia por Hora = Energia Acumulada Necessária / Horas de Farm\`
4.  **Encontrar o Rank:** Finalmente, procuramos na tabela de ranks qual deles oferece um ganho de energia por hora (considerando 5 cliques/s) mais próximo do valor calculado.

A tabela abaixo mostra os ranks estimados para cada cenário.

**Importante:** Esta é uma análise teórica. Bônus de poderes, armas, pets, gamepasses e outros multiplicadores irão acelerar drasticamente sua progressão e permitir que você avance com ranks mais baixos do que os listados. Use esta tabela como uma referência de poder base.`,
  tags: ['rank', 'guia', 'estratégia', 'mundo', 'ideal', 'farm', 'dps', 'chefe'],
  imageUrl: 'wiki-6', // Reusing rank system image
  tables: {
    idealRank: {
      headers: ['Mundo', 'Chefe (Rank SS)', 'HP do Chefe', 'Rank Ideal (após 6h de farm)', 'Rank Médio (após 12h de farm)', 'Rank Mínimo (após 24h de farm)'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS)': 'Kid Kohan', 'HP do Chefe': '2.5Qd', 'Rank Ideal (após 6h de farm)': '39', 'Rank Médio (após 12h de farm)': '37', 'Rank Mínimo (após 24h de farm)': '34' },
        { 'Mundo': 2, 'Chefe (Rank SS)': 'Shanks', 'HP do Chefe': '5.0sx', 'Rank Ideal (após 6h de farm)': '55', 'Rank Médio (após 12h de farm)': '53', 'Rank Mínimo (após 24h de farm)': '50' },
        { 'Mundo': 3, 'Chefe (Rank SS)': 'Eizen', 'HP do Chefe': '2.5Sp', 'Rank Ideal (após 6h de farm)': '65', 'Rank Médio (após 12h de farm)': '63', 'Rank Mínimo (após 24h de farm)': '60' },
        { 'Mundo': 4, 'Chefe (Rank SS)': 'Sakuni', 'HP do Chefe': '120.0Sp', 'Rank Ideal (após 6h de farm)': '72', 'Rank Médio (após 12h de farm)': '70', 'Rank Mínimo (após 24h de farm)': '67' },
        { 'Mundo': 5, 'Chefe (Rank SS)': 'Rangoki', 'HP do Chefe': '31.2de', 'Rank Ideal (após 6h de farm)': '101', 'Rank Médio (após 12h de farm)': '99', 'Rank Mínimo (após 24h de farm)': '96' },
        { 'Mundo': 6, 'Chefe (Rank SS)': 'Statue of God', 'HP do Chefe': '195Ud', 'Rank Ideal (após 6h de farm)': '113', 'Rank Médio (após 12h de farm)': '111', 'Rank Mínimo (após 24h de farm)': '108' },
        { 'Mundo': 7, 'Chefe (Rank SS)': 'Novi Chroni', 'HP do Chefe': '101TdD', 'Rank Ideal (após 6h de farm)': '125', 'Rank Médio (após 12h de farm)': '123', 'Rank Mínimo (após 24h de farm)': '120' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Itechi/Madera', 'HP do Chefe': '~4.2QnD', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '125' },
        { 'Mundo': 9, 'Chefe (Rank SS)': 'Veggita', 'HP do Chefe': '2.46OcD', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 10, 'Chefe (Rank SS)': 'Ken Turbo', 'HP do Chefe': '494SxD', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 11, 'Chefe (Rank SS)': 'Killas Godspeed', 'HP do Chefe': '49.4Vgn', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 12, 'Chefe (Rank SS)': 'Garou Cósmico', 'HP do Chefe': '2.96DVg', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 13, 'Chefe (Rank SS)': 'Esanor/Number 8', 'HP do Chefe': '~7.6DVg', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 14, 'Chefe (Rank SS)': 'Valzora', 'HP do Chefe': '4.79SeV', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 15, 'Chefe (Rank SS)': 'The Paladin', 'HP do Chefe': '967SPG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 16, 'Chefe (Rank SS)': 'Dio', 'HP do Chefe': '195NVG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 17, 'Chefe (Rank SS)': 'Arama', 'HP do Chefe': '686UTG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 18, 'Chefe (Rank SS)': 'Mr. Chainsaw', 'HP do Chefe': '1.5qTG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Bansho', 'HP do Chefe': '605UTG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 20, 'Chefe (Rank SSS)': 'Frezi Final Form', 'HP do Chefe': '47qTG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Vasto Ichge', 'HP do Chefe': '3.7ssTG', 'Rank Ideal (após 6h de farm)': '>125', 'Rank Médio (após 12h de farm)': '>125', 'Rank Mínimo (após 24h de farm)': '>125' },
      ],
    },
  },
};

    