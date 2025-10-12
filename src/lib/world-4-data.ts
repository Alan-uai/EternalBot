
export const world4Data = {
    name: 'World 4 - Curses',
    powers: [
      {
        id: 'curses',
        name: 'Curses',
        type: 'gacha',
        statType: 'energy',
        unlockCost: '500k',
        stats: [
          { name: 'Blazing Cataclysm', multiplier: '2x', rarity: 'Common', probability: 40.55 },
          { name: 'Nullborn Phantom', multiplier: '3x', rarity: 'Uncommon', probability: 33 },
          { name: 'Infernal Crater', multiplier: '4x', rarity: 'Rare', probability: 19.9 },
          { name: 'Abyssal Tide', multiplier: '5x', rarity: 'Legendary', probability: 5 },
          { name: 'Verdant Calamity', multiplier: '8x', rarity: 'Mythic', probability: 1 },
          { name: 'Soulbender', multiplier: '10x', rarity: 'Phantom', probability: 0.5 },
          { name: 'Wandered Mind', multiplier: '12x', rarity: 'Supreme', probability: 0.05 },
        ],
      },
      {
        id: 'swords-world4',
        name: 'Swords',
        type: 'gacha',
        statType: 'damage',
        unlockCost: '1M',
        stats: [
          { name: 'Bloodthorn', multiplier: '0.5x', rarity: 'Common', probability: 40.55 },
          { name: 'Eclipse Warden', multiplier: '0.9x', rarity: 'Uncommon', probability: 33 },
          { name: 'Obsidian Reaver', multiplier: '1.5x', rarity: 'Rare', probability: 19.9 },
          { name: 'Aquarius Edge', multiplier: '2x', rarity: 'Legendary', probability: 5 },
          { name: 'Doomsoul', multiplier: '2.5x', rarity: 'Mythic', probability: 1 },
          { name: 'Redmourne', multiplier: '3x', rarity: 'Phantom', probability: 0.5 },
          { name: 'Venomstrike', multiplier: '4x', rarity: 'Supreme', probability: 0.05 },
        ],
      },
      {
        id: 'cursed-progression',
        name: 'Cursed Progression',
        type: 'progression',
        unlockCost: '2.5M',
        statType: 'damage',
        maxLevel: 410,
        maxBoost: '4.10x Damage'
      },
      {
        id: 'cursed-power',
        name: 'Cursed Power',
        type: 'gacha',
        unlockCost: '1.5M',
        statType: 'mixed',
        stats: [
            { name: 'Common Curse', multiplier: '0.6x', statType: 'damage', rarity: 'Common', probability: 40.55 },
            { name: 'Uncommon Curse', multiplier: '0.8x', statType: 'damage', rarity: 'Uncommon', probability: 33 },
            { name: 'Rare Curse', multiplier: '1x', statType: 'damage', energy_crit_bonus: '1.00%', rarity: 'Rare', probability: 19.9 },
            { name: 'Epic Curse', multiplier: '2x', statType: 'damage', energy_crit_bonus: '2.00%', rarity: 'Epic', probability: 5 },
            { name: 'Legendary Curse', multiplier: '3x', statType: 'damage', energy_crit_bonus: '3.00%', rarity: 'Legendary', probability: 1 },
            { name: 'Mythical Curse', multiplier: '4x', statType: 'damage', energy_crit_bonus: '4.00%', rarity: 'Mythic', probability: 0.5 },
            { name: 'Phantom Curse', multiplier: '5x', statType: 'damage', energy_crit_bonus: '5.00%', rarity: 'Phantom', probability: 0.05 }
        ]
      }
    ],
    npcs: [
        { id: 'world4-e-rank', name: 'E Rank NPC', rank: 'E', exp: 39 },
        { id: 'world4-d-rank', name: 'D Rank NPC', rank: 'D', exp: 41 },
        { id: 'world4-c-rank', name: 'C Rank NPC', rank: 'C', exp: 43 },
        { id: 'world4-b-rank', name: 'B Rank NPC', rank: 'B', exp: 45 },
        { id: 'world4-a-rank', name: 'A Rank NPC', rank: 'A', exp: 47 },
        { id: 'world4-s-rank', name: 'S Rank NPC', rank: 'S', exp: 50 },
        { id: 'sakuni-boss', name: 'Sakuni', rank: 'SS', exp: 120, drops: ['Aura do Rei do Fogo', 'Cursed Blindfold'] },
    ],
    pets: [],
    dungeons: [
        {
            id: 'cursed-dungeon',
            name: 'Cursed Dungeon',
            description: 'A Cursed Raid está localizada no Mundo 4. Ela dropa 11 tokens para poderes de mundos iniciais, cada um com 9% de chance de drop.'
        }
    ],
  };

    

    