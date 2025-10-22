
export const world15Data = {
  id: 'world-15',
  title: 'Mundo 15 - Ilha Virtual',
  summary: 'Mundo de SAO, com a espada de energia Lucidator e a Gleam Raid.',
  npcs: [
    { name: 'Lobo', rank: 'E', exp: 2.2e11, hp: '1UTG' },
    { name: 'Javali', rank: 'D', exp: 3.2e11, hp: '10UTG' },
    { name: 'Goblin', rank: 'C', exp: 4.8e11, hp: '100UTG' },
    { name: 'Ogro', rank: 'B', exp: 7e11, hp: '1DTG' },
    { name: 'Ceifador', rank: 'A', exp: 1e12, hp: '10DTG' },
    { name: 'Kayaba', rank: 'S', exp: 1.5e12, hp: '483SPG' },
    { name: 'The Paladin', rank: 'SS', exp: 3e12, hp: '967SPG', drops: { aura: { name: 'Aura Virtual', probability: 0.05 } } },
  ],
  pets: [
    { name: 'Slime', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.15x' },
    { name: 'Pina', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.30x' },
    { name: 'Yui', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.45x' },
  ],
  powers: [
    {
      name: 'Habilidade de Espada',
      type: 'gacha',
      statType: 'mixed',
      unlockCost: '500M',
      stats: [
        { name: 'Corte Vertical', multiplier: '2.0x', rarity: 'Comum', probability: 30, statType: 'damage' },
        { name: 'Explosão Estelar', multiplier: '5.0x', rarity: 'Raro', probability: 5, statType: 'damage' },
        { name: 'Vontade Encarnada', multiplier: '10x', rarity: 'Phantom', probability: 0.05, statType: 'energy' },
      ],
    },
     {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói, com tarefas neste mundo."
    }
  ],
  dungeons: [
      { name: 'Gleam Raid', boss: 'The Gleam Eyes', description: 'Uma raid de desafio individual com 10 ondas.'}
  ]
};
