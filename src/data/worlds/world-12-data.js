
export const world12Data = {
  id: 'world-12',
  title: 'Mundo 12 - Ilha dos Heróis',
  summary: 'Um mundo de super-heróis com foco em um misto de dano e energia. Contém a Raid Sins para upgrades.',
  npcs: [
    { name: 'Vilão de Rua', rank: 'E', exp: 1.8e9, hp: '1QnV' },
    { name: 'Vilão Classe Tigre', rank: 'D', exp: 2.5e9, hp: '10QnV' },
    { name: 'Vilão Classe Demônio', rank: 'C', exp: 3.8e9, hp: '100QnV' },
    { name: 'Vilão Classe Dragão', rank: 'B', exp: 5.5e9, hp: '1SeV' },
    { name: 'Ameaça Nível Deus', rank: 'A', exp: 8e9, hp: '10SeV' },
    { name: 'Herói Careca', rank: 'S', exp: 1.2e10, hp: '1.48DVg' },
    { name: 'Garou Cósmico', rank: 'SS', exp: 2.4e10, hp: '2.96DVg', drops: {} },
    { name: 'Escanor', rank: 'SS', exp: 2.4e10, hp: '9.77DVg', drops: {} },
  ],
  pets: [
    { name: 'Cão de Guarda', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.12x' },
    { name: 'Genos Jr.', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.24x' },
    { name: 'Mosquito', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.36x' },
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
    {
      name: 'Sin Upgrades',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 100, // Exemplo
      unlockCost: 'Raid Sins Tokens',
      boosts: [
          { type: 'damage', value: 'Até +50% Damage' },
          { type: 'energy', value: 'Até +50% Energy' },
      ],
      description: "Upgrades de Dano e Energia obtidos com tokens da Raid Sins."
    },
  ],
  dungeons: [
      { name: 'Raid Sins', boss: 'Demon King', description: 'Uma raid de desafio individual onde se obtém tokens para os Sin Upgrades.'}
  ]
};

    
