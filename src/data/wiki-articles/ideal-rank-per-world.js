
export const idealRankPerWorldArticle = {
  id: 'ideal-rank-per-world',
  title: 'Guia de Rank Ideal por Mundo',
  summary: 'Uma análise estratégica sobre o rank ideal para farmar em cada mundo, baseado no tempo para derrotar os chefes e na eficiência do ganho de energia.',
  content: `Este guia oferece uma perspectiva estratégica sobre qual seria o "rank ideal" para se manter e farmar em cada mundo do Anime Eternal. A metodologia se baseia em um equilíbrio entre o seu ganho de energia (dano base) e o HP do chefe principal (Rank SS) de cada mundo.

### Metodologia

A premissa é que o rank ideal é aquele que permite ao jogador, após um determinado tempo de farm, acumular energia suficiente para derrotar o chefe principal do mundo em um tempo específico. A análise assume que o jogador possui a gamepass **"Fast Click" (5 cliques/segundo)** e não considera outros bônus (poderes, pets, etc.), focando apenas na energia base ganha por rank.

- **Rank Ideal (Luta de 5 min):** O rank necessário para, após farmar por **6 horas**, derrotar o chefe em aproximadamente 5 minutos. Este é o ponto de farm mais eficiente.
- **Rank Médio (Luta de 10 min):** O rank necessário para, após farmar por **12 horas**, derrotar o chefe em aproximadamente 10 minutos.
- **Rank Mínimo (Luta de 15 min):** O rank necessário para, após farmar por **24 horas**, derrotar o chefe em aproximadamente 15 minutos.

**Importante:** Esta é uma análise teórica e serve como uma linha de base. Bônus de poderes, armas, pets, gamepasses e outros multiplicadores irão acelerar drasticamente sua progressão e permitir que você avance com ranks mais baixos do que os listados. Use esta tabela como uma referência de poder base.`,
  tags: ['rank', 'guia', 'estratégia', 'mundo', 'ideal', 'farm', 'dps', 'chefe'],
  imageUrl: 'wiki-6', // Reusing rank system image
  tables: {
    idealRank: {
      headers: ['Mundo', 'Chefe (Rank SS)', 'HP do Chefe', 'Rank Ideal (Luta 5min | Farm 6h)', 'Rank Médio (Luta 10min | Farm 12h)', 'Rank Mínimo (Luta 15min | Farm 24h)'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS)': 'Kid Kohan', 'HP do Chefe': '2.5Qd', 'Rank Ideal (Luta 5min | Farm 6h)': '34', 'Rank Médio (Luta 10min | Farm 12h)': '32', 'Rank Mínimo (Luta 15min | Farm 24h)': '29' },
        { 'Mundo': 2, 'Chefe (Rank SS)': 'Shanks', 'HP do Chefe': '5.0sx', 'Rank Ideal (Luta 5min | Farm 6h)': '50', 'Rank Médio (Luta 10min | Farm 12h)': '48', 'Rank Mínimo (Luta 15min | Farm 24h)': '45' },
        { 'Mundo': 3, 'Chefe (Rank SS)': 'Eizen', 'HP do Chefe': '2.5Sp', 'Rank Ideal (Luta 5min | Farm 6h)': '60', 'Rank Médio (Luta 10min | Farm 12h)': '58', 'Rank Mínimo (Luta 15min | Farm 24h)': '55' },
        { 'Mundo': 4, 'Chefe (Rank SS)': 'Sakuni', 'HP do Chefe': '120.0Sp', 'Rank Ideal (Luta 5min | Farm 6h)': '67', 'Rank Médio (Luta 10min | Farm 12h)': '65', 'Rank Mínimo (Luta 15min | Farm 24h)': '62' },
        { 'Mundo': 5, 'Chefe (Rank SS)': 'Rangoki', 'HP do Chefe': '31.2de', 'Rank Ideal (Luta 5min | Farm 6h)': '96', 'Rank Médio (Luta 10min | Farm 12h)': '94', 'Rank Mínimo (Luta 15min | Farm 24h)': '91' },
        { 'Mundo': 6, 'Chefe (Rank SS)': 'Statue of God', 'HP do Chefe': '195Ud', 'Rank Ideal (Luta 5min | Farm 6h)': '108', 'Rank Médio (Luta 10min | Farm 12h)': '106', 'Rank Mínimo (Luta 15min | Farm 24h)': '103' },
        { 'Mundo': 7, 'Chefe (Rank SS)': 'Novi Chroni', 'HP do Chefe': '101TdD', 'Rank Ideal (Luta 5min | Farm 6h)': '120', 'Rank Médio (Luta 10min | Farm 12h)': '118', 'Rank Mínimo (Luta 15min | Farm 24h)': '115' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Itechi/Madera', 'HP do Chefe': '4.2QnD', 'Rank Ideal (Luta 5min | Farm 6h)': '~129', 'Rank Médio (Luta 10min | Farm 12h)': '~127', 'Rank Mínimo (Luta 15min | Farm 24h)': '~124' },
        { 'Mundo': 9, 'Chefe (Rank SS)': 'Veggita', 'HP do Chefe': '2.46OcD', 'Rank Ideal (Luta 5min | Farm 6h)': '141', 'Rank Médio (Luta 10min | Farm 12h)': '139', 'Rank Mínimo (Luta 15min | Farm 24h)': '136' },
        { 'Mundo': 10, 'Chefe (Rank SS)': 'Ken Turbo', 'HP do Chefe': '494SxD', 'Rank Ideal (Luta 5min | Farm 6h)': '147', 'Rank Médio (Luta 10min | Farm 12h)': '145', 'Rank Mínimo (Luta 15min | Farm 24h)': '142' },
        { 'Mundo': 11, 'Chefe (Rank SS)': 'Killas Godspeed', 'HP do Chefe': '49.4Vgn', 'Rank Ideal (Luta 5min | Farm 6h)': '159', 'Rank Médio (Luta 10min | Farm 12h)': '157', 'Rank Mínimo (Luta 15min | Farm 24h)': '154' },
        { 'Mundo': 12, 'Chefe (Rank SS)': 'Garou Cósmico', 'HP do Chefe': '2.96DVg', 'Rank Ideal (Luta 5min | Farm 6h)': '165', 'Rank Médio (Luta 10min | Farm 12h)': '163', 'Rank Mínimo (Luta 15min | Farm 24h)': '160' },
        { 'Mundo': 13, 'Chefe (Rank SS)': 'Esanor', 'HP do Chefe': '9.77DVg', 'Rank Ideal (Luta 5min | Farm 6h)': '168', 'Rank Médio (Luta 10min | Farm 12h)': '166', 'Rank Mínimo (Luta 15min | Farm 24h)': '163' },
        { 'Mundo': 14, 'Chefe (Rank SS)': 'Valzora', 'HP do Chefe': '4.79SeV', 'Rank Ideal (Luta 5min | Farm 6h)': '174', 'Rank Médio (Luta 10min | Farm 12h)': '172', 'Rank Mínimo (Luta 15min | Farm 24h)': '169' },
        { 'Mundo': 15, 'Chefe (Rank SS)': 'The Paladin', 'HP do Chefe': '967SPG', 'Rank Ideal (Luta 5min | Farm 6h)': '180', 'Rank Médio (Luta 10min | Farm 12h)': '178', 'Rank Mínimo (Luta 15min | Farm 24h)': '175' },
        { 'Mundo': 16, 'Chefe (Rank SS)': 'Dio', 'HP do Chefe': '195NVG', 'Rank Ideal (Luta 5min | Farm 6h)': '186', 'Rank Médio (Luta 10min | Farm 12h)': '184', 'Rank Mínimo (Luta 15min | Farm 24h)': '181' },
        { 'Mundo': 17, 'Chefe (Rank SS)': 'Arama', 'HP do Chefe': '686UTG', 'Rank Ideal (Luta 5min | Farm 6h)': '192', 'Rank Médio (Luta 10min | Farm 12h)': '190', 'Rank Mínimo (Luta 15min | Farm 24h)': '187' },
        { 'Mundo': 18, 'Chefe (Rank SS)': 'Mr. Chainsaw', 'HP do Chefe': '1.5qTG', 'Rank Ideal (Luta 5min | Farm 6h)': '198', 'Rank Médio (Luta 10min | Farm 12h)': '196', 'Rank Mínimo (Luta 15min | Farm 24h)': '193' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Bansho', 'HP do Chefe': '605UTG', 'Rank Ideal (Luta 5min | Farm 6h)': '192', 'Rank Médio (Luta 10min | Farm 12h)': '190', 'Rank Mínimo (Luta 15min | Farm 24h)': '187' },
        { 'Mundo': 20, 'Chefe (Rank SSS)': 'Frezi Final Form', 'HP do Chefe': '47qTG', 'Rank Ideal (Luta 5min | Farm 6h)': '201', 'Rank Médio (Luta 10min | Farm 12h)': '199', 'Rank Mínimo (Luta 15min | Farm 24h)': '196' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Vasto Ichge', 'HP do Chefe': '3.7ssTG', 'Rank Ideal (Luta 5min | Farm 6h)': '207', 'Rank Médio (Luta 10min | Farm 12h)': '205', 'Rank Mínimo (Luta 15min | Farm 24h)': '202' },
      ],
    },
  },
};
