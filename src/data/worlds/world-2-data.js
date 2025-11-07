
export const world2Data = {
  id: 'world-2',
  title: 'Mundo 2 - Ilha do Moinho',
  summary: 'Mundo temático de piratas, focado em moedas e dano. Introduz o chefe Shanks.',
  content: 'Mundo temático de piratas. Aqui é possível fabricar la espada Phantom "Venomstrike" no "Sword Exchanger", usando 20 espadas Míticas "Redmourne", 10B de Moedas e 5 Cristais Vermelhos (dano).',
  npcs: [
    { name: 'Nomi', rank: 'E', exp: 150, hp: '4.5B', drops: { coins: { amount: 'x500', probability: 1 }, pirate_crew_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x9', probability: 1 }, avatar_soul: { amount: 1, probability: 0.1 } } },
    { name: 'Usup', rank: 'D', exp: 250, hp: '70B', drops: { coins: { amount: 'x1k', probability: 1 }, pirate_crew_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x10', probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 } } },
    { name: 'Robins', rank: 'C', exp: 400, hp: '250B', drops: { coins: { amount: 'x1.5k', probability: 1 }, pirate_crew_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x11', probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 } } },
    { name: 'Senji', rank: 'B', exp: 600, hp: '1.2T', drops: { coins: { amount: 'x2k', probability: 1 }, pirate_crew_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x12', probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 } } },
    { name: 'Zaro', rank: 'A', exp: 850, hp: '12T', drops: { coins: { amount: 'x2.5k', probability: 1 }, demon_fruit_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x13', probability: 1 }, avatar_soul: { amount: 1, probability: 0.20 } } },
    { name: 'Loffy', rank: 'S', exp: 1200, hp: '120T', drops: { coins: { amount: 'x3k', probability: 1 }, demon_fruit_token: { amount: 'x1-5', probability: 0.1 }, sword_token: { amount: 'x1-5', probability: 0.1 }, haki_token: { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x14', probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 } } },
    { name: 'Shanks', rank: 'SS', exp: 2500, hp: '5sx', drops: { coins: { amount: 'x7k', probability: 1 }, demon_fruit_token: { amount: 'x3-5', probability: 0.1 }, pirate_crew_token: { amount: 'x3-5', probability: 0.1 }, haki_token: { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x30', probability: 1 }, avatar_soul: { amount: 1, probability: 0.5 }, armless_cloak: { probability: 0.25 }, red_emperor_aura: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337623989157898/ScreenRecording_10-21-2025_10-30-18_1.mov?ex=68fa11f7&is=68f8c077&hm=545bf96550f91648d3cb19976024f9177520781ec5a21df3210a4c85af955e54&' },
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
        type: "gacha",
        description: "Também são conhecidas como Akuma no Mi.",
        statType: "mixed",
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
    { id: 'bandana-pirata', name: 'Bandana Pirata', world: 'Mundo 2', boss: 'Capitão Pirata', rarity: 'Incomum', coins_bonus: '0.05' }
  ],
  dungeons: [
    { 
      name: 'Restaurant Raid', 
      boss: 'Big Mom', 
      description: 'Uma raid com 1000 waves onde se obtém o Chef Power.',
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
            { 'Conquista': 'Restaurant Raid VIII', 'Requisito': 'Reach Wave 300', 'Bônus': '15% Star Luck' },
            { 'Conquista': 'Restaurant Raid IX', 'Requisito': 'Reach Wave 500', 'Bônus': '15% Damage' },
            { 'Conquista': 'Restaurant Raid X', 'Requisito': 'Reach Wave 750', 'Bônus': '20% Star Luck' },
            { 'Conquista': 'Restaurant Raid XI', 'Requisito': 'Reach Wave 1000', 'Bônus': '150 Credits' },
        ]
      }
    }
  ]
}
