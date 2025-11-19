
export const world6Data = {
  id: 'world-6',
  title: 'Mundo 6 - Ilha da Estátua',
  summary: 'Introduz o sistema de Shadows, que são lutadores especiais dropados por chefes.',
  npcs: [
    { name: 'Weak Sung', rank: 'E', exp: 119, hp: '625Sp', drops: { coins: { amount: '5M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.1 }, shadow_soul: { amount: 1, probability: 0.1 } } },
    { name: 'Green Goblin', rank: 'D', exp: 131, hp: '3.12O', drops: { coins: { amount: '10M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.11 }, shadow_soul: { amount: 1, probability: 0.11 } } },
    { name: 'White Tiger', rank: 'C', exp: 144, hp: '15.6O', drops: { coins: { amount: '15M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.125 }, shadow_soul: { amount: 1, probability: 0.125 } } },
    { name: 'Cha', rank: 'B', exp: 159, hp: '78O', drops: { coins: { amount: '20M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, 'ReAwakening Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.15 }, shadow_soul: { amount: 1, probability: 0.15 } } },
    { name: 'Choi', rank: 'A', exp: 174, hp: '3.91N', drops: { coins: { amount: '25M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, 'ReAwakening Token': { amount: 'x1-5', probability: 0.1 }, 'Monarch Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.2 }, shadow_soul: { amount: 1, probability: 0.2 } } },
    { name: 'Solo Sung', rank: 'S', exp: 192, hp: '1.95N', drops: { coins: { amount: '30M', probability: 1 }, 'Hunter Rank Token': { amount: 'x1-5', probability: 0.1 }, 'ReAwakening Token': { amount: 'x1-5', probability: 0.1 }, 'Monarch Token': { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.25 }, shadow_soul: { amount: 1, probability: 0.25 } } },
    { name: 'Statue of God', rank: 'SS', exp: 480, hp: '195Ud', drops: { coins: { amount: '70M', probability: 1 }, 'Hunter Rank Token': { amount: 'x3-5', probability: 0.1 }, 'ReAwakening Token': { amount: 'x3-5', probability: 0.1 }, 'Monarch Token': { amount: 'x3-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.5 }, 'shadow:statue_of_god': { probability: 1 }, shadow_soul: { amount: 1, probability: 0.5 }, aura: { name: 'Statue Aura', probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337947248361472/ScreenRecording_10-21-2025_10-32-26_1.mov?ex=68fa1245&is=68f8c0c5&hm=451a0c7979d34bf34b974d59f558aed19077082b2d29cf14342f0f5079111b12&' },
  ],
  powers: [
    {
      name: 'Solo Hunter Rank',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1B',
      stats: [
        { name: 'E-Rank', multiplier: '2x', rarity: 'Comum' },
        { name: 'D-Rank', multiplier: '3x', rarity: 'Incomum' },
        { name: 'C-Rank', multiplier: '4x', rarity: 'Raro' },
        { name: 'B-Rank', multiplier: '5x', rarity: 'Épico' },
        { name: 'A-Rank', multiplier: '8x', rarity: 'Lendário' },
        { name: 'S-Rank', multiplier: '10x', rarity: 'Mítico' },
        { name: 'National Level Hunter', multiplier: '12x', rarity: 'Phantom' }
      ]
    },
    {
      name: 'ReAwakening Progression',
      type: 'progression',
      statType: 'energy',
      maxLevel: 210,
      maxBoost: '2.10x Energy',
      unlockCost: '1.25B',
    },
    {
      name: 'Monarch Progression',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 200,
      unlockCost: '2.5B',
      boosts: [
        { type: 'damage', value: '2.00x Damage' },
        { type: 'crit_damage', value: '50% Crit Damage' }
      ]
    },
  ],
  foodExchanger: {
    description: "No Mundo 6, os jogadores podem trocar 2 comidas por 1 Macaron correspondente, que oferece um bônus de status superior.",
    items: [
        { from: 'Chocolate Bar (x2)', to: 'Energy Macaron (x1)' },
        { from: 'Cheese Pizza Slice (x2)', to: 'Coin Macaron (x1)' },
        { from: 'Milk (x2)', to: 'Damage Macaron (x1)' },
        { from: 'Green Gummy Bear (x2)', to: 'Luck Macaron (x1)' }
    ]
  },
  shadowLeveling: {
    description: "O leveling de Shadows também acontece no Mundo 6. Custa 10 Shadow Souls para cada nível e a taxa de sucesso é sempre 100%. O nível máximo é 100."
  },
  shadowUpgrades: {
    description: "No Mundo 6, os jogadores podem comprar upgrades permanentes para suas Shadows, incluindo bônus de status, slots de inventário e gamepasses.",
    upgrades: [
      { name: "Shadow Soul", description: "Aumenta o bônus de status de todas as Shadows equipadas.", maxLevel: 16, bonusPerLevel: "+0.05x", cost: "1.5k Exchange Tokens" },
      { name: "Shadow Extra Equip", description: "Permite equipar uma Shadow adicional.", maxLevel: 1, costType: "Gamepass" },
      { name: "Shadows Inventory Slots", description: "Aumenta o espaço do inventário para Shadows.", maxLevel: 10, cost: "1k Exchange Tokens por slot" },
      { name: "x2 Shadow Soul", description: "Dobra a quantidade de Shadow Souls recebidas.", maxLevel: 1, costType: "Gamepass", cost: "700 Credits" }
    ]
  },
  obelisks: [
    {
      id: 'solo-obelisk',
      name: 'Solo Obelisk',
      description: 'Um obelisco que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Statue of God 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '48k' },
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
        requirement: 'Derrotar 30 Weak Sung',
        rewards: [
            { name: 'Exp Potion', amount: 1 },
            { name: 'Coin Percent', value: '5%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '3.57k' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Green Goblin',
        rewards: [
            { name: 'Energy Potion', amount: 1 },
            { name: 'Coin Percent', value: '5%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '6.55k' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 White Tiger',
        rewards: [
            { name: 'Damage Potion', amount: 1 },
            { name: 'Damage Percent', value: '5%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '8.64k' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Cha',
        rewards: [
            { name: 'Drop Potion', amount: 1 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Hunter Rank Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '11.9k' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Choi',
        rewards: [
            { name: 'Avatar Soul', amount: 100 },
            { name: 'Damage Percent', value: '5%' },
            { name: 'ReAwakening Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '17.4k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Solo Sung',
        rewards: [
            { name: 'Avatar Soul', amount: 250 },
            { name: 'Energy Percent', value: '5%' },
            { name: 'Monarch Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '19.2k' }
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
