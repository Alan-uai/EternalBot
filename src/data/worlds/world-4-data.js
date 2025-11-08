
export const world4Data = {
  id: 'world-4',
  title: 'Mundo 4 - Ilha dos Feiticeiros',
  summary: 'Um mundo infernal focado em dano e drops, com o chefe Sakuni.',
  content: 'Mundo temático de Shinigamis. É aqui que os jogadores encontram a primeira espada de energia do jogo, a Zangetsu.',
  npcs: [
    { name: 'Itodo', rank: 'E', exp: 39, hp: '1.5Qn', drops: { coins: { amount: 'x50k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.1 } } },
    { name: 'Nebara', rank: 'D', exp: 41, hp: '50Qn', drops: { coins: { amount: 'x100k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.11 } } },
    { name: 'Magum', rank: 'C', exp: 43, hp: '110Qn', drops: { coins: { amount: 'x150k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.125 } } },
    { name: 'Meki', rank: 'B', exp: 45, hp: '475Qn', drops: { coins: { amount: 'x200k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.15 } } },
    { name: 'Tage', rank: 'A', exp: 47, hp: '9.69sx', drops: { coins: { amount: 'x250k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.2 } } },
    { name: 'Gajo', rank: 'S', exp: 50, hp: '50sx', drops: { coins: { amount: 'x300k', probability: 1 }, 'Cursed Token': { amount: 'x1-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x1-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.25 } } },
    { name: 'Sakuni', rank: 'SS', exp: 120, hp: '120Sp', drops: { coins: { amount: 'x700k', probability: 1 }, 'Cursed Token': { amount: 'x3-5', probability: 0.1 }, 'Cursed Finger': { amount: 'x3-5', probability: 0.1 }, 'Avatar Soul': { amount: 'x1', probability: 0.5 }, aura: { name: 'Fire King Aura', probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337777840554126/ScreenRecording_10-21-2025_10-31-17_1.mov?ex=68fa121c&is=68f8c09c&hm=4701c56efe6c8b63f39d235ca2353f417c474b290038f6c2874b44537ce6ead1&' },
  ],
  pets: [
    { name: 'Itodo', rarity: 'Comum', energy_bonus: '47' },
    { name: 'Nebara', rarity: 'Incomum', energy_bonus: '94' },
    { name: 'Magum', rarity: 'Raro', energy_bonus: '141' },
    { name: 'Meki', rarity: 'Épico', energy_bonus: '188' },
    { name: 'Tage', rarity: 'Lendário', energy_bonus: '234' },
    { name: 'Gajo', rarity: 'Mítico', energy_bonus: '313' },
    { name: 'Sakuni', rarity: 'Phantom', energy_bonus: '703' },
  ],
  powers: [
    {
      name: "Curses",
      type: "gacha",
      statType: "energy",
      unlockCost: "Varia",
      description: "Poder de energia obtido no gacha do mundo 4.",
      stats: [
        { name: 'Blazing Cataclysm', multiplier: '2x', rarity: 'Comum' },
        { name: 'Nullborn Phantom', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Infernal Crater', multiplier: '4x', rarity: 'Raro' },
        { name: 'Abyssal Tide', multiplier: '5x', rarity: 'Épico' },
        { name: 'Verdant Calamity', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Soulbender', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Wandered Mind', multiplier: '12x', rarity: 'Phantom' }
      ]
    },
    {
      name: "Cursed Power",
      type: "gacha",
      statType: "mixed",
      unlockCost: "Varia",
      description: "Poder de dano e crítico de energia obtido na Cursed Raid.",
      stats: [
        { name: 'Common Curse', statType: 'damage', multiplier: '0.6x', rarity: 'Comum' },
        { name: 'Uncommon Curse', statType: 'damage', multiplier: '0.8x', rarity: 'Incomum' },
        { name: 'Rare Curse', statType: 'damage', multiplier: '1x', rarity: 'Raro', energy_crit_bonus: '1.00%' },
        { name: 'Epic Curse', statType: 'damage', multiplier: '2x', rarity: 'Épico', energy_crit_bonus: '2.00%' },
        { name: 'Legendary Curse', statType: 'damage', multiplier: '3x', rarity: 'Lendário', energy_crit_bonus: '3.00%' },
        { name: 'Mythical Curse', statType: 'damage', multiplier: '4x', rarity: 'Mítico', energy_crit_bonus: '4.00%' },
        { name: 'Phantom Curse', statType: 'damage', multiplier: '5x', rarity: 'Phantom', energy_crit_bonus: '5.00%' }
      ]
    },
    {
      name: "Cursed Progression",
      type: "progression",
      statType: "damage",
      maxLevel: 410,
      maxBoost: "4.10x Damage",
      unlockCost: "Varia",
    }
  ],
  accessories: [
      { id: 'chifres-demonio', name: 'Chifres de Demônio', world: 'Mundo 4', boss: 'Lorde Demônio', rarity: 'Épico', damage_bonus: '0.05x' }
  ],
  dungeons: [
      { name: 'Cursed Raid', boss: 'Desconhecido', description: 'Uma raid onde se obtém os poderes Curses e Cursed Power.'}
  ],
  obelisks: [
    {
      id: 'sorcerer-obelisk',
      name: 'Sorcerer Obelisk',
      description: 'Um obelisco que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Sakuni 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '12k' },
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
        requirement: 'Derrotar 30 Itodo',
        rewards: [
            { name: 'Luck Potion', amount: 1 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '1.17k' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Nebara',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Coin Percent', value: '4%' },
            { name: 'Exp', amount: '2.05k' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Magum',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Damage Percent', value: '4%' },
            { name: 'Exp', amount: '2.58k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Meki',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Energy Percent', value: '4%' },
            { name: 'Exp', amount: '3.37k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Tage',
        rewards: [
            { name: 'Cursed Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Luck Percent', value: '4%' },
            { name: 'Exp', amount: '4.7k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Gajo',
        rewards: [
            { name: 'Cursed Finger Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Exp', amount: '5k' }
        ]
    }
  ]
}
