export const world9Data = {
  id: 'world-9',
  title: 'Mundo 9 - Ilha dos Saiyajins',
  summary: 'Mundo inspirado em Dragon Ball, focado puramente em energia.',
  npcs: [
    { name: 'Saibaman', rank: 'E', exp: 15000000, hp: '1NvD' },
    { name: 'Nappa', rank: 'D', exp: 22000000, hp: '10NvD' },
    { name: 'Raditz', rank: 'C', exp: 32000000, hp: '100NvD' },
    { name: 'Ginyu', rank: 'B', exp: 45000000, hp: '1Vgn' },
    { name: 'Freeza', rank: 'A', exp: 65000000, hp: '10Vgn' },
    { name: 'Koku', rank: 'S', exp: 90000000, hp: '1.23OcD' },
    { name: 'Veggita', rank: 'SS', exp: 180000000, hp: '2.46OcD', drops: {} },
    { name: 'Ken Turbo', rank: 'SS', exp: 180000000, hp: '494sxD', drops: {} }
  ],
  pets: [
    { name: 'Pual', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.09x' },
    { name: 'Oolong', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.18x' },
    { name: 'Shenlong Bebê', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.27x' },
  ],
  shadows: [
    {
      id: 'veggita-shadow',
      name: 'Veggita Shadow',
      type: 'Energy',
      stats: [
        { rank: 'Rank SS', rarity: 'Phantom', bonus: '8% Energy' },
      ],
    },
  ],
  powers: [
    {
      name: 'Poder Saiyajin',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '5M',
      stats: [
        { name: 'Super Saiyajin', multiplier: '3x', rarity: 'Comum', probability: 25 },
        { name: 'Super Saiyajin 2', multiplier: '4.5x', rarity: 'Raro', probability: 7 },
        { name: 'Super Saiyajin Blue', multiplier: '8x', rarity: 'Phantom', probability: 0.1 },
      ],
    },
  ],
};
