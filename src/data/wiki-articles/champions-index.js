
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
    world9_16: {
      headers: ['World', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom'],
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
    world17_24: {
      headers: ['World', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Phantom', 'Supreme'],
      rows: [
        { World: 17, Common: '6.98M', Uncommon: '13.9M', Rare: '20.9M', Epic: '27.9M', Legendary: '34.9M', Mythic: '46.5M', Phantom: '104M', Supreme: 'N/A' },
        { World: 18, Common: '17.4M', Uncommon: '34.9M', Rare: '52.3M', Epic: '69.8M', Legendary: '87.3M', Mythic: '116M', Phantom: '261M', Supreme: '392M' },
        { World: 19, Common: '46.3M', Uncommon: '87.3M', Rare: '130M', Epic: '174M', Legendary: '218M', Mythic: '291M', Phantom: '654M', Supreme: '982M' },
        { World: 20, Common: '109M', Uncommon: '218M', Rare: '327M', Epic: '436M', Legendary: '545M', Mythic: '727M', Phantom: '1.63M', Supreme: '2.45M' },
        { World: 21, Common: '270M', Uncommon: '550M', Rare: '820M', Epic: '1.1B', Legendary: '1.4B', Mythic: '1.8B', Phantom: '4.1B', Supreme: '6.1B' },
        { World: 22, Common: '675M', Uncommon: '1.37B', Rare: '2.05B', Epic: '2.75B', Legendary: '3.50B', Mythic: '4.50B', Phantom: '10.2B', Supreme: '15.2B' },
        { World: 23, Common: '1.68B', Uncommon: '3.43B', Rare: '5.12B', Epic: '6.87B', Legendary: '8.75B', Mythic: '11.2B', Phantom: '25.6B', Supreme: '38.1B' },
        { World: 24, Common: '4.21B', Uncommon: '8.59B', Rare: '12.8B', Epic: '17.1B', Legendary: '21.8B', Mythic: '28.1B', Phantom: '64B', Supreme: '95.3B' },
      ],
    },
  },
};
