// src/data/worlds/world-27-data.js

export const world27Data = {
  id: 'world-27',
  title: 'Mundo 27 - ???',
  summary: 'Um mundo misterioso, lar de demônios e seres infernais.',
  tags: ['mundo 27', 'guia', 'demonio'],
  npcs: [
    { name: 'Demônio Inferior', rank: 'E', exp: 0, hp: '6.69T' },
    { name: 'Demônio Comum', rank: 'D', exp: 0, hp: '13.3T', drops: { aura: { name: 'Pink Oni Aura', probability: 0.05 } } },
    { name: 'Demônio Superior', rank: 'C', exp: 0, hp: '20T', drops: { aura: { name: 'Blue Oni Aura', probability: 0.05 } } },
    { name: 'Arquidemônio', rank: 'B', exp: 0, hp: '26.7T' },
    { name: 'Lorde Demônio', rank: 'A', exp: 0, hp: '33.4T' },
    { name: 'Rei Demônio', rank: 'S', exp: 0, hp: '44.6T' },
    { name: 'Satanás', rank: 'SS', exp: 0, hp: '133T', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1439264548044410911/ScreenRecording_11-15-2025_06-40-50_1.mov?ex=691dd790&is=691c8610&hm=4943ea86e0e26d9c9a71ded77ecdb7ce2cb5b16dac62edbe567afa70c1280b24&', drops: {} },
    { name: 'Lúcifer', rank: 'SSS', exp: 0, hp: '160T', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1439264602452918375/ScreenRecording_11-15-2025_06-41-14_1.mov?ex=691dd79d&is=691c861d&hm=c5aed428da14a16880106fbcfebb88c8c904cf11a7882bbdf325f998341b618f&', drops: {} },
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
