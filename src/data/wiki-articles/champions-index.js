
export const championsIndexArticle = {
  id: 'champions-index',
  title: 'Champions Index',
  summary: 'Uma tabela de referência completa para os bônus de energia concedidos pelos Champions (pets) de cada mundo e raridade.',
  content: `Esta página serve como um índice para os bônus de energia de todos os Champions (pets) no jogo, organizados por mundo e raridade. Use estas tabelas para planejar quais pets farmar em cada estágio do jogo.`,
  tags: ['champions', 'pets', 'energia', 'index', 'guia', 'bônus'],
  imageUrl: 'wiki-5', // Reusing a relevant image
  sharedHeaders: ['World', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
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
        { World: 9, Common: 'Pet Comum (4.57k)', Uncommon: 'Pet Incomum (9.15k)', Rare: 'Pet Raro (13.7k)', Epic: 'Pet Épico (18.3k)', Legendary: 'Pet Lendário (22.8k)', Mythic: 'Pet Mítico (30.5k)', Phantom: 'Pet Phantom (68.6k)' },
        { World: 10, Common: 'Pet Comum (11.4k)', Uncommon: 'Pet Incomum (22.8k)', Rare: 'Pet Raro (34.3k)', Epic: 'Pet Épico (45.7k)', Legendary: 'Pet Lendário (57.2k)', Mythic: 'Pet Mítico (76.2k)', Phantom: 'Pet Phantom (171k)' },
        { World: 11, Common: 'Pet Comum (28.6k)', Uncommon: 'Pet Incomum (57.2k)', Rare: 'Pet Raro (85.8k)', Epic: 'Pet Épico (114k)', Legendary: 'Pet Lendário (143k)', Mythic: 'Pet Mítico (190k)', Phantom: 'Pet Phantom (429k)' },
        { World: 12, Common: 'Pet Comum (71.5k)', Uncommon: 'Pet Incomum (143k)', Rare: 'Pet Raro (214k)', Epic: 'Pet Épico (286k)', Legendary: 'Pet Lendário (357k)', Mythic: 'Pet Mítico (476k)', Phantom: 'Pet Phantom (1.07M)' },
        { World: 13, Common: 'Pet Comum (178k)', Uncommon: 'Pet Incomum (357k)', Rare: 'Pet Raro (536k)', Epic: 'Pet Épico (715k)', Legendary: 'Pet Lendário (894k)', Mythic: 'Pet Mítico (1.19M)', Phantom: 'Pet Phantom (2.68M)' },
        { World: 14, Common: 'Pet Comum (447k)', Uncommon: 'Pet Incomum (894k)', Rare: 'Pet Raro (1.34M)', Epic: 'Pet Épico (1.78M)', Legendary: 'Pet Lendário (2.23M)', Mythic: 'Pet Mítico (2.98M)', Phantom: 'Pet Phantom (6.7M)' },
        { World: 15, Common: 'Pet Comum (1.11M)', Uncommon: 'Pet Incomum (2.23M)', Rare: 'Pet Raro (3.35M)', Epic: 'Pet Épico (4.47M)', Legendary: 'Pet Lendário (5.58M)', Mythic: 'Pet Mítico (7.45M)', Phantom: 'Pet Phantom (16.7M)' },
        { World: 16, Common: 'Pet Comum (2.79M)', Uncommon: 'Pet Incomum (5.58M)', Rare: 'Pet Raro (8.38M)', Epic: 'Pet Épico (11.1M)', Legendary: 'Pet Lendário (13.9M)', Mythic: 'Pet Mítico (18.6M)', Phantom: 'Pet Phantom (41.9M)' },
      ],
    },
    world17_24: {
      rows: [
        { World: 17, Common: 'Pet Comum (6.98M)', Uncommon: 'Pet Incomum (13.9M)', Rare: 'Pet Raro (20.9M)', Epic: 'Pet Épico (27.9M)', Legendary: 'Pet Lendário (34.9M)', Mythic: 'Pet Mítico (46.5M)', Phantom: 'Pet Phantom (104M)', Supreme: 'N/A' },
        { World: 18, Common: 'Pet Comum (17.4M)', Uncommon: 'Pet Incomum (34.9M)', Rare: 'Pet Raro (52.3M)', Epic: 'Pet Épico (69.8M)', Legendary: 'Pet Lendário (87.3M)', Mythic: 'Pet Mítico (116M)', Phantom: 'Pet Phantom (261M)', Supreme: 'Pet Supremo (392M)' },
        { World: 19, Common: 'Pet Comum (46.3M)', Uncommon: 'Pet Incomum (87.3M)', Rare: 'Pet Raro (130M)', Epic: 'Pet Épico (174M)', Legendary: 'Pet Lendário (218M)', Mythic: 'Pet Mítico (291M)', Phantom: 'Pet Phantom (654M)', Supreme: 'Pet Supremo (982M)' },
        { World: 20, Common: 'Pet Comum (109M)', Uncommon: 'Pet Incomum (218M)', Rare: 'Pet Raro (327M)', Epic: 'Pet Épico (436M)', Legendary: 'Pet Lendário (545M)', Mythic: 'Pet Mítico (727M)', Phantom: 'Pet Phantom (1.63M)', Supreme: 'Pet Supremo (2.45M)' },
        { World: 21, Common: 'Pet Comum (270M)', Uncommon: 'Pet Incomum (550M)', Rare: 'Pet Raro (820M)', Epic: 'Pet Épico (1.1B)', Legendary: 'Pet Lendário (1.4B)', Mythic: 'Pet Mítico (1.8B)', Phantom: 'Pet Phantom (4.1B)', Supreme: 'Pet Supremo (6.1B)' },
        { World: 22, Common: 'Pet Comum (675M)', Uncommon: 'Pet Incomum (1.37B)', Rare: 'Pet Raro (2.05B)', Epic: 'Pet Épico (2.75B)', Legendary: 'Pet Lendário (3.50B)', Mythic: 'Pet Mítico (4.50B)', Phantom: 'Pet Phantom (10.2B)', Supreme: 'Pet Supremo (15.2B)' },
        { World: 23, Common: 'Pet Comum (1.68B)', Uncommon: 'Pet Incomum (3.43B)', Rare: 'Pet Raro (5.12B)', Epic: 'Pet Épico (6.87B)', Legendary: 'Pet Lendário (8.75B)', Mythic: 'Pet Mítico (11.2B)', Phantom: 'Pet Phantom (25.6B)', Supreme: 'Pet Supremo (38.1B)' },
        { World: 24, Common: 'Pet Comum (4.21B)', Uncommon: 'Pet Incomum (8.59B)', Rare: 'Pet Raro (12.8B)', Epic: 'Pet Épico (17.1B)', Legendary: 'Pet Lendário (21.8B)', Mythic: 'Pet Mítico (28.1B)', Phantom: 'Pet Phantom (64B)', Supreme: 'Pet Supremo (95.3B)' },
      ]
    }
  },
};
