export const world8Data = {
  id: 'world-8',
  title: 'Mundo 8 - Ilha Shinobi',
  summary: 'Mundo ninja com dois chefes, Itechi e Madera, e foco em sorte e dano.',
  npcs: [
    { name: 'Genin', rank: 'E', exp: 2800000, hp: '1SpD' },
    { name: 'Chunin', rank: 'D', exp: 4000000, hp: '10SpD' },
    { name: 'Jonin', rank: 'C', exp: 6000000, hp: '100SpD' },
    { name: 'Anbu', rank: 'B', exp: 9000000, hp: '1OcD' },
    { name: 'Kage', rank: 'A', exp: 13000000, hp: '10OcD' },
    { name: 'Naruto', rank: 'S', exp: 18000000, hp: '1.41QnD' },
    { name: 'Itechi', rank: 'SS', exp: 35000000, hp: '2.82QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } } },
    { name: 'Madera', rank: 'SS', exp: 40000000, hp: '5.64QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } } },
  ],
  pets: [
    { name: 'Sapo', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.08x' },
    { name: 'Lesma', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.16x' },
    { name: 'Cobra', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.24x' },
  ],
  powers: [
    {
      name: 'Poder Ninja',
      type: 'progression',
      statType: 'luck',
      maxLevel: 25,
      maxBoost: '30% Star Luck',
      unlockCost: '2.5M',
    },
  ],
};
