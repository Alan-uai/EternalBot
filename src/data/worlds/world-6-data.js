
export const world6Data = {
  id: 'world-6',
  title: 'Mundo 6 - Ilha da Estátua',
  summary: 'Introduz o sistema de Shadows, que são lutadores especiais dropados por chefes.',
  npcs: [
    { name: 'Weak Sung', rank: 'E', exp: 120000, hp: '1DD' },
    { name: 'Green Goblin', rank: 'D', exp: 180000, hp: '10DD' },
    { name: 'White Tiger', rank: 'C', exp: 250000, hp: '100DD' },
    { name: 'Cha', rank: 'B', exp: 350000, hp: '1tD' },
    { name: 'Choi', rank: 'A', exp: 500000, hp: '10tD' },
    { name: 'Solo Sung', rank: 'S', exp: 750000, hp: '97.5Ud' },
    { name: 'Statue of God', rank: 'SS', exp: 1500000, hp: '195Ud', drops: { aura: { name: 'Statue Aura', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337947248361472/ScreenRecording_10-21-2025_10-32-26_1.mov?ex=68fa1245&is=68f8c0c5&hm=451a0c7979d34bf34b974d59f558aed19077082b2d29cf14342f0f5079111b12&' },
  ],
  powers: [
    {
      name: 'Earth Power',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 25,
      unlockCost: '500k',
      boosts: [
          { type: 'damage', value: '15% Damage' },
          { type: 'energy', value: '10% Energy' }
      ]
    },
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
  missions: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank E), com tarefas que se estendem pelos mundos 6 a 9."
    }
  ]
};
