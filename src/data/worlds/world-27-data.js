// src/data/worlds/world-27-data.js

export const world27Data = {
  id: 'world-27',
  title: 'Mundo 27 - ???',
  summary: 'Um mundo misterioso, lar de demônios e seres infernais.',
  tags: ['mundo 27', 'guia', 'demonio'],
  npcs: [
    { name: 'Demônio Inferior', rank: 'E', exp: 0, hp: '6.69T' },
    { name: 'Demônio Comum', rank: 'D', exp: 0, hp: '13.3T' },
    { name: 'Demônio Superior', rank: 'C', exp: 0, hp: '20T' },
    { name: 'Arquidemônio', rank: 'B', exp: 0, hp: '26.7T' },
    { name: 'Lorde Demônio', rank: 'A', exp: 0, hp: '33.4T' },
    { name: 'Rei Demônio', rank: 'S', exp: 0, hp: '44.6T' },
    { name: 'Satanás', rank: 'SS', exp: 0, hp: '133T', videoUrl: '', drops: {} },
    { name: 'Lúcifer', rank: 'SSS', exp: 0, hp: '160T', videoUrl: '', drops: {} },
  ],
  powers: [],
  dungeons: [],
  accessories: [
      {
      id: 'queen-boots',
      name: 'Queen Boots',
      slot: 'Leg',
      world: '27',
      npc: 'Blood Queen',
      rank: 'SS-Rank',
      bonuses: [
        {
          type: 'energy',
          valuesByRarity: [
            { rarity: 'Common', value: '0.5x' },
            { rarity: 'Uncommon', value: '0.75x' },
            { rarity: 'Rare', value: '1.x' },
            { rarity: 'Epic', value: '1.25x' },
            { rarity: 'Legendary', value: '1.5x' },
            { rarity: 'Mythic', value: '1.75x' },
            { rarity: 'Phantom', value: '2.5x' },
            { rarity: 'Supreme', value: '3.75x' }
          ]
        },
        {
          type: 'movespeed',
          valuesByRarity: [
            { rarity: 'Common', value: '13.3%' },
            { rarity: 'Uncommon', value: '20%' },
            { rarity: 'Rare', value: '26.6%' },
            { rarity: 'Epic', value: '33.3%' },
            { rarity: 'Legendary', value: '40%' },
            { rarity: 'Mythic', value: '46.6%' },
            { rarity: 'Phantom', value: '66.5%' },
            { rarity: 'Supreme', value: '100%' }
          ]
        }
      ]
    }
  ],
  missions: [
     {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank S), com tarefas neste mundo."
    }
  ],
};
