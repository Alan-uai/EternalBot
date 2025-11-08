
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
  },
};
