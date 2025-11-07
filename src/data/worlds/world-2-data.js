
export const world2Data = {
  id: 'world-2',
  title: 'Mundo 2 - Ilha do Moinho',
  summary: 'Mundo temático de piratas, focado em moedas e dano. Introduz o chefe Shanks.',
  content: 'Mundo temático de piratas. Aqui é possível fabricar la espada Phantom "Venomstrike" no "Sword Exchanger", usando 20 espadas Míticas "Redmourne", 10B de Moedas e 5 Cristais Vermelhos (dano).',
  npcs: [
    { name: 'Marinheiro Pirata', rank: 'E', exp: 150, hp: '100M' },
    { name: 'Espadachim Pirata', rank: 'D', exp: 250, hp: '500M' },
    { name: 'Canhoneiro Pirata', rank: 'C', exp: 400, hp: '1B' },
    { name: 'Imediato Pirata', rank: 'B', exp: 600, hp: '10B' },
    { name: 'Capitão Pirata', rank: 'A', exp: 850, hp: '50B' },
    { name: 'Luffy', rank: 'S', exp: 1200, hp: '2.5sx' },
    { name: 'Shanks', rank: 'SS', exp: 2500, hp: '5sx', drops: { aura: { name: 'Aura do Imperador Vermelho', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337623989157898/ScreenRecording_10-21-2025_10-30-18_1.mov?ex=68fa11f7&is=68f8c077&hm=545bf96550f91648d3cb19976024f9177520781ec5a21df3210a4c85af955e54&' },
  ],
  pets: [
    { name: 'Papagaio', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.02x' },
    { name: 'Macaco', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.04x' },
    { name: 'Rei dos Mares Bebê', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.06x' },
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
      unlockCost: 'Varia',
      description: 'Obtido na Restaurant Raid.',
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
        statType: "mixed",
        unlockCost: "1.5k",
        stats: [
            { name: "Bomb Fruit", statType: "energy", multiplier: "2x", rarity: "Supremo" },
            { name: "Rubber Fruit", statType: "energy", multiplier: "3x", rarity: "Comum" },
            { name: "Sand Fruit", statType: "energy", multiplier: "4x", rarity: "Incomum" },
            { name: "Flame Fruit", statType: "energy", multiplier: "5x", rarity: "Incomum" },
            { name: "Smoke Fruit", statType: "energy", multiplier: "6x", rarity: "Raro" },
            { name: "Magma Fruit", statType: "energy", multiplier: "7x", rarity: "Épico" },
            { name: "Revive Fruit", statType: "energy", multiplier: "8x", rarity: "Épico" },
            { name: "String Fruit", statType: "energy", multiplier: "9x", rarity: "Épico" },
            { name: "Human Fruit", statType: "coin", multiplier: "10x", rarity: "Lendário" },
            { name: "Dark Fruit", statType: "coin", multiplier: "11x", rarity: "Lendário" },
            { name: "Quake Fruit", statType: "damage", multiplier: "12x", rarity: "Mítico" },
            { name: "Money Fruit", statType: "coin", multiplier: "1x", rarity: "Lendário" },
            { name: "Phoenix Fruit", statType: "energy", multiplier: "15x", rarity: "Raro" },
            { name: "Dough Fruit", statType: "energy", multiplier: "10x", rarity: "Phantom" }
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
    { name: 'Caverna do Tesouro', boss: 'Rei dos Mares', description: 'Uma caverna cheia de tesouros guardada por um monstro marinho.'},
    { name: 'Restaurant Raid', boss: 'Big Mom', description: 'Uma raid com 1000 waves onde se obtém o Chef Power.'}
  ]
};
