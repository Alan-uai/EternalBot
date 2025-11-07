
export const world3Data = {
  id: 'world-3',
  title: 'Mundo 3 - Ilha da Soul Society',
  summary: 'Mundo dos Shinigamis, introduzindo a Zangetsu como a primeira espada de energia.',
  npcs: [
    { name: 'Hollow', rank: 'E', exp: 1200, hp: '1T' },
    { name: 'Shinigami Novato', rank: 'D', exp: 1800, hp: '10T' },
    { name: 'Arrancar', rank: 'C', exp: 2500, hp: '100T' },
    { name: 'Tenente Shinigami', rank: 'B', exp: 3500, hp: '1qd' },
    { name: 'Capitão Shinigami', rank: 'A', exp: 5000, hp: '10qd' },
    { name: 'Ichigo', rank: 'S', exp: 7500, hp: '1.2Sp' },
    { name: 'Eizen', rank: 'SS', exp: 15000, hp: '2.2Sp', drops: { aura: { name: 'Aura do Traidor Roxo', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337718872965202/ScreenRecording_10-21-2025_10-30-50_1.mov?ex=68fa120e&is=68f8c08e&hm=8f03a2541a21bf69091297a2f4aa56de4f9b8615118efcb767705ff29e4fc60f&' },
  ],
  pets: [
    { name: 'Hime', rarity: 'Comum', energy_bonus: '19' },
    { name: 'Ichige', rarity: 'Incomum', energy_bonus: '38' },
    { name: 'Uryua', rarity: 'Raro', energy_bonus: '56' },
    { name: 'Rakiu', rarity: 'Raro', energy_bonus: '56' },
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
