
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
        { World: 1, Common: 'Kriluni', Uncommon: 'Ymicha', Rare: 'Tian Shan', Epic: 'Kohan', Legendary: 'Picco', Mythic: 'Koku', Phantom: 'Kid Kohan' },
        { World: 2, Common: 'Nomi', Uncommon: 'Usup', Rare: 'Robins', Epic: 'Senji', Legendary: 'Zaro', Mythic: 'Loffy', Phantom: 'Shanks' },
        { World: 3, Common: 'Hime', Uncommon: 'Ichige', Rare: 'Uryua', Epic: 'Rakiu', Legendary: 'Yoichi', Mythic: 'Kahara', Phantom: 'Eizen' },
        { World: 4, Common: 'Itodo', Uncommon: 'Nebara', Rare: 'Magum', Epic: 'Meki', Legendary: 'Tage', Mythic: 'Gajo', Phantom: 'Sakuni' },
        { World: 5, Common: 'Nazuki', Uncommon: 'Tenjaro', Rare: 'Zentsu', Epic: 'Insake', Legendary: 'Tamoka', Mythic: 'Shinabe', Phantom: 'Rangaki' },
        { World: 6, Common: 'Pedrinha', Uncommon: 'Golem Pequeno', Rare: 'Estátua Viva', Epic: 'N/A', Legendary: 'N/A', Mythic: 'N/A', Phantom: 'N/A' },
        { World: 7, Common: 'Ampulheta', Uncommon: 'Relógio de Bolso', Rare: 'Paradoxo Encapsulado', Epic: 'N/A', Legendary: 'N/A', Mythic: 'N/A', Phantom: 'N/A' },
        { World: 8, Common: 'Sapo', Uncommon: 'Lesma', Rare: 'Cobra', Epic: 'N/A', Legendary: 'N/A', Mythic: 'N/A', Phantom: 'Itechi/Madera' },
      ],
    },
  },
};
