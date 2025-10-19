export const world21Data = {
  id: 'world-21',
  title: 'Mundo 21 - Hueco Mundo',
  summary: 'O mais novo mundo, lar dos Arrancars mais poderosos, Vasto Lordes e as novas armas, as Foices.',
  npcs: [
    { name: 'Arrancar Fracción', rank: 'E', exp: 4e16, hp: '1QnQDR' },
    { name: 'Privaron Espada', rank: 'D', exp: 6e16, hp: '10QnQDR' },
    { name: 'Espada', rank: 'C', exp: 9e16, hp: '100QnQDR' },
    { name: 'Coyote Starrk', rank: 'B', exp: 1.3e17, hp: '1sxQDR' },
    { name: 'Barragan', rank: 'A', exp: 1.9e17, hp: '10sxQDR' },
    { name: 'Cifer', rank: 'SSS', exp: 3.8e17, hp: '744QnTG', drops: {} },
    { name: 'Vasto Ichge', rank: 'SSS', exp: 1e18, hp: '3.7ssTG', drops: {} },
  ],
  pets: [
    { name: 'Hollow Mask Fragment', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.63x' },
    { name: 'Vasto Lorde Chibi', rank: 'Épico', rarity: 'Épico', energy_bonus: '0.84x' },
    { name: 'Rei das Almas', rank: 'Lendário', rarity: 'Lendário', energy_bonus: '1.05x' },
  ],
  powers: [
    {
      name: 'Poder do Vazio',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '50B',
       stats: [
        { name: 'Resurrección', multiplier: '10x', rarity: 'Raro', probability: 4 },
        { name: 'Resurrección: Segunda Etapa', multiplier: '20x', rarity: 'Phantom', probability: 0.02 },
      ],
    },
  ],
};
