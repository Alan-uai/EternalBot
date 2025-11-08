
export const world2Data = {
  id: 'world-2',
  title: 'Mundo 2 - Ilha do Moinho',
  summary: 'Mundo temático de piratas, focado em moedas e dano. Introduz o chefe Shanks.',
  content: 'Mundo temático de piratas. Aqui é possível fabricar la espada Phantom "Venomstrike" no "Sword Exchanger", usando 20 espadas Míticas "Redmourne", 10B de Moedas e 5 Cristais Vermelhos (dano).',
  npcs: [
    { name: 'Nomi', rank: 'E', exp: 150, hp: '4.5B', drops: { coins: { amount: 'x500', probability: 1 }, 'Pirate Crew Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x9', probability: 1 }, avatar_soul: { amount: 1, probability: 0.1 }, avatar: { probability: 0.01 } } },
    { name: 'Usup', rank: 'D', exp: 250, hp: '70B', drops: { coins: { amount: 'x1k', probability: 1 }, 'Pirate Crew Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x10', probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 }, avatar: { probability: 0.01 } } },
    { name: 'Robins', rank: 'C', exp: 400, hp: '250B', drops: { coins: { amount: 'x1.5k', probability: 1 }, 'Pirate Crew Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x11', probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 }, avatar: { probability: 0.01 } } },
    { name: 'Senji', rank: 'B', exp: 600, hp: '1.2T', drops: { coins: { amount: 'x2k', probability: 1 }, 'Pirate Crew Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x12', probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 }, avatar: { probability: 0.01 } } },
    { name: 'Zaro', rank: 'A', exp: 850, hp: '12T', drops: { coins: { amount: 'x2.5k', probability: 1 }, 'Demon Fruit Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x13', probability: 1 }, avatar_soul: { amount: 1, probability: 0.2 }, avatar: { probability: 0.01 } } },
    { name: 'Loffy', rank: 'S', exp: 1200, hp: '120T', drops: { coins: { amount: 'x3k', probability: 1 }, 'Demon Fruit Token': { amount: 'x1-5', probability: 0.1 }, 'Sword Token': { amount: 'x1-5', probability: 0.1 }, 'Haki Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x14', probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 }, avatar: { probability: 0.01 } } },
    { name: 'Shanks', rank: 'SS', exp: 2500, hp: '5sx', drops: { coins: { amount: 'x7k', probability: 1 }, 'Demon Fruit Token': { amount: 'x3-5', probability: 0.1 }, 'Pirate Crew Token': { amount: 'x3-5', probability: 0.1 }, 'Haki Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x30', probability: 1 }, 'red_emperor_aura': { probability: 0.01 }, 'armless_cloak': { probability: 0.25 }, avatar_soul: { amount: 1, probability: 0.5 }, avatar: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337623989157898/ScreenRecording_10-21-2025_10-30-18_1.mov?ex=68fa11f7&is=68f8c077&hm=545bf96550f91648d3cb19976024f9177520781ec5a21df3210a4c85af955e54&' },
  ],
  pets: [
    { name: 'Nomi', rarity: 'Comum', energy_bonus: '8' },
    { name: 'Usup', rarity: 'Incomum', energy_bonus: '15' },
    { name: 'Robins', rarity: 'Raro', energy_bonus: '23' },
    { name: 'Senji', rarity: 'Épico', energy_bonus: '30' },
    { name: 'Zaro', rarity: 'Lendário', energy_bonus: '38' },
    { name: 'Loffy', rarity: 'Mítico', energy_bonus: '50' },
    { name: 'Shanks', rarity: 'Phantom', energy_bonus: '113' },
  ],
  powers: [
    {
      name: 'Pirate Crew',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1k',
      stats: [
        { name: 'Whitebeard Pirates', multiplier: '2x', rarity: 'Comum' },
        { name: 'Cross Guild', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Big Mom Pirates', multiplier: '4x', rarity: 'Raro' },
        { name: 'Beast Pirates', multiplier: '5x', rarity: 'Épico' },
        { name: 'Blackbeard Pirates', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Straw Hat Pirates', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Red-Haired Pirates', multiplier: '12x', rarity: 'Phantom' },
      ],
    },
    {
      name: 'Chef Power',
      type: 'gacha',
      statType: 'damage',
      description: 'Obtido na Restaurant Raid.',
      unlockCost: 'Varia',
      stats: [
        { name: 'Common Chef', multiplier: '1x', rarity: 'Comum' },
        { name: 'Uncommon Chef', multiplier: '1.5x', rarity: 'Incomum' },
        { name: 'Rare Chef', multiplier: '2x', rarity: 'Raro' },
        { name: 'Epic Chef', multiplier: '3x', rarity: 'Épico' },
        { name: 'Legendary Chef', multiplier: '5x', rarity: 'Lendário' },
        { name: 'Mythical Chef', multiplier: '7x', rarity: 'Mítico' },
        { name: 'Phantom Chef', multiplier: '10x', rarity: 'Phantom' },
      ],
    },
    {
        name: "Demon Fruit",
        description: "Também são conhecidas como Akuma no Mi. Cada fruta oferece um bônus para um status específico.",
        type: "gacha",
        statType: "energy",
        unlockCost: "1.5k",
        stats: [
            { name: "Bomb Fruit", statType: "energy", multiplier: "2x", rarity: "Comum" },
            { name: "Rubber Fruit", statType: "energy", multiplier: "3x", rarity: "Comum" },
            { name: "Sand Fruit", statType: "energy", multiplier: "4x", rarity: "Incomum" },
            { name: "Flame Fruit", statType: "energy", multiplier: "5x", rarity: "Incomum" },
            { name: "Smoke Fruit", statType: "energy", multiplier: "6x", rarity: "Raro" },
            { name: "Magma Fruit", statType: "energy", multiplier: "7x", rarity: "Raro" },
            { name: "Revive Fruit", statType: "energy", multiplier: "8x", rarity: "Épico" },
            { name: "String Fruit", statType: "energy", multiplier: "9x", rarity: "Épico" },
            { name: "Human Fruit", statType: "energy", multiplier: "10x", rarity: "Lendário" },
            { name: "Dark Fruit", statType: "energy", multiplier: "11x", rarity: "Lendário" },
            { name: "Money Fruit", statType: "coin", multiplier: "1x", rarity: "Mítico" },
            { name: "Quake Fruit", statType: "energy", multiplier: "12x", rarity: "Mítico" },
            { name: "Phoenix Fruit", statType: "energy", multiplier: "15x", rarity: "Mítico" },
            { name: "Dough Fruit", statType: "damage", multiplier: "10x", rarity: "Phantom" }
        ]
    },
    {
        name: "Haki Upgrade",
        type: "progression",
        statType: "damage",
        maxLevel: 60,
        maxBoost: "0.6x Damage",
        unlockCost: "Varia"
    }
  ],
  accessories: [
    { id: 'armless-cloak', name: 'Armless Cloak', world: '2', boss: 'SS', rarity: 'SS', energy_bonus: 'true' }
  ],
  dungeons: [
    { 
      name: 'Restaurant Raid', 
      boss: 'Big Mom', 
      description: 'Uma raid com 1000 waves. As recompensas de tokens (da "Restaurant Box") e o "Chef Power" são simulados a cada andar da raid. A "Lunch Box" é o único item de caixa que dropa fisicamente para ser aberto depois. Bônus de drop, como Auras e poções, podem aumentar a quantidade de tokens obtidos por andar.',
      rewards: {
        general: [
            { item: 'Avatar Soul', amount: 'x1', probability: 0.25 },
            { item: 'Shadow Soul', amount: 'x1', probability: 0.20 },
            { item: 'Obelisk Coin', amount: 'x1', probability: 0.0035 },
            { item: 'Lunch Box', amount: 'x1', probability: 0.003 },
            { item: 'Restaurant Box', amount: 'x1', probability: 0.50 },
            { item: 'Chef Power Box', amount: 'x1', probability: 0.50 },
            { item: 'Exp', amount: 'x500', probability: 1 },
            { item: 'Coins', amount: 'x100k', probability: 1 },
        ],
        lunchBox: [
            { item: 'Chocolate Bar', amount: 'x1', probability: 0.11 },
            { item: 'Cheese Pizza Slice', amount: 'x1', probability: 0.11 },
            { item: 'Milk', amount: 'x1', probability: 0.11 },
            { item: 'Green Gummy Bear', amount: 'x1', probability: 0.11 },
            { item: 'Hot Sauce', amount: 'x1', probability: 0.12 },
            { item: 'Coffee', amount: 'x1', probability: 0.11 },
            { item: 'Doughnut', amount: 'x1', probability: 0.11 },
            { item: 'Fried Egg', amount: 'x1', probability: 0.11 },
            { item: 'Waffle', amount: 'x1', probability: 0.11 },
        ],
        restaurantBox: [
            { item: 'Dragon Race Token', amount: 'x8-13', probability: 0.20 },
            { item: 'Saiyan Evolution Token', amount: 'x8-13', probability: 0.20 },
            { item: 'Pirate Crew Token', amount: 'x8-13', probability: 0.20 },
            { item: 'Demon Fruit Token', amount: 'x8-13', probability: 0.20 },
            { item: 'Sword Token', amount: 'x11-16', probability: 0.20 },
        ],
        chefPowerBox: [
            { item: 'Common Chef', probability: 0.55 },
            { item: 'Uncommon Chef', probability: 0.33 },
            { item: 'Rare Chef', probability: 0.09 },
            { item: 'Epic Chef', probability: 0.05 },
            { item: 'Legendary Chef', probability: 0.01 },
            { item: 'Mythical Chef', probability: 0.005 },
        ]
      },
      achievements: {
        headers: ['Conquista', 'Requisito', 'Bônus'],
        rows: [
            { 'Conquista': 'Restaurant Raid I', 'Requisito': 'Reach Wave 10', 'Bônus': '5% Damage' },
            { 'Conquista': 'Restaurant Raid II', 'Requisito': 'Reach Wave 20', 'Bônus': '5% Star Luck' },
            { 'Conquista': 'Restaurant Raid III', 'Requisito': 'Reach Wave 30', 'Bônus': '5% Damage' },
            { 'Conquista': 'Restaurant Raid IV', 'Requisito': 'Reach Wave 40', 'Bônus': '5% Star Luck' },
            { 'Conquista': 'Restaurant Raid V', 'Requisito': 'Reach Wave 50', 'Bônus': '5% Damage' },
            { 'Conquista': 'Restaurant Raid VI', 'Requisito': 'Reach Wave 100', 'Bônus': '100 Credits' },
            { 'Conquista': 'Restaurant Raid VII', 'Requisito': 'Reach Wave 200', 'Bônus': '10% Damage' },
            { 'Conquista': 'Restaurant Raid IX', 'Requisito': 'Reach Wave 500', 'Bônus': '15% Damage' },
            { 'Conquista': 'Restaurant Raid X', 'Requisito': 'Reach Wave 750', 'Bônus': '20% Star Luck' },
            { 'Conquista': 'Restaurant Raid XI', 'Requisito': 'Reach Wave 1000', 'Bônus': '150 Credits' },
        ]
      }
    }
  ],
  obelisks: [
    {
      id: 'pirate-obelisk',
      name: 'Pirate Obelisk',
      description: 'Um obelisco comum que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Shanks 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '3k' },
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
        requirement: 'Derrotar 30 Nomi',
        rewards: [
            { name: 'Damage Potion', amount: 1 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '270' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Usup',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Coin Percent', value: '2%' },
            { name: 'Exp', amount: '500' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Robins',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Damage Percent', value: '2%' },
            { name: 'Exp', amount: '660' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Senji',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Energy Percent', value: '2%' },
            { name: 'Exp', amount: '900' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Zaro',
        rewards: [
            { name: 'Avatar Soul', amount: 5 },
            { name: 'Pirate Crew Token', amount: 10 },
            { name: 'Luck Percent', value: '2%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '1.3k' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Loffy',
        rewards: [
            { name: 'Redefinição de Status', amount: 1 },
            { name: 'Energy Percent', value: '3%' },
            { name: 'Demon Fruit Token', amount: 1 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '1.4k' }
        ]
    }
  ]
}
