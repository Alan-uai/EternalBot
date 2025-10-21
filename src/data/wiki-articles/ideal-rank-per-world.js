
export const idealRankPerWorldArticle = {
  id: 'ideal-rank-per-world',
  title: 'Guia de Rank Ideal por Mundo',
  summary: 'Uma análise estratégica sobre o rank ideal para farmar em cada mundo, baseado no tempo para derrotar os chefes e na eficiência do ganho de energia.',
  content: `Este guia oferece uma perspectiva estratégica sobre qual seria o "rank ideal" para se manter e farmar em cada mundo do Anime Eternal. A metodologia se baseia no dano por segundo (DPS) necessário para derrotar o chefe principal (Rank SS ou SSS) de cada mundo em um tempo específico.

### Metodologia

A premissa é que o rank ideal é aquele que permite ao jogador causar dano suficiente para derrotar o chefe em um tempo alvo. A análise assume que o jogador possui a gamepass **"Fast Click" (5 cliques/segundo)**, e que o dano base é igual à energia acumulada, que por sua vez é igual ao ganho de energia por clique do rank.

- **Rank Ideal (Luta ~5 min):** O rank mais baixo cujo DPS (`Ganho de Energia * 5`) é suficiente para derrotar o chefe em aproximadamente 5 minutos. Este é o ponto de farm mais eficiente antes de avançar.
- **Rank Médio (Luta ~10 min):** O rank mais baixo necessário para derrotar o chefe em aproximadamente 10 minutos.
- **Rank Mínimo (Luta ~15 min):** O rank mais baixo necessário para derrotar o chefe em aproximadamente 15 minutos.

**Importante:** Esta é uma análise teórica e serve como uma linha de base. Bônus de poderes, armas, pets, gamepasses e outros multiplicadores irão acelerar drasticamente sua progressão e permitir que você avance com ranks mais baixos do que os listados. Use esta tabela como uma referência de poder base.`,
  tags: ['rank', 'guia', 'estratégia', 'mundo', 'ideal', 'farm', 'dps', 'chefe'],
  imageUrl: 'wiki-6', // Reusing rank system image
  tables: {
    idealRank: {
      headers: ['Mundo', 'Chefe (Rank SS/SSS)', 'HP do Chefe', 'Rank Ideal (Luta ~5min)', 'Rank Médio (Luta ~10min)', 'Rank Mínimo (Luta ~15min)'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS/SSS)': 'Kid Kohan', 'HP do Chefe': '2.5Qd', 'Rank Ideal (Luta ~5min)': '32', 'Rank Médio (Luta ~10min)': '31', 'Rank Mínimo (Luta ~15min)': '30' },
        { 'Mundo': 2, 'Chefe (Rank SS/SSS)': 'Shanks', 'HP do Chefe': '5.0sx', 'Rank Ideal (Luta ~5min)': '48', 'Rank Médio (Luta ~10min)': '47', 'Rank Mínimo (Luta ~15min)': '46' },
        { 'Mundo': 3, 'Chefe (Rank SS/SSS)': 'Eizen', 'HP do Chefe': '2.5Sp', 'Rank Ideal (Luta ~5min)': '58', 'Rank Médio (Luta ~10min)': '57', 'Rank Mínimo (Luta ~15min)': '56' },
        { 'Mundo': 4, 'Chefe (Rank SS/SSS)': 'Sakuni', 'HP do Chefe': '120.0Sp', 'Rank Ideal (Luta ~5min)': '64', 'Rank Médio (Luta ~10min)': '63', 'Rank Mínimo (Luta ~15min)': '62' },
        { 'Mundo': 5, 'Chefe (Rank SS/SSS)': 'Rangoki', 'HP do Chefe': '31.2de', 'Rank Ideal (Luta ~5min)': '91', 'Rank Médio (Luta ~10min)': '90', 'Rank Mínimo (Luta ~15min)': '89' },
        { 'Mundo': 6, 'Chefe (Rank SS/SSS)': 'Statue of God', 'HP do Chefe': '195Ud', 'Rank Ideal (Luta ~5min)': '102', 'Rank Médio (Luta ~10min)': '101', 'Rank Mínimo (Luta ~15min)': '100' },
        { 'Mundo': 7, 'Chefe (Rank SS/SSS)': 'Novi Chroni', 'HP do Chefe': '101TdD', 'Rank Ideal (Luta ~5min)': '114', 'Rank Médio (Luta ~10min)': '113', 'Rank Mínimo (Luta ~15min)': '112' },
        { 'Mundo': 8, 'Chefe (Rank SS/SSS)': 'Madera', 'HP do Chefe': '5.64QnD', 'Rank Ideal (Luta ~5min)': '125', 'Rank Médio (Luta ~10min)': '124', 'Rank Mínimo (Luta ~15min)': '123' },
        { 'Mundo': 9, 'Chefe (Rank SS/SSS)': 'Veggita', 'HP do Chefe': '2.46OcD', 'Rank Ideal (Luta ~5min)': '68', 'Rank Médio (Luta ~10min)': '67', 'Rank Mínimo (Luta ~15min)': '66' },
        { 'Mundo': 10, 'Chefe (Rank SS/SSS)': 'Ken Turbo', 'HP do Chefe': '494SxD', 'Rank Ideal (Luta ~5min)': '64', 'Rank Médio (Luta ~10min)': '63', 'Rank Mínimo (Luta ~15min)': '62' },
        { 'Mundo': 11, 'Chefe (Rank SS/SSS)': 'Killas Godspeed', 'HP do Chefe': '49.4Vgn', 'Rank Ideal (Luta ~5min)': '75', 'Rank Médio (Luta ~10min)': '74', 'Rank Mínimo (Luta ~15min)': '73' },
        { 'Mundo': 12, 'Chefe (Rank SS/SSS)': 'Garou Cósmico', 'HP do Chefe': '2.96DVg', 'Rank Ideal (Luta ~5min)': '83', 'Rank Médio (Luta ~10min)': '82', 'Rank Mínimo (Luta ~15min)': '81' },
        { 'Mundo': 13, 'Chefe (Rank SS/SSS)': 'Esanor', 'HP do Chefe': '9.77DVg', 'Rank Ideal (Luta ~5min)': '84', 'Rank Médio (Luta ~10min)': '83', 'Rank Mínimo (Luta ~15min)': '82' },
        { 'Mundo': 14, 'Chefe (Rank SS/SSS)': 'Valzora', 'HP do Chefe': '4.79SeV', 'Rank Ideal (Luta ~5min)': '95', 'Rank Médio (Luta ~10min)': '94', 'Rank Mínimo (Luta ~15min)': '93' },
        { 'Mundo': 15, 'Chefe (Rank SS/SSS)': 'The Paladin', 'HP do Chefe': '967SPG', 'Rank Ideal (Luta ~5min)': '98', 'Rank Médio (Luta ~10min)': '97', 'Rank Mínimo (Luta ~15min)': '96' },
        { 'Mundo': 16, 'Chefe (Rank SS/SSS)': 'Dio', 'HP do Chefe': '195NVG', 'Rank Ideal (Luta ~5min)': '103', 'Rank Médio (Luta ~10min)': '102', 'Rank Mínimo (Luta ~15min)': '101' },
        { 'Mundo': 17, 'Chefe (Rank SS/SSS)': 'Arama', 'HP do Chefe': '686UTG', 'Rank Ideal (Luta ~5min)': '110', 'Rank Médio (Luta ~10min)': '109', 'Rank Mínimo (Luta ~15min)': '108' },
        { 'Mundo': 18, 'Chefe (Rank SS/SSS)': 'Mr. Chainsaw', 'HP do Chefe': '1.5qTG', 'Rank Ideal (Luta ~5min)': '117', 'Rank Médio (Luta ~10min)': '116', 'Rank Mínimo (Luta ~15min)': '115' },
        { 'Mundo': 19, 'Chefe (Rank SS/SSS)': 'Bansho', 'HP do Chefe': '605UTG', 'Rank Ideal (Luta ~5min)': '110', 'Rank Médio (Luta ~10min)': '109', 'Rank Mínimo (Luta ~15min)': '108' },
        { 'Mundo': 20, 'Chefe (Rank SS/SSS)': 'Frezi Final Form', 'HP do Chefe': '47qTG', 'Rank Ideal (Luta ~5min)': '118', 'Rank Médio (Luta ~10min)': '117', 'Rank Mínimo (Luta ~15min)': '116' },
        { 'Mundo': 21, 'Chefe (Rank SS/SSS)': 'Vasto Ichge', 'HP do Chefe': '3.7ssTG', 'Rank Ideal (Luta ~5min)': '122', 'Rank Médio (Luta ~10min)': '121', 'Rank Mínimo (Luta ~15min)': '120' },
      ],
    },
  },
};
