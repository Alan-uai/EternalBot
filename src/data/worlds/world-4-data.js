
export const world4Data = {
  id: 'world-4',
  title: 'Mundo 4 - Ilha dos Demônios de Fogo',
  summary: 'Um mundo infernal focado em dano e drops, com o chefe Sakuni.',
  npcs: [
    { name: 'Diabinho', rank: 'E', exp: 5000, hp: '100qd' },
    { name: 'Cão Infernal', rank: 'D', exp: 7000, hp: '1Qn' },
    { name: 'Demônio de Fogo', rank: 'C', exp: 10000, hp: '25Qn' },
    { name: 'Demônio Maior', rank: 'B', exp: 15000, hp: '250Qn' },
    { name: 'Lorde Demônio', rank: 'A', exp: 22000, hp: '500Qn' },
    { name: 'Akaza', rank: 'S', exp: 30000, hp: '60O' },
    { name: 'Sakuni', rank: 'SS', exp: 60000, hp: '120Sp', drops: { aura: { name: 'Aura do Rei do Fogo', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337777840554126/ScreenRecording_10-21-2025_10-31-17_1.mov?ex=68fa121c&is=68f8c09c&hm=4701c56efe6c8b63f39d235ca2353f417c474b290038f6c2874b44537ce6ead1&' },
  ],
  pets: [
    { name: 'Salamandra', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.04x' },
    { name: 'Cerberus Jr.', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.08x' },
    { name: 'Lord Diabinho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.12x' },
  ],
  powers: [
    {
      name: 'Poder Demoníaco',
      type: 'gacha',
      statType: 'damage',
      unlockCost: '50k',
      stats: [
        { name: 'Chamas Negras', multiplier: '1.3x', rarity: 'Comum', probability: 40 },
        { name: 'Fogo Infernal', multiplier: '2.0x', rarity: 'Raro', probability: 12 },
        { name: 'Rei Demônio', multiplier: '3.5x', rarity: 'Phantom', probability: 0.25 },
      ],
    },
    {
      name: 'Sorte do Demônio',
      type: 'progression',
      statType: 'luck',
      maxLevel: 20,
      maxBoost: '25% Drop Chance',
      unlockCost: '100k',
    },
  ],
  accessories: [
      { id: 'chifres-demonio', name: 'Chifres de Demônio', world: 'Mundo 4', boss: 'Lorde Demônio', rarity: 'Épico', damage_bonus: '0.05x' }
  ]
};
