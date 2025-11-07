
export const world3Data = {
  id: 'world-3',
  title: 'Mundo 3 - Ilha da Soul Society',
  summary: 'Mundo dos Shinigamis, introduzindo a Zangetsu como a primeira espada de energia.',
  npcs: [
    { name: 'Hime', rank: 'E', exp: 21, hp: '150T', drops: { coins: { amount: 'x5k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x21', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.1 } } },
    { name: 'Ichige', rank: 'D', exp: 22, hp: '2.5qd', drops: { coins: { amount: 'x10k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x22', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.11 }, weapon: { name: 'Zangetsu', probability: 0.25 } } },
    { name: 'Uryua', rank: 'C', exp: 23, hp: '55qd', drops: { coins: { amount: 'x15k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x23', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.125 } } },
    { name: 'Yoichi', rank: 'A', exp: 25, hp: '450qd', drops: { coins: { amount: 'x25k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x25', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.2 } } },
    { name: 'Ichigo', rank: 'S', exp: 26, hp: '1Qn', drops: { coins: { amount: 'x30k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x26', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.25 } } },
    { name: 'Eizen', rank: 'SS', exp: 60, hp: '2.5Sp', drops: { coins: { amount: 'x70k', probability: 1 }, 'Zanpakuto Token': { amount: 'x3-5', probability: 0.1 }, 'Reiatsu Token': { amount: 'x3-5', probability: 0.1 }, 'Pressure Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x60', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.5 }, aura: { name: 'Purple Traitor Aura', probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337718872965202/ScreenRecording_10-21-2025_10-30-50_1.mov?ex=68fa120e&is=68f8c08e&hm=8f03a2541a21bf69091297a2f4aa56de4f9b8615118efcb767705ff29e4fc60f&' },
  ],
  pets: [
    { name: 'Hime', rarity: 'Comum', energy_bonus: '19' },
    { name: 'Ichige', rarity: 'Incomum', energy_bonus: '38' },
    { name: 'Uryua', rarity: 'Raro', energy_bonus: '56' },
    { name: 'Rakiu', rarity: 'Raro', energy_bonus: '75' },
    { name: 'Yoichi', rarity: 'Épico', energy_bonus: '94' },
    { name: 'Kahara', rarity: 'Mítico', energy_bonus: '125' },
    { name: 'Eizen', rarity: 'Phantom', energy_bonus: '281' },
  ],
  powers: [
    {
      name: 'Shinigami Power',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '10k',
      stats: [
        { name: 'Shikai', multiplier: '1.5x', rarity: 'Comum', probability: 40 },
        { name: 'Bankai', multiplier: '2.5x', rarity: 'Raro', probability: 10 },
        { name: 'Final Getsuga Tenshou', multiplier: '4x', rarity: 'Phantom', probability: 0.3, energy_crit_bonus: '1.00%' },
      ],
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Classe F), com tarefas neste mundo."
    }
  ],
  accessories: [
      { id: 'sandalia-shinigami', name: 'Sandália Shinigami', world: 'Mundo 3', boss: 'Eizen', rarity: 'Raro', movespeed_bonus: '10%' }
  ],
  dungeons: [
      { name: 'Las Noches', boss: 'Ulquiorra', description: 'O palácio dos Arrancars em Hueco Mundo.'}
  ],
  obelisks: [
    {
      id: 'soul-obelisk',
      name: 'Soul Obelisk',
      description: 'Um obelisco comum que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Eizen 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Star Luck', amount: '5%' },
          { name: 'Exp', amount: '6k' },
          { name: 'Avatar Soul', amount: 100 },
          { name: 'Energy Potion', amount: 1 }
        ]
      },
      boosts: [
        { type: 'Energy Multiply', value: '0.15x' },
        { type: 'Damage Multiply', value: '0.25x' },
        { type: 'Exp Percent', value: '3.5%' }
      ]
    }
  ],
  missions: [
    {
        name: 'Missão #1',
        requirement: 'Derrotar 30 Hime',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Reiatsu Token', amount: 10 },
            { name: 'Exp', amount: '630' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Ichige',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Reiatsu Token', amount: 15 },
            { name: 'Exp', amount: '800' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Uryua',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Pet Chest', amount: 1 },
            { name: 'Drop Percent', amount: '3%' },
            { name: 'Exp', amount: '1.3k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Rakiu',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Drop Percent', amount: '3%' },
            { name: 'Exp', amount: '1.8k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Yoichi',
        rewards: [
            { name: 'Avatar Soul', amount: 5 },
            { name: 'Reiatsu Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '2.5k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Ichigo',
        rewards: [
            { name: 'Avatar Soul', amount: 10 },
            { name: 'Pet Chest', amount: 1 },
            { name: 'Reiatsu Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '2.6k' }
        ]
    }
  ]
};
