
export const world22Data = {
    name: 'World 22 - Shadow Garden',
    powers: [
      {
        id: 'shadow-garden',
        name: 'Shadow Garden',
        type: 'gacha',
        statType: 'energy',
        unlockCost: '5.00uQDR',
        leveling: {
          token: 'Garden Lvl Token',
          costPerLevel: 5,
          maxLevel: 50,
          description: 'Pode ser evoluído para aumentar seu poder usando Garden Lvl Tokens.'
        },
        stats: [
          { name: 'Operative', multiplier: '1x', rarity: 'Common', probability: 40.55 },
          { name: 'Agent', multiplier: '2x', rarity: 'Uncommon', probability: 33 },
          { name: 'Enforcer', multiplier: '3x', rarity: 'Rare', probability: 19.9 },
          { name: 'Commander', multiplier: '4x', rarity: 'Epic', probability: 5 },
          { name: 'Division Head', multiplier: '5x', rarity: 'Legendary', probability: 1 },
          { name: 'Shadow Council Member', multiplier: '6x', rarity: 'Mythic', probability: 0.5 },
          { name: 'The First Shadow', multiplier: '8x', rarity: 'Phantom', probability: 0.05 },
          { name: 'The Eminence', multiplier: '10x', rarity: 'Supreme', probability: 0.01 },
        ],
      },
      {
        id: 'shadow-arts',
        name: 'Shadow Arts',
        type: 'gacha',
        statType: 'damage',
        unlockCost: '7.50uQDR',
        leveling: {
          token: 'Arts Lvl Token',
          costPerLevel: 5,
          maxLevel: 50,
          description: 'Pode ser evoluído para aumentar seu poder usando Arts Lvl Tokens.'
        },
        stats: [
          { name: 'Silent Step', multiplier: '1x', rarity: 'Common', probability: 40.55 },
          { name: 'Shadow Bind', multiplier: '1.5x', rarity: 'Uncommon', probability: 33 },
          { name: 'Mirage Strike', multiplier: '2x', rarity: 'Rare', probability: 19.9 },
          { name: 'Eclipse Slash', multiplier: '2.5x', rarity: 'Epic', probability: 5 },
          { name: 'Abyssal Blade', multiplier: '3x', rarity: 'Legendary', probability: 1 },
          { name: 'Void Erasure', multiplier: '3.5x', rarity: 'Mythic', probability: 0.5 },
          { name: 'Eternal Shadow Waltz', multiplier: '4x', rarity: 'Phantom', probability: 0.05 },
          { name: 'I Am Atomic', multiplier: '5x', rarity: 'Supreme', probability: 0.01 },
        ],
      },
       {
        id: 'eminence-energy',
        name: 'Eminence Energy',
        type: 'progression',
        statType: 'energy',
        unlockCost: '10.00uQDR',
        maxLevel: 50,
        maxBoost: '0.5x Energy'
      },
      {
        id: 'eminence-damage',
        name: 'Eminence Damage',
        type: 'progression',
        statType: 'damage',
        unlockCost: '12.50uQDR',
        maxLevel: 50,
        maxBoost: '0.5x Damage'
      },
      {
        id: 'eminence-luck',
        name: 'Eminence Luck',
        type: 'progression',
        statType: 'luck',
        unlockCost: '15.00uQDR',
        maxLevel: 50,
        maxBoost: '0.5x Luck'
      },
      {
        id: 'eminence-coins',
        name: 'Eminence Coins',
        type: 'progression',
        statType: 'coin',
        unlockCost: '17.50uQDR',
        maxLevel: 50,
        maxBoost: '0.5x Coins'
      }
    ],
    npcs: [
        { id: 'world22-e-rank', name: 'E Rank NPC', rank: 'E', exp: 50816596 },
        { id: 'world22-d-rank', name: 'D Rank NPC', rank: 'D', exp: 55898255 },
        { id: 'world22-c-rank', name: 'C Rank NPC', rank: 'C', exp: 61488081 },
        { id: 'world22-b-rank', name: 'B Rank NPC', rank: 'B', exp: 67636889 },
        { id: 'world22-a-rank', name: 'A Rank NPC', rank: 'A', exp: 74400578 },
        { id: 'world22-s-rank', name: 'S Rank NPC', rank: 'S', exp: 81840636 },
        { id: 'world22-ss-rank', name: 'SS Rank NPC', rank: 'SS', exp: 102300794 },
        { id: 'world22-sss-rank', name: 'SSS Rank NPC', rank: 'SSS', exp: 153451192 },
    ],
    pets: [],
    dungeons: [],
    shadows: [],
    stands: []
  };

