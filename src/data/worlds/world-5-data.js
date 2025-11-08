
export const world5Data = {
  id: 'world-5',
  title: 'Mundo 5 - Ilha dos Caçadores',
  summary: 'Mundo focado em caçadores, com a espada de energia Yellow Nichirin.',
  content: 'Mundo temático de caçadores de demônios. É neste mundo que os jogadores podem evoluir suas armas para 2 e 3 estrelas.',
  npcs: [
    { name: 'Nazuki', rank: 'E', exp: 75, hp: '100sx', drops: { coins: { amount: 'x500k', probability: 1 }, 'Breathing Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 75, probability: 1 }, avatar_soul: { amount: 1, probability: 0.10 }, avatar: { probability: 0.01 } } },
    { name: 'Tenjaro', rank: 'D', exp: 78, hp: '500sx', drops: { coins: { amount: 'x1M', probability: 1 }, 'Breathing Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 78, probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 }, avatar: { probability: 0.01 } } },
    { name: 'Zentsu', rank: 'C', exp: 82, hp: '2.5Sp', drops: { coins: { amount: 'x1.5M', probability: 1 }, 'Breathing Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 82, probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 }, weapon: { name: 'Yellow Nichirin', probability: 0.1 }, avatar: { probability: 0.01 } } },
    { name: 'Insake', rank: 'B', exp: 86, hp: '12.5Sp', drops: { coins: { amount: 'x2M', probability: 1 }, 'Breathing Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 86, probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 }, avatar: { probability: 0.01 } } },
    { name: 'Tamoka', rank: 'A', exp: 91, hp: '62.5Sp', drops: { coins: { amount: 'x2.5M', probability: 1 }, 'Demon Arts Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 91, probability: 1 }, avatar_soul: { amount: 1, probability: 0.20 }, avatar: { probability: 0.01 } } },
    { name: 'Shinabe', rank: 'S', exp: 95, hp: '312Sp', drops: { coins: { amount: 'x3M', probability: 1 }, 'Demon Arts Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 95, probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 }, avatar: { probability: 0.01 } } },
    { name: 'Rangaki', rank: 'SS', exp: 240, hp: '31.2de', drops: { coins: { amount: 'x7M', probability: 1 }, 'Demon Arts Token': { amount: 'x3-5', probability: 0.1 }, 'Breathing Token': { amount: 'x3-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.5 }, aura: { name: 'Flaming Aura', probability: 0.05 }, avatar: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337846912221314/ScreenRecording_10-21-2025_10-31-41_1.mov?ex=68fa122d&is=68f8c0ad&hm=8c251843f5a6cef356551f7f8e66c564aaf4dab8be019d1c30e824ac3fdb40a7&' },
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
  ],
  obelisks: [
    {
      id: 'slayer-obelisk',
      name: 'Slayer Obelisk',
      description: 'Um obelisco que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Rangaki 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '24k' },
          { name: 'Avatar Soul', amount: 100 },
          { name: 'Energy Potion', amount: 1 }
        ]
      },
      boosts: [
        { type: 'Energy Multiply', value: '0.15x' },
        { type: 'Damage Multiply', value: '0.25x' },
        { type: 'Exp Percent', value: '3.5%' }
      ]
    }
  ],
  missions: [
    {
        name: 'Missão #1',
        requirement: 'Derrotar 30 Nazuki',
        rewards: [
            { name: 'Soltar Poção', amount: 1 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '2.25k' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Tenjaro',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Coin Percent', value: '5%' },
            { name: 'Exp', amount: '3.9k' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Zentsu',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Damage Percent', value: '5%' },
            { name: 'Exp', amount: '4.92k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Insake',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Exp', amount: '6.45k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Tamoka',
        rewards: [
            { name: 'Avatar Soul', amount: 5 },
            { name: 'Luck Percent', value: '5%' },
            { name: 'Breathing Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '9.1k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Shinabe',
        rewards: [
            { name: 'Redefinição de Status', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Demon Arts Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '9.5k' }
        ]
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Classe F), com tarefas neste mundo."
    }
  ]
};

    