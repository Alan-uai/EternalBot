
export const world14Data = {
  id: 'world-14',
  title: 'Mundo 14 - Ilha da Magia',
  summary: 'Mundo de Clover, focado em sorte e energia.',
  npcs: [
    { name: 'Plebeu Mágico', rank: 'E', exp: 4.5e10, hp: '1NVG' },
    { name: 'Nobre Mágico', rank: 'D', exp: 6.5e10, hp: '10NVG' },
    { name: 'Cavaleiro Mágico', rank: 'C', exp: 9.5e10, hp: '100NVG' },
    { name: 'Vice-Capitão', rank: 'B', exp: 1.4e11, hp: '1TGN' },
    { name: 'Capitão', rank: 'A', exp: 2e11, hp: '10TGN' },
    { name: 'Rei Mago', rank: 'S', exp: 3e11, hp: '2.39SeV' },
    { name: 'Valzora', rank: 'SS', exp: 6e11, hp: '4.79SeV', drops: {} },
  ],
  pets: [
    { name: 'Grimório', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.14x' },
    { name: 'Pássaro Anti-Magia', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.28x' },
    { name: 'Diabinho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.42x' },
  ],
  shadows: [
    {
      id: 'valzora-shadow',
      name: 'Valzora Shadow',
      type: 'Energy',
      stats: [
        { rank: 'Rank SS', rarity: 'Phantom', bonus: '12% Energy' },
      ],
    },
  ],
  powers: [
    {
      name: 'Poder Mágico',
      type: 'progression',
      statType: 'luck',
      maxLevel: 40,
      maxBoost: '40% Star Luck',
      unlockCost: '250M',
    },
  ],
};
