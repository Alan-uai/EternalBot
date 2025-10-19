export const world19Data = {
  id: 'world-19',
  title: 'Mundo 19 - Ilha do Inferno',
  summary: 'Um mundo infernal com múltiplos chefes e a espada de energia Excalibur.',
  npcs: [
    { name: 'Diabo de Fogo', rank: 'E', exp: 1.5e14, hp: '1NoTG' },
    { name: 'Diabo de Gelo', rank: 'D', exp: 2.2e14, hp: '10NoTG' },
    { name: 'Diabo das Sombras', rank: 'C', exp: 3.2e14, hp: '100NoTG' },
    { name: 'Diabo da Morte', rank: 'B', exp: 4.8e14, hp: '1QDR' },
    { name: 'Lúcifer', rank: 'A', exp: 7e14, hp: '10QDR' },
    { name: 'Satan', rank: 'S', exp: 1e15, hp: '60.5UTG' },
    { name: 'Hero of Hell', rank: 'SS', exp: 2e15, hp: '121UTG', drops: {} },
    { name: 'Leonardo', rank: 'SS', exp: 2e15, hp: '121UTG', drops: {} },
    { name: 'Bansho', rank: 'SS', exp: 1e16, hp: '605UTG', drops: {} },
  ],
  pets: [
    { name: 'Cérbero', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.38x' },
    { name: 'Diabrete', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.57x' },
  ],
  powers: [
    {
      name: 'Poder Infernal',
      type: 'progression',
      statType: 'damage',
      maxLevel: 50,
      maxBoost: '50% Damage',
      unlockCost: '2B',
    },
  ],
};
