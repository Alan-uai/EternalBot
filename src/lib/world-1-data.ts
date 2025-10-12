export const world1Data = {
    name: 'World 1',
    powers: [
      {
        id: 'dragon-race',
        name: 'Dragon Race',
        type: 'gacha',
        statType: 'energy',
        unlockCost: '1k',
        stats: [
          { name: 'Human', multiplier: '2x', rarity: 'Common', probability: 40.55 },
          { name: 'Android', multiplier: '3x', rarity: 'Uncommon', probability: 33 },
          { name: 'Namekian', multiplier: '4x', rarity: 'Rare', probability: 19.9 },
          { name: 'Frost Demon', multiplier: '5x', rarity: 'Legendary', probability: 5 },
          { name: 'Majin', multiplier: '8x', rarity: 'Mythic', probability: 1 },
          { name: 'Half-Saiyan', multiplier: '10x', rarity: 'Phantom', probability: 0.05 },
          { name: 'Saiyan', multiplier: '12x', rarity: 'Phantom', probability: 0.05 },
        ],
      },
      {
        id: 'saiyan-evolution',
        name: 'Saiyan Evolution',
        type: 'gacha',
        statType: 'energy',
        unlockCost: '10k',
        stats: [
          { name: 'Great Ape', multiplier: '2x', rarity: 'Common', probability: 40.55 },
          { name: 'Super Saiyan Grad 1', multiplier: '3x', rarity: 'Uncommon', probability: 33 },
          { name: 'Super Saiyan Grad 2', multiplier: '4x', rarity: 'Rare', probability: 19.9 },
          { name: 'Super Saiyan Grad 3', multiplier: '5x', rarity: 'Legendary', probability: 5 },
          { name: 'Full Power Super Saiyan', multiplier: '8x', rarity: 'Mythic', probability: 1 },
          { name: 'Super Saiyan 2', multiplier: '10x', rarity: 'Phantom', probability: 0.5 },
          { name: 'Super Saiyan 3', multiplier: '12x', rarity: 'Supreme', probability: 0.05 },
        ],
      },
    ],
    npcs: [
        { id: 'world1-e-rank', name: 'E Rank NPC', rank: 'E', exp: 1 },
        { id: 'world1-d-rank', name: 'D Rank NPC', rank: 'D', exp: 2 },
        { id: 'world1-c-rank', name: 'C Rank NPC', rank: 'C', exp: 3 },
        { id: 'world1-b-rank', name: 'B Rank NPC', rank: 'B', exp: 4 },
        { id: 'world1-a-rank', name: 'A Rank NPC', rank: 'A', exp: 5 },
        { id: 'world1-s-rank', name: 'S Rank NPC', rank: 'S', exp: 6 },
        { id: 'kid-kohan-boss', name: 'Kid Kohan', rank: 'SS', exp: 15, drops: ['Aura da Sorte', 'Straw Hat'] },
    ],
    pets: [],
    dungeons: [
        {
            id: 'tournemant',
            name: 'Tournemant'
        }
    ],
  };
  