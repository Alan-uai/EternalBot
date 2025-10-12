
export const world2Data = {
    name: 'Windmill Island',
    powers: [
      {
        id: 'red-emperor-power',
        name: 'Red Emperor Power',
        type: 'gacha',
        statType: 'damage',
        unlockCost: '75k',
        stats: [
          { name: 'Conquerors Haki', multiplier: '1.1x', rarity: 'Rare', probability: 19.9 },
          { name: 'Red Hair', multiplier: '1.2x', rarity: 'Legendary', probability: 5 },
          { name: 'Emperor', multiplier: '1.3x', rarity: 'Mythic', probability: 1 },
          { name: 'Yonko', multiplier: '1.4x', rarity: 'Phantom', probability: 0.5 },
        ],
      },
      {
        id: 'pirate-crew',
        name: 'Pirate Crew',
        type: 'gacha',
        statType: 'energy',
        unlockCost: '25k',
        stats: [
            { name: 'Whitebeard Pirates', multiplier: '2x', rarity: 'Common', probability: 40.55 },
            { name: 'Cross Guild', multiplier: '3x', rarity: 'Uncommon', probability: 33 },
            { name: 'Big Mom Pirates', multiplier: '4x', rarity: 'Rare', probability: 19.9 },
            { name: 'Beast pirates', multiplier: '5x', rarity: 'Legendary', probability: 5 },
            { name: 'Blackbeard Pirates', multiplier: '8x', rarity: 'Mythic', probability: 1 },
            { name: 'Straw Hat Pirates', multiplier: '10x', rarity: 'Phantom', probability: 0.5 },
            { name: 'Red-Haired Pirates', multiplier: '12x', rarity: 'Supreme', probability: 0.05 }
        ]
      },
      {
        id: 'chef-power',
        name: 'Chef Power',
        type: 'gacha',
        statType: 'damage',
        unlockCost: '35k',
        stats: [
            { name: 'Common Chef', multiplier: '1x', rarity: 'Common', probability: 40.55 },
            { name: 'Uncommon Chef', multiplier: '1.5x', rarity: 'Uncommon', probability: 33 },
            { name: 'Rare Chef', multiplier: '2x', rarity: 'Rare', probability: 19.9 },
            { name: 'Epic Chef', multiplier: '3x', rarity: 'Epic', probability: 5 },
            { name: 'Legendary Chef', multiplier: '5x', rarity: 'Legendary', probability: 1 },
            { name: 'Mythical Chef', multiplier: '7x', rarity: 'Mythic', probability: 0.5 },
            { name: 'Phantom Chef', multiplier: '10x', rarity: 'Phantom', probability: 0.05 }
        ]
      },
      {
        id: 'demon-fruit',
        name: 'Demon Fruit',
        type: 'gacha',
        unlockCost: '55k',
        // statType is defined on individual stats because it's mixed
        stats: [
          { name: 'Bomb Fruit', multiplier: '2x', statType: 'coin', rarity: 'Common' },
          { name: 'Rubber Fruit', multiplier: '3x', statType: 'energy', rarity: 'Uncommon' },
          { name: 'Sand Fruit', multiplier: '4x', statType: 'coin', rarity: 'Rare' },
          { name: 'Flame Fruit', multiplier: '5x', statType: 'energy', rarity: 'Legendary' },
          { name: 'Smoke Fruit', multiplier: '6x', statType: 'energy', rarity: 'Legendary' },
          { name: 'Magma Fruit', multiplier: '7x', statType: 'damage', rarity: 'Mythic' },
          { name: 'Revive Fruit', multiplier: '8x', statType: 'energy', rarity: 'Mythic' },
          { name: 'String Fruit', multiplier: '9x', statType: 'coin', rarity: 'Phantom' },
          { name: 'Human Fruit', multiplier: '10x', statType: 'coin', rarity: 'Phantom' },
          { name: 'Dark Fruit', multiplier: '11x', statType: 'coin', rarity: 'Phantom' },
          { name_id: 'quake-fruit', name: 'Quake Fruit', multiplier: '12x', statType: 'damage', rarity: 'Supreme' },
          { name: 'Money Fruit', multiplier: '1x', statType: 'coin', rarity: 'Uncommon' },
          { name: 'Phoenix Fruit', multiplier: '15x', statType: 'energy', rarity: 'Supreme' },
          { name: 'Dough Fruit', multiplier: '10x', statType: 'energy', rarity: 'Phantom' },
        ]
      },
      {
        id: 'haki-upgrade',
        name: 'Haki Upgrade',
        type: 'progression',
        unlockCost: '100k',
        statType: 'damage',
        maxLevel: 60,
        maxBoost: '0.6x Damage'
      }
    ],
    npcs: [
        { id: 'world2-e-rank', name: 'E Rank NPC', rank: 'E', exp: 9 },
        { id: 'world2-d-rank', name: 'D Rank NPC', rank: 'D', exp: 10 },
        { id: 'world2-c-rank', name: 'C Rank NPC', rank: 'C', exp: 11 },
        { id: 'world2-b-rank', name: 'B Rank NPC', rank: 'B', exp: 12 },
        { id: 'world2-a-rank', name: 'A Rank NPC', rank: 'A', exp: 13 },
        { id: 'world2-s-rank', name: 'S Rank NPC', rank: 'S', exp: 14 },
        { id: 'shanks-boss', name: 'Shanks', rank: 'SS', exp: 30, drops: ['Aura do Imperador Vermelho'] },
    ],
    pets: [
        {
            id: 'tony',
            name: 'Tony',
            rarity: 'S-Rank',
            energy_bonus: '2.5x'
        },
        {
            id: 'laboon',
            name: 'Laboon',
            rarity: 'A-Rank',
            energy_bonus: '1.5x'
        },
        {
            id: 'blue-elephant',
            name: 'Blue Elephant',
            rarity: 'B-Rank',
            energy_bonus: '1.25x'
        }
    ],
    dungeons: [
        {
            id: 'restaurante',
            name: 'Restaurante',
            boss: 'Don Krieg',
            description: 'Sobe até o nível 1000. Dropa 5 tokens para poderes de mundos iniciais, cada um com 20% de chance de drop.'
        }
    ],
  };
  
