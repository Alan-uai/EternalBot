
export const world7Data = {
  id: 'world-7',
  title: 'Mundo 7 - Ilha dos Viajantes',
  summary: 'Mundo temático de Black Clover, com foco em energia e moedas. O chefe final é Novi Chroni.',
  npcs: [
    { name: 'Noalle', rank: 'E', exp: 240, hp: '7.8N', drops: { coins: { amount: 'x50M', probability: 1 }, 'Water Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x240', probability: 1 }, avatar_soul: { amount: 1, probability: 0.1 }, shadow_soul: { amount: 1, probability: 0.1 } } },
    { name: 'Megna', rank: 'D', exp: 264, hp: '80N', drops: { coins: { amount: 'x100M', probability: 1 }, 'Water Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x264', probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 }, shadow_soul: { amount: 1, probability: 0.11 } } },
    { name: 'Finrel', rank: 'C', exp: 290, hp: '843N', drops: { coins: { amount: 'x150M', probability: 1 }, 'Wind Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x290', probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 }, shadow_soul: { amount: 1, probability: 0.125 } } },
    { name: 'Aste', rank: 'B', exp: 319, hp: '9.08de', drops: { coins: { amount: 'x200M', probability: 1 }, 'Wind Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x319', probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 }, shadow_soul: { amount: 1, probability: 0.15 } } },
    { name: 'Yune', rank: 'A', exp: 351, hp: '95.7de', drops: { coins: { amount: 'x250M', probability: 1 }, 'Grimoire Token': { amount: 'x1-5', probability: 0.1 }, 'Fire Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x351', probability: 1 }, avatar_soul: { amount: 1, probability: 0.2 }, shadow_soul: { amount: 1, probability: 0.2 } } },
    { name: 'Yemi', rank: 'S', exp: 386, hp: '1.01Ud', drops: { coins: { amount: 'x300M', probability: 1 }, 'Grimoire Token': { amount: 'x1-5', probability: 0.1 }, 'Fire Spirit Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x386', probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 }, shadow_soul: { amount: 1, probability: 0.25 } } },
    { name: 'Novi Chroni', rank: 'SS', exp: 960, hp: '101tdD', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338227725664287/ScreenRecording_10-21-2025_10-35-22_1.mov?ex=68fa1287&is=68f8c107&hm=6ce1e4abfb80c01df86b05dc364cc1e0f45515182d53142c7d75fe9ffad47f3b&', drops: { coins: { amount: 'x700M', probability: 1 }, 'Grimoire Token': { amount: 'x3-5', probability: 0.1 }, 'Wind Spirit Token': { amount: 'x3-5', probability: 0.1 }, 'Fire Spirit Token': { amount: 'x3-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.5 }, avatar: { name: '[S] Novi Chroni', probability: 1 }, shadow_soul: { amount: 1, probability: 0.5 } } },
  ],
  powers: [
    {
      name: 'Poder Temporal',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1M',
      stats: [
        { name: 'Acelerar', multiplier: '2.5x', rarity: 'Comum', probability: 30 },
        { name: 'Parar o Tempo', multiplier: '4x', rarity: 'Raro', probability: 8 },
        { name: 'Deus do Tempo', multiplier: '6x', rarity: 'Phantom', probability: 0.15 },
      ],
    },
    {
        name: 'Grimoire',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '250B',
    },
    {
        name: 'Water Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '50B',
    },
    {
        name: 'Fire Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '75B',
    },
    {
        name: 'Wind Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '150B',
    },
  ],
  obelisks: [
    {
      id: 'clover-obelisk',
      name: 'Clover Obelisk',
      description: 'Um obelisco que concede bônus permanentes ao ser ativado.',
      mission: {
        name: 'Missão do Obelisco de Clover',
        requirement: 'Derrotar Novi Chroni 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '96k' },
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
        requirement: 'Derrotar 30 Noalle',
        rewards: [
            { name: 'Exp Potion', amount: 1 },
            { name: 'Coin Percent', value: '5%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '7.2k' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Megna',
        rewards: [
            { name: 'Energy Potion', amount: 1 },
            { name: 'Coin Percent', value: '5%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '13.2k' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Finrel',
        rewards: [
            { name: 'Damage Potion', amount: 1 },
            { name: 'Damage Percent', value: '5%' },
            { name: 'Water Spirit Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '17.4k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Aste',
        rewards: [
            { name: 'Drop Potion', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Wind Spirit Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '23.9k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Yune',
        rewards: [
            { name: 'Avatar Soul', amount: 250 },
            { name: 'Damage Percent', value: '5%' },
            { name: 'Fire Spirit Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '35.1k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Yemi',
        rewards: [
            { name: 'Stats Reset', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Grimoire Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '38.6k' }
        ]
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank E), com tarefas que se estendem pelos mundos 6 a 9."
    }
  ]
};
