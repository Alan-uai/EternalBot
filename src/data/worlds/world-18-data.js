
export const world18Data = {
  id: 'world-18',
  title: 'Mundo 18 - Ilha da Motosserra',
  summary: 'Mundo caótico com demônios, a Chainsaw Defense e o Ghost Power.',
  npcs: [
    { name: 'Zombie Devil', rank: 'E', exp: 3e13, hp: '1SpTG' },
    { name: 'Bat Devil', rank: 'D', exp: 4.5e13, hp: '10SpTG' },
    { name: 'Leech Devil', rank: 'C', exp: 6.5e13, hp: '100SpTG' },
    { name: 'Eternity Devil', rank: 'B', exp: 9.5e13, hp: '1OcTG' },
    { name: 'Katana Man', rank: 'A', exp: 1.4e14, hp: '10OcTG' },
    { name: 'Bomb Devil', rank: 'S', exp: 2e14, hp: '750TGN' },
    { name: 'Mr Chainsaw', rank: 'SS', exp: 4e14, hp: '5.09tsTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338941923496026/ScreenRecording_10-21-2025_11-00-03_1.mov?ex=68fa1332&is=68f8c1b2&hm=0bc17f9c2efa77168b3ab5a8b898fc690d04905f947b98600ba8e695b8c35264&', drops: {} },
    { name: 'Hero of Hell', rank: 'SSS', exp: 4e14, hp: '50.9qTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338996147327036/ScreenRecording_10-21-2025_11-01-18_1.mov?ex=68fa133f&is=68f8c1bf&hm=69be22d6c3e37af36d71ae7d5195e3a66c23e289ce11c659fdcb11894faf5378&', drops: {} },
  ],
  pets: [
    { name: 'Pochita', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.18x' },
    { name: 'Gato', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.36x' },
    { name: 'Anjo', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.54x' },
  ],
  powers: [
    {
      name: 'Halloween Ghost Power',
      type: 'gacha',
      statType: 'energy',
      description: 'Poder de energia do evento de Halloween, evoluído com "Eyes".',
      stats: [
        { name: 'Common Ghost', rarity: 'Common', stats: '0.5x', stats_lvl_100: '1x', cost: '11k Eyes' },
        { name: 'Uncommon Ghost', rarity: 'Uncommon', stats: '1x', stats_lvl_100: '2x', cost: '21k Eyes' },
        { name: 'Rare Ghost', rarity: 'Rare', stats: '1.5x', stats_lvl_100: '3x', cost: '31k Eyes' },
        { name: 'Epic Ghost', rarity: 'Epic', stats: '2.5x', stats_lvl_100: '5x', cost: '41k Eyes' },
        { name: 'Legendary Ghost', rarity: 'Legendary', stats: '3.5x', stats_lvl_100: '6.47x', cost: '50k Eyes' },
        { name: 'Mythic Ghost', rarity: 'Mythic', stats: '5.5x', stats_lvl_100: '9.62x', cost: '60k Eyes' },
        { name: 'Phantom Ghost', rarity: 'Phantom', stats: '7.5x', stats_lvl_100: '11.2x', cost: '70k Eyes' },
        { name: 'Supreme Ghost', rarity: 'Supreme', stats: '10x', stats_lvl_100: '15x', cost: '200k Eyes' },
      ],
    },
  ],
  dungeons: [
      { name: 'Chainsaw Defense', boss: 'Gun Devil', description: 'Uma raid de defesa contra hordas de demônios.'}
  ],
  accessories: [
    { 
      id: 'pokita-slides', 
      name: 'Pokita Slides', 
      slot: 'Leg',
      world: '18', 
      npc: 'Hero of Hell', 
      rank: 'SSS-Rank', 
      bonuses: [
        { 
          type: 'energy', 
          valuesByRarity: [
            { "rarity": "Common", "value": "0.3x" },
            { "rarity": "Uncommon", "value": "0.45x" },
            { "rarity": "Rare", "value": "0.6x" },
            { "rarity": "Epic", "value": "0.75x" },
            { "rarity": "Legendary", "value": "0.9x" },
            { "rarity": "Mythic", "value": "1.05x" },
            { "rarity": "Phantom", "value": "2x" },
            { "rarity": "Supreme", "value": "2.25x" }
          ]
        },
        { 
          type: 'movespeed', 
          valuesByRarity: [
            { "rarity": "Common", "value": "13.3%" },
            { "rarity": "Uncommon", "value": "20%" },
            { "rarity": "Rare", "value": "26.6%" },
            { "rarity": "Epic", "value": "33.3%" },
            { "rarity": "Legendary", "value": "40%" },
            { "rarity": "Mythic", "value": "46.6%" },
            { "rarity": "Phantom", "value": "66.5%" },
            { "rarity": "Supreme", "value": "100%" }
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
      description: "Missão de Licença de Herói (Rank B), com tarefas neste mundo."
    }
  ]
};
