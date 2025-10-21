
export const idealRankPerWorldArticle = {
  id: 'ideal-rank-per-world',
  title: 'Guia de Rank Ideal por Mundo',
  summary: 'Uma análise estratégica sobre o rank ideal para farmar em cada mundo, baseado no tempo para derrotar os chefes e na eficiência do ganho de energia.',
  content: `Este guia oferece uma perspectiva estratégica sobre qual seria o "rank ideal" para se manter e farmar em cada mundo do Anime Eternal. A metodologia se baseia em um equilíbrio entre o seu ganho de energia (dano base) e o HP do chefe principal (Rank SS) de cada mundo.

### Metodologia

A premissa é simples: o "rank ideal" é aquele em que você consegue derrotar o chefe principal (Rank SS) do mundo em um tempo razoável. A comunidade define estes tempos da seguinte forma:

- **Rank Ideal (5 minutos):** O ponto de farm mais eficiente. Você tem poder suficiente para derrotar o chefe de forma consistente. Ficar mais forte que isso significa que você provavelmente já deveria estar no próximo mundo.
- **Rank Médio (10 minutos):** Você consegue derrotar o chefe, mas pode ser um pouco lento. É um bom indicador de que você está no caminho certo.
- **Rank Mínimo (15 minutos):** É o mínimo viável para começar a farmar o chefe do mundo. Levará tempo, mas é possível.

**Cálculo Base:**
1.  **DPS Necessário:** Para derrotar um chefe, o cálculo é: \`DPS Necessário = HP do Chefe / Tempo em Segundos\`.
2.  **Dano Base Necessário:** Considerando a gamepass "Fast Click" (5 cliques/segundo), seu dano base (energia) precisa ser: \`Dano Base = DPS Necessário / 5\`.
3.  **Relação com Energia:** No jogo, seu **Dano Base é igual à sua Energia Total Acumulada**. O "Ganho de Energia por clique" do seu rank deve ser suficiente para alcançar esse dano base.

A tabela abaixo estima os ranks para cada cenário, correlacionando o **Ganho de Energia Base** daquele rank com o dano necessário.

**Importante:** Esta é uma análise teórica. Bônus de poderes, armas, pets, gamepasses e outros multiplicadores irão acelerar drasticamente sua progressão e permitir que você avance com ranks mais baixos do que os listados. Use esta tabela como uma referência de poder base.`,
  tags: ['rank', 'guia', 'estratégia', 'mundo', 'ideal', 'farm', 'dps', 'chefe'],
  imageUrl: 'wiki-6', // Reusing rank system image
  tables: {
    idealRank: {
      headers: ['Mundo', 'Chefe (Rank SS)', 'HP do Chefe', 'Rank Ideal (5 min)', 'Rank Médio (10 min)', 'Rank Mínimo (15 min)'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS)': 'Kid Kohan', 'HP do Chefe': '2.5Qd', 'Rank Ideal (5 min)': '44', 'Rank Médio (10 min)': '43', 'Rank Mínimo (15 min)': '42' },
        { 'Mundo': 2, 'Chefe (Rank SS)': 'Shanks', 'HP do Chefe': '5.0sx', 'Rank Ideal (5 min)': '63', 'Rank Médio (10 min)': '62', 'Rank Mínimo (15 min)': '61' },
        { 'Mundo': 3, 'Chefe (Rank SS)': 'Eizen', 'HP do Chefe': '2.5Sp', 'Rank Ideal (5 min)': '73', 'Rank Médio (10 min)': '72', 'Rank Mínimo (15 min)': '71' },
        { 'Mundo': 4, 'Chefe (Rank SS)': 'Sakuni', 'HP do Chefe': '120.0Sp', 'Rank Ideal (5 min)': '80', 'Rank Médio (10 min)': '79', 'Rank Mínimo (15 min)': '78' },
        { 'Mundo': 5, 'Chefe (Rank SS)': 'Rangoki', 'HP do Chefe': '31.2de', 'Rank Ideal (5 min)': '109', 'Rank Médio (10 min)': '108', 'Rank Mínimo (15 min)': '107' },
        { 'Mundo': 6, 'Chefe (Rank SS)': 'Statue of God', 'HP do Chefe': '195Ud', 'Rank Ideal (5 min)': '121', 'Rank Médio (10 min)': '120', 'Rank Mínimo (15 min)': '119' },
        { 'Mundo': 7, 'Chefe (Rank SS)': 'Novi Chroni', 'HP do Chefe': '101TdD', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Itechi/Madera', 'HP do Chefe': '~4.2QnD', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 9, 'Chefe (Rank SS)': 'Veggita', 'HP do Chefe': '2.46OcD', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 10, 'Chefe (Rank SS)': 'Ken Turbo', 'HP do Chefe': '494SxD', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 11, 'Chefe (Rank SS)': 'Killas Godspeed', 'HP do Chefe': '49.4Vgn', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 12, 'Chefe (Rank SS)': 'Garou Cósmico', 'HP do Chefe': '2.96DVg', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 13, 'Chefe (Rank SS)': 'Esanor/Number 8', 'HP do Chefe': '~7.6DVg', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 14, 'Chefe (Rank SS)': 'Valzora', 'HP do Chefe': '4.79SeV', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 15, 'Chefe (Rank SS)': 'The Paladin', 'HP do Chefe': '967SPG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 16, 'Chefe (Rank SS)': 'Dio', 'HP do Chefe': '195NVG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 17, 'Chefe (Rank SS)': 'Arama', 'HP do Chefe': '686UTG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 18, 'Chefe (Rank SS)': 'Mr. Chainsaw', 'HP do Chefe': '1.5qTG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Bansho', 'HP do Chefe': '605UTG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 20, 'Chefe (Rank SSS)': 'Frezi Final Form', 'HP do Chefe': '47qTG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Vasto Ichge', 'HP do Chefe': '3.7ssTG', 'Rank Ideal (5 min)': '>125', 'Rank Médio (10 min)': '>125', 'Rank Mínimo (15 min)': '>125' },
      ],
    },
  },
};
