
export const world23Data = {
    id: 'world-23',
    title: 'Mundo 23 - Planeta Boro',
    summary: 'Planeta natal de Lord Boro e do caçador intergalático.',
    npcs: [
        { name: 'Lord Boro', rank: 'SS', exp: 0, hp: '733SpQDR', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339507302961293/ScreenRecording_10-27-2025_13-34-55_1.mov?ex=68fa13b8&is=68f8c238&hm=759d42fcc3b398b7c0836941f4fcffc1a9da21bdb9cf9dfadcbe3409875d5c5b&', drops: {} },
        { name: 'Galaxy Hunter', rank: 'SSS', exp: 0, hp: '871NQQDR', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339564265934898/ScreenRecording_10-21-2025_11-12-56_1.mov?ex=68fa13c6&is=68f8c246&hm=2c9b75ae8de13592e0ad17bdaa5da6ef69c3554732d304ab1909771a90c79ad4&', drops: {} },
    ],
    pets: [],
    powers: [
        {
            name: 'Energy Threat Level',
            type: 'progression',
            statType: 'energy',
            unlockCost: '5k Exchange Coins 2'
        },
        {
            name: 'Punch Power',
            type: 'gacha',
            statType: 'damage',
            unlockCost: '5k Exchange Coins 2'
        },
        {
            name: 'Energy Threat Leveling',
            type: 'progression',
            statType: 'energy',
            unlockCost: '5k Exchange Coins 2'
        },
        {
            name: 'Punch Power Leveling',
            type: 'progression',
            statType: 'damage',
            unlockCost: '5k Exchange Coins 2'
        }
    ],
    dungeons: [],
    accessories: [
        { 
          id: 'red-hero-boots', 
          name: 'Red Hero Boots', 
          slot: 'Leg',
          world: '23', 
          npc: 'Lord Boro', 
          rank: 'SS-Rank', 
          bonuses: [
            { 
              type: 'damage', 
              valuesByRarity: [
                { rarity: "Common", value: "0.3x" },
                { rarity: "Uncommon", value: "0.45x" },
                { rarity: "Rare", value: "0.6x" },
                { rarity: "Epic", value: "0.75x" },
                { rarity: "Legendary", value: "0.9x" },
                { rarity: "Mythic", value: "1.05x" },
                { rarity: "Phantom", value: "1.5x" },
                { rarity: "Supreme", value: "2.25x" }
              ]
            },
            { 
              type: 'movespeed', 
              valuesByRarity: [
                { rarity: "Common", value: "13.3%" },
                { rarity: "Uncommon", value: "20%" },
                { rarity: "Rare", value: "26.6%" },
                { rarity: "Epic", value: "33.3%" },
                { rarity: "Legendary", value: "40%" },
                { rarity: "Mythic", value: "46.55%" },
                { rarity: "Phantom", value: "66.5%" },
                { rarity: "Supreme", value: "100%" }
              ]
            }
          ]
        }
    ],
};
