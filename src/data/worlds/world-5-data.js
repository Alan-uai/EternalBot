
export const world5Data = {
  id: 'world-5',
  title: 'Mundo 5 - Ilha dos Caçadores',
  summary: 'Mundo focado em caçadores, com a espada de energia Yellow Nichirin.',
  npcs: [
    { name: 'Nazuki', rank: 'E', exp: 25000, hp: '100N' },
    { name: 'Tenjaro', rank: 'D', exp: 35000, hp: '500N' },
    { name: 'Zentsu', rank: 'C', exp: 50000, hp: '1de' },
    { name: 'Insake', rank: 'B', exp: 70000, hp: '10de' },
    { name: 'Tamoka', rank: 'A', exp: 100000, hp: '50de' },
    { name: 'Shinabe', rank: 'S', exp: 150000, hp: '15.6de' },
    { name: 'Rangaki', rank: 'SS', exp: 300000, hp: '31.2de', drops: { aura: { name: 'Aura Flamejante', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337846912221314/ScreenRecording_10-21-2025_10-31-41_1.mov?ex=68fa122d&is=68f8c0ad&hm=8c251843f5a6cef356551f7f8e66c564aaf4dab8be019d1c30e824ac3fdb40a7&' },
  ],
  pets: [
    { name: 'Nazuki', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.05x' },
    { name: 'Tenjaro', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.10x' },
    { name: 'Zentsu', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.15x' },
  ],
  powers: [
    {
      name: 'Demon Arts',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '250k',
      stats: [
        { name: 'Dream Manipulation', multiplier: '2x', rarity: 'Comum' },
        { name: 'Blood Scythes', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Vase Teleportation', multiplier: '4x', rarity: 'Raro' },
        { name: 'Emotion Splitting', multiplier: '5x', rarity: 'Épico' },
        { name: 'Destructive Death', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Cryokinesis', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Blood Control', multiplier: '12x', rarity: 'Phantom' },
      ],
    }
  ]
};

    