
export const world3Data = {
  id: 'world-3',
  title: 'Mundo 3 - Ilha da Soul Society',
  summary: 'Mundo dos Shinigamis, introduzindo a Zangetsu como a primeira espada de energia.',
  npcs: [
    { name: 'Hime', rank: 'E', exp: 21, hp: '150T', drops: { coins: { amount: 'x5k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x21', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.1 } } },
    { name: 'Ichige', rank: 'D', exp: 22, hp: '2.5qd', drops: { coins: { amount: 'x10k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x22', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.11 }, weapon: { name: 'Zangetsu', probability: 0.25 } } },
    { name: 'Uryua', rank: 'C', exp: 23, hp: '55qd', drops: { coins: { amount: 'x15k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x23', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.125 } } },
    { name: 'Rakiu', rank: 'B', exp: 24, hp: '160qd', drops: { coins: { amount: 'x20k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x24', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.15 } } },
    { name: 'Kahara', rank: 'S', exp: 26, hp: '1Qn', drops: { coins: { amount: 'x30k', probability: 1 }, 'Reiatsu Token': { amount: 'x1-5', probability: 0.1 }, 'Pressure Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x26', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.25 } } },
    { name: 'Eizen', rank: 'SS', exp: 60, hp: '2.5Sp', drops: { coins: { amount: 'x70k', probability: 1 }, 'Zanpakuto Token': { amount: 'x3-5', probability: 0.1 }, 'Reiatsu Token': { amount: 'x3-5', probability: 0.1 }, 'Pressure Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x60', probability: 1 }, 'Avatar Soul': { amount: 'x1', probability: 0.5 }, aura: { name: 'Purple Traitor Aura', probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337718872965202/ScreenRecording_10-21-2025_10-30-50_1.mov?ex=68fa120e&is=68f8c08e&hm=8f03a2541a21bf69091297a2f4aa56de4f9b8615118efcb767705ff29e4fc60f&' },
  ],
  pets: [
    { name: 'Hime', rarity: 'Comum', energy_bonus: '19' },
    { name: 'Ichige', rarity: 'Incomum', energy_bonus: '38' },
    { name: 'Uryua', rarity: 'Raro', energy_bonus: '56' },
    { name: 'Rakiu', rarity: 'Épico', energy_bonus: '75' },
    { name: 'Yoichi', rarity: 'Lendário', energy_bonus: '94' },
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
  missions: [
    {
        name: 'Missão #1',
        requirement: 'Derrotar 30 Hollows',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '2k' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Shinigami Novato',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Shinigami Power Token', amount: 10 },
            { name: 'Exp', amount: '3k' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Arrancar',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Drop Percent', amount: '2%' },
            { name: 'Exp', amount: '4.5k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Tenente Shinigami',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Avatar Soul', amount: 20 },
            { name: 'Exp', amount: '6k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Capitão Shinigami',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Shinigami Power Token', amount: 20 },
            { name: 'Exp', amount: '8k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Ichigo',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Pet Chest', amount: 1 },
            { name: 'Joia', amount: 1 },
            { name: 'Exp', amount: '10k' }
        ]
    }
  ]
};
