export const world12Data = {
  id: 'world-12',
  title: 'Mundo 12 - Ilha dos Heróis',
  summary: 'Um mundo de super-heróis com foco em um misto de dano e energia.',
  npcs: [
    { name: 'Vilão de Rua', rank: 'E', exp: 1.8e9, hp: '1QnV' },
    { name: 'Vilão Classe Tigre', rank: 'D', exp: 2.5e9, hp: '10QnV' },
    { name: 'Vilão Classe Demônio', rank: 'C', exp: 3.8e9, hp: '100QnV' },
    { name: 'Vilão Classe Dragão', rank: 'B', exp: 5.5e9, hp: '1SeV' },
    { name: 'Ameaça Nível Deus', rank: 'A', exp: 8e9, hp: '10SeV' },
    { name: 'Herói Careca', rank: 'S', exp: 1.2e10, hp: '1.48DVg' },
    { name: 'Garou Cósmico', rank: 'SS', exp: 2.4e10, hp: '2.96DVg', drops: {} },
  ],
  pets: [
    { name: 'Cão de Guarda', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.12x' },
    { name: 'Genos Jr.', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.24x' },
    { name: 'Mosquito', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.36x' },
  ],
  shadows: [
    {
      id: 'garou-shadow',
      name: 'Garou Shadow',
      type: 'Damage',
      stats: [
        { rank: 'Rank SS', rarity: 'Phantom', bonus: '10% Damage', cooldown: '2s' },
      ],
    },
  ],
  powers: [
    {
      name: 'Poder do Herói',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 35,
      unlockCost: '50M',
      boosts: [
        { type: 'damage', value: '20% Damage' },
        { type: 'energy', value: '15% Energy' },
      ],
    },
  ],
};
