
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
    { name: 'Garou Cósmico', rank: 'SS', exp: 2.4e10, hp: '2.96DVg', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338679133573201/ScreenRecording_10-21-2025_10-55-19_1.mov?ex=68fa12f3&is=68f8c173&hm=013c1fe7b9a0750c617765c25001c2aebba9efac2ae1132a14ccf4d1564e5ec4&', drops: {} },
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
      name: 'Sins',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '10qd',
    },
    {
      name: 'Commandments',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '50qd',
    },
  ],
  dungeons: [
      { name: 'Raid Sins', type: 'raid', boss: 'Demon King', description: 'Uma raid de desafio individual onde se obtém tokens para os Sin Upgrades.'}
  ]
};

  

    