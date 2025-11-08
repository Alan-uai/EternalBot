
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
    { name: 'Itechi', rank: 'SS', exp: 35000000, hp: '2.82QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338276535046155/ScreenRecording_10-21-2025_10-36-25_1.mov?ex=68fa1293&is=68f8c113&hm=429938bb3f8f6e74c5a5d5aa424f68a3eab8aeb7f3822abc25bc049bb5e058a7&' },
    { name: 'Madera', rank: 'SS', exp: 40000000, hp: '5.64QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338462162092093/ScreenRecording_10-21-2025_10-36-50_1.mov?ex=68fa12bf&is=68f8c13f&hm=6608bd1a66e65473faf5d3e05f279e8187d991512894aa533f07cf185ee2525e&' },
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
  accessories: [
    { 
      id: 'shinobi-flops', 
      name: 'Shinobi Flops', 
      slot: 'Leg',
      world: '8', 
      boss: 'Itechi', 
      rarity: 'SS', 
      bonuses: [
        { type: 'coin', values: ['0.1', '0.15x', '0.2x', '0.25x', '0.3x', '0.35x', '1x', '0.75x'] },
        { type: 'movespeed', values: ['10%', '15%', '20%', '25%', '30%', '35%', '50%', '75%'] }
      ]
    }
  ],
};
