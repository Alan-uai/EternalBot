export const world6Data = {
  id: 'world-6',
  title: 'Mundo 6 - Ilha da Estátua',
  summary: 'Introduz o sistema de Shadows, que são lutadores especiais dropados por chefes.',
  npcs: [
    { name: 'Cavaleiro de Pedra', rank: 'E', exp: 120000, hp: '1DD' },
    { name: 'Gárgula', rank: 'D', exp: 180000, hp: '10DD' },
    { name: 'Golem', rank: 'C', exp: 250000, hp: '100DD' },
    { name: 'Guardião de Pedra', rank: 'B', exp: 350000, hp: '1tD' },
    { name: 'Colosso de Pedra', rank: 'A', exp: 500000, hp: '10tD' },
    { name: 'General de Pedra', rank: 'S', exp: 750000, hp: '97.5Ud' },
    { name: 'Statue of God', rank: 'SS', exp: 1500000, hp: '195Ud', drops: { aura: { name: 'Aura da Estátua', probability: 0.05 } } },
  ],
  pets: [
    { name: 'Pedrinha', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.06x' },
    { name: 'Golem Pequeno', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.12x' },
    { name: 'Estátua Viva', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.18x' },
  ],
  shadows: [
    {
      id: 'statue-shadow',
      name: 'Shadow of God',
      type: 'Energy',
      stats: [
        { rank: 'Rank S', rarity: 'Mítico', bonus: '1% Energy' },
        { rank: 'Rank SS', rarity: 'Phantom', bonus: '5% Energy' },
      ],
    },
  ],
  powers: [
    {
      name: 'Poder da Terra',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 25,
      unlockCost: '500k',
      boosts: [
          { type: 'damage', value: '15% Damage' },
          { type: 'energy', value: '10% Energy' }
      ]
    },
  ],
};
