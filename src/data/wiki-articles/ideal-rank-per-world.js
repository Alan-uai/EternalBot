
export const idealRankPerWorldArticle = {
  id: 'ideal-rank-per-world',
  title: 'Guia de Rank Ideal por Mundo',
  summary: 'Uma análise estratégica sobre o rank ideal para farmar em cada mundo, baseado no tempo para derrotar os chefes e na eficiência do ganho de energia.',
  content: `Este guia oferece uma perspectiva estratégica sobre qual seria o "rank ideal" para se manter e farmar em cada mundo do Anime Eternal. A metodologia se baseia em um equilíbrio entre o seu ganho de energia (dano base) e o HP do chefe principal (Rank SS) de cada mundo.

### Metodologia

A premissa é simples: o "rank ideal" é aquele em que você consegue derrotar o chefe principal (Rank SS) do mundo em um tempo razoável, geralmente considerado em torno de **5 minutos (300 segundos)**. Um tempo menor que isso é ótimo, mas se levar muito mais tempo, seu farm pode ser ineficiente.

**Cálculo Base:**
1.  **DPS Necessário:** Para derrotar um chefe em 300 segundos, o cálculo é: \`DPS Necessário = HP do Chefe / 300\`.
2.  **Dano Base Necessário:** Considerando a gamepass "Fast Click" (4 cliques/segundo), seu dano base precisa ser: \`Dano Base = DPS Necessário / 4\`.
3.  **Relação com Energia:** No jogo, seu **Dano Base é igual à sua Energia Total Acumulada**.

A tabela abaixo estima o rank ideal para cada mundo, correlacionando o **Ganho de Energia Base** daquele rank com o dano necessário para enfrentar o chefe daquele mundo de forma eficiente.

**Importante:** Esta é uma análise teórica. Bônus de poderes, armas, pets, gamepasses e outros multiplicadores irão acelerar drasticamente sua progressão e permitir que você avance com ranks mais baixos do que os listados. Use esta tabela como uma referência de poder base.`,
  tags: ['rank', 'guia', 'estratégia', 'mundo', 'ideal', 'farm', 'dps', 'chefe'],
  imageUrl: 'wiki-6', // Reusing rank system image
  tables: {
    idealRank: {
      headers: ['Mundo', 'Chefe (Rank SS)', 'HP do Chefe', 'DPS (5 min kill)', 'Rank Ideal (Estimado)'],
      rows: [
        { 'Mundo': 1, 'Chefe (Rank SS)': 'Kid Kohan', 'HP do Chefe': '2.5Qd', 'DPS (5 min kill)': '8.33T', 'Rank Ideal (Estimado)': '15-20' },
        { 'Mundo': 2, 'Chefe (Rank SS)': 'Shanks', 'HP do Chefe': '5.0sx', 'DPS (5 min kill)': '16.67Qn', 'Rank Ideal (Estimado)': '20-25' },
        { 'Mundo': 3, 'Chefe (Rank SS)': 'Eizen', 'HP do Chefe': '2.5Sp', 'DPS (5 min kill)': '8.33sx', 'Rank Ideal (Estimado)': '25-30' },
        { 'Mundo': 4, 'Chefe (Rank SS)': 'Sakuni', 'HP do Chefe': '120.0Sp', 'DPS (5 min kill)': '400sx', 'Rank Ideal (Estimado)': '30-35' },
        { 'Mundo': 5, 'Chefe (Rank SS)': 'Rangoki', 'HP do Chefe': '31.2de', 'DPS (5 min kill)': '104N', 'Rank Ideal (Estimado)': '35-40' },
        { 'Mundo': 6, 'Chefe (Rank SS)': 'Statue of God', 'HP do Chefe': '195Ud', 'DPS (5 min kill)': '650de', 'Rank Ideal (Estimado)': '40-45' },
        { 'Mundo': 7, 'Chefe (Rank SS)': 'Novi Chroni', 'HP do Chefe': '101TdD', 'DPS (5 min kill)': '336DD', 'Rank Ideal (Estimado)': '45-50' },
        { 'Mundo': 8, 'Chefe (Rank SS)': 'Itechi/Madera', 'HP do Chefe': '~4.2QnD', 'DPS (5 min kill)': '14tdD', 'Rank Ideal (Estimado)': '50-55' },
        { 'Mundo': 9, 'Chefe (Rank SS)': 'Veggita', 'HP do Chefe': '2.46OcD', 'DPS (5 min kill)': '8.2SpD', 'Rank Ideal (Estimado)': '60-65' },
        { 'Mundo': 10, 'Chefe (Rank SS)': 'Ken Turbo', 'HP do Chefe': '494SxD', 'DPS (5 min kill)': '1.65SpD', 'Rank Ideal (Estimado)': '65-70' },
        { 'Mundo': 11, 'Chefe (Rank SS)': 'Killas Godspeed', 'HP do Chefe': '49.4Vgn', 'DPS (5 min kill)': '164NvD', 'Rank Ideal (Estimado)': '70-75' },
        { 'Mundo': 12, 'Chefe (Rank SS)': 'Garou Cósmico', 'HP do Chefe': '2.96DVg', 'DPS (5 min kill)': '9.8Uvg', 'Rank Ideal (Estimado)': '80-85' },
        { 'Mundo': 13, 'Chefe (Rank SS)': 'Esanor/Number 8', 'HP do Chefe': '~7.6DVg', 'DPS (5 min kill)': '25Uvg', 'Rank Ideal (Estimado)': '85-90' },
        { 'Mundo': 14, 'Chefe (Rank SS)': 'Valzora', 'HP do Chefe': '4.79SeV', 'DPS (5 min kill)': '16QnV', 'Rank Ideal (Estimado)': '90-95' },
        { 'Mundo': 15, 'Chefe (Rank SS)': 'The Paladin', 'HP do Chefe': '967SPG', 'DPS (5 min kill)': '3.2SeV', 'Rank Ideal (Estimado)': '95-100' },
        { 'Mundo': 16, 'Chefe (Rank SS)': 'Dio', 'HP do Chefe': '195NVG', 'DPS (5 min kill)': '650OVG', 'Rank Ideal (Estimado)': '100-105' },
        { 'Mundo': 17, 'Chefe (Rank SS)': 'Arama', 'HP do Chefe': '686UTG', 'DPS (5 min kill)': '2.3TGN', 'Rank Ideal (Estimado)': '105-110' },
        { 'Mundo': 18, 'Chefe (Rank SS)': 'Mr. Chainsaw', 'HP do Chefe': '1.5qTG', 'DPS (5 min kill)': '5tsTG', 'Rank Ideal (Estimado)': '110-115' },
        { 'Mundo': 19, 'Chefe (Rank SS)': 'Bansho', 'HP do Chefe': '605UTG', 'DPS (5 min kill)': '2.0TGN', 'Rank Ideal (Estimado)': '105-110' },
        { 'Mundo': 20, 'Chefe (Rank SSS)': 'Frezi Final Form', 'HP do Chefe': '47qTG', 'DPS (5 min kill)': '156tsTG', 'Rank Ideal (Estimado)': '115-120' },
        { 'Mundo': 21, 'Chefe (Rank SSS)': 'Vasto Ichge', 'HP do Chefe': '3.7ssTG', 'DPS (5 min kill)': '12.3QnTG', 'Rank Ideal (Estimado)': '120-125' },
      ],
    },
  },
};
