
export const championsIndexArticle = {
  id: 'champions-index',
  title: 'Champions Index',
  summary: 'Uma tabela de referência completa para os bônus de energia concedidos pelos Champions (pets) de cada mundo e raridade.',
  content: `Esta página serve como um índice para os bônus de energia de todos os Champions (pets) no jogo, organizados por mundo e raridade. Use estas tabelas para planejar quais pets farmar em cada estágio do jogo.`,
  tags: ['champions', 'pets', 'energia', 'index', 'guia', 'bônus'],
  imageUrl: 'wiki-5', // Reusing a relevant image
  sharedHeaders: ['World', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom'],
  tables: {
    world1_8: {
      rows: [
        { World: 1, Common: 'Kriluni (3)', Uncommon: 'Ymicha (6)', Rare: 'Tian Shan (9)', Epic: 'Kohan (12)', Legendary: 'Picco (15)', Mythic: 'Koku (20)', Phantom: 'Kid Kohan (45)' },
        { World: 2, Common: 'Nomi (8)', Uncommon: 'Usup (15)', Rare: 'Robins (23)', Epic: 'Senji (30)', Legendary: 'Zaro (38)', Mythic: 'Loffy (50)', Phantom: 'Shanks (113)' },
        { World: 3, Common: 'Hime (19)', Uncommon: 'Ichige (38)', Rare: 'Uryua (56)', Epic: 'Rakiu (75)', Legendary: 'Yoichi (94)', Mythic: 'Kahara (125)', Phantom: 'Eizen (281)' },
        { World: 4, Common: 'Itodo (47)', Uncommon: 'Nebara (94)', Rare: 'Magum (141)', Epic: 'Meki (188)', Legendary: 'Tage (234)', Mythic: 'Gajo (313)', Phantom: 'Sakuni (703)' },
        { World: 5, Common: 'Nazuki (117)', Uncommon: 'Tenjaro (234)', Rare: 'Zentsu (352)', Epic: 'Insake (469)', Legendary: 'Tamoka (596)', Mythic: 'Shinabe (781)', Phantom: 'Rangaki (1.75k)' },
        { World: 6, Common: 'Pedrinha (293)', Uncommon: 'Golem Pequeno (586)', Rare: 'Estátua Viva (879)', Epic: 'N/A (1.17k)', Legendary: 'N/A (1.46k)', Mythic: 'N/A (1.95k)', Phantom: 'N/A (4.39k)' },
        { World: 7, Common: 'Ampulheta (732)', Uncommon: 'Relógio de Bolso (1.46k)', Rare: 'Paradoxo Encapsulado (2.19k)', Epic: 'N/A (2.93k)', Legendary: 'N/A (3.66k)', Mythic: 'N/A (4.88k)', Phantom: 'N/A (10.9k)' },
        { World: 8, Common: 'Sapo (1.83k)', Uncommon: 'Lesma (3.66k)', Rare: 'Cobra (5.49k)', Epic: 'N/A (7.32k)', Legendary: 'N/A (9.15k)', Mythic: 'N/A (12.2k)', Phantom: 'Itechi/Madera (27.4k)' },
      ],
    },
    world9_16: {
      rows: [
        { World: 9, Common: '4.57k', Uncommon: '9.15k', Rare: '13.7k', Epic: '18.3k', Legendary: '22.8k', Mythic: '30.5k', Phantom: '68.6k' },
        { World: 10, Common: '11.4k', Uncommon: '22.8k', Rare: '34.3k', Epic: '45.7k', Legendary: '57.2k', Mythic: '76.2k', Phantom: '171k' },
        { World: 11, Common: '28.6k', Uncommon: '57.2k', Rare: '85.8k', Epic: '114k', Legendary: '143k', Mythic: '190k', Phantom: '429k' },
        { World: 12, Common: '71.5k', Uncommon: '143k', Rare: '214k', Epic: '286k', Legendary: '357k', Mythic: '476k', Phantom: '1.07M' },
        { World: 13, Common: '178k', Uncommon: '357k', Rare: '536k', Epic: '715k', Legendary: '894k', Mythic: '1.19M', Phantom: '2.68M' },
        { World: 14, Common: '447k', Uncommon: '894k', Rare: '1.34M', Epic: '1.78M', Legendary: '2.23M', Mythic: '2.98M', Phantom: '6.7M' },
        { World: 15, Common: '1.11M', Uncommon: '2.23M', Rare: '3.35M', Epic: '4.47M', Legendary: '5.58M', Mythic: '7.45M', Phantom: '16.7M' },
        { World: 16, Common: '2.79M', Uncommon: '5.58M', Rare: '8.38M', Epic: '11.1M', Legendary: '13.9M', Mythic: '18.6M', Phantom: '41.9M' },
      ],
    },
  },
};
