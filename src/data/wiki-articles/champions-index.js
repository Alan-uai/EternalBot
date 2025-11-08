
export const championsIndexArticle = {
  id: 'champions-index',
  title: 'Champions Index',
  summary: 'Uma tabela de referência completa para os bônus de energia concedidos pelos Champions (pets) de cada mundo e raridade.',
  content: `Esta página serve como um índice para os bônus de energia de todos os Champions (pets) no jogo, organizados por mundo e raridade. Use estas tabelas para planejar quais pets farmar em cada estágio do jogo.`,
  tags: ['champions', 'pets', 'energia', 'index', 'guia', 'bônus'],
  imageUrl: 'wiki-5', // Reusing a relevant image
  tables: {
    world1_8: {
      headers: ['World', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom'],
      rows: [
        { World: 1, Common: '3', Uncommon: '6', Rare: '9', Epic: '12', Legendary: '15', Mythic: '20', Phantom: '45' },
        { World: 2, Common: '8', Uncommon: '15', Rare: '23', Epic: '30', Legendary: '38', Mythic: '50', Phantom: '113' },
        { World: 3, Common: '19', Uncommon: '38', Rare: '56', Epic: '75', Legendary: '94', Mythic: '125', Phantom: '281' },
        { World: 4, Common: '47', Uncommon: '94', Rare: '141', Epic: '188', Legendary: '234', Mythic: '313', Phantom: '703' },
        { World: 5, Common: '117', Uncommon: '234', Rare: '352', Epic: '469', Legendary: '596', Mythic: '781', Phantom: '1.75k' },
        { World: 6, Common: '293', Uncommon: '586', Rare: '879', Epic: '1.17k', Legendary: '1.46k', Mythic: '1.95k', Phantom: '4.39k' },
        { World: 7, Common: '732', Uncommon: '1.46k', Rare: '2.19k', Epic: '2.93k', Legendary: '3.66k', Mythic: '4.88k', Phantom: '10.9k' },
        { World: 8, Common: '1.83k', Uncommon: '3.66k', Rare: '5.49k', Epic: '7.32k', Legendary: '9.15k', Mythic: '12.2k', Phantom: '27.4k' },
      ],
    },
  },
};
