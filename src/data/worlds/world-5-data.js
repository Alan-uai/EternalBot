
export const world5Data = {
  id: 'world-5',
  title: 'Mundo 5 - Ilha dos Caçadores',
  summary: 'Mundo focado em caçadores, com a espada de energia Yellow Nichirin.',
  npcs: [
    { name: 'Oni', rank: 'E', exp: 25000, hp: '100N' },
    { name: 'Mizunoto', rank: 'D', exp: 35000, hp: '500N' },
    { name: 'Mizunoe', rank: 'C', exp: 50000, hp: '1de' },
    { name: 'Kanoto', rank: 'B', exp: 70000, hp: '10de' },
    { name: 'Kanoe', rank: 'A', exp: 100000, hp: '50de' },
    { name: 'Hashira', rank: 'S', exp: 150000, hp: '15.6de' },
    { name: 'Rangoki', rank: 'SS', exp: 300000, hp: '31.2de', drops: { aura: { name: 'Aura Flamejante', probability: 0.05 } } },
  ],
  pets: [
    { name: 'Corvo Kasugai', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.05x' },
    { name: 'Pardal', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.10x' },
    { name: 'Nezuko na Caixa', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.15x' },
  ],
  powers: [
    {
      name: 'Respiração',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '250k',
      stats: [
        { name: 'Respiração da Água', multiplier: '1.8x', rarity: 'Comum', probability: 35 },
        { name: 'Respiração do Trovão', multiplier: '2.2x', rarity: 'Incomum', probability: 25 },
        { name: 'Respiração do Sol', multiplier: '5x', rarity: 'Phantom', probability: 0.2, energy_crit_bonus: '1.50%' },
      ],
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank E), com tarefas neste mundo."
    }
  ]
};


