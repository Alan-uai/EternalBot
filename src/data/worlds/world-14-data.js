
export const world14Data = {
  id: 'world-14',
  title: 'Mundo 14 - Ilha da Magia',
  summary: 'Mundo de Clover, focado em sorte e energia.',
  npcs: [
    { name: 'Plebeu Mágico', rank: 'E', exp: 4.5e10, hp: '1NVG' },
    { name: 'Nobre Mágico', rank: 'D', exp: 6.5e10, hp: '10NVG' },
    { name: 'Cavaleiro Mágico', rank: 'C', exp: 9.5e10, hp: '100NVG' },
    { name: 'Vice-Capitão', rank: 'B', exp: 1.4e11, hp: '1TGN' },
    { name: 'Capitão', rank: 'A', exp: 2e11, hp: '10TGN' },
    { name: 'Rei Mago', rank: 'S', exp: 3e11, hp: '2.39SeV' },
    { name: 'Valzora', rank: 'SS', exp: 6e11, hp: '4.79SeV', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338750591930449/ScreenRecording_10-21-2025_10-57-05_1.mov?ex=68fa1304&is=68f8c184&hm=24d9660f7aebb87aaa473d6dbe06e9b920ca22c0080fffe07b81913cf3b3fdbe&', drops: {} },
  ],
  pets: [
    { name: 'Grimório', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.14x' },
    { name: 'Pássaro Anti-Magia', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.28x' },
    { name: 'Diabinho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.42x' },
  ],
  powers: [
    {
      name: 'Poder Mágico',
      type: 'progression',
      statType: 'luck',
      maxLevel: 40,
      maxBoost: '40% Star Luck',
      unlockCost: '250M',
    },
    {
        name: 'Ultimate Skills',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '90Qn',
    },
    {
        name: 'Species',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '1.1Qn',
    },
    {
        name: 'Demon Lord Energy',
        type: 'progression',
        statType: 'energy',
        unlockCost: '10Qn',
    },
    {
        name: 'Demon Lord Damage',
        type: 'progression',
        statType: 'damage',
        unlockCost: '7.5Qn',
    },
    {
        name: 'Demon Lord Luck',
        type: 'progression',
        statType: 'luck',
        unlockCost: '20Qn',
    },
    {
        name: 'Demon Lord Coins',
        type: 'progression',
        statType: 'coin',
        unlockCost: '30Qn',
    },
  ],
  accessories: [
    { 
      id: 'slime-mask', 
      name: 'Slime Mask', 
      slot: 'Face',
      world: '14', 
      npc: 'Rei Mago', 
      rank: 'S-Rank', 
      bonuses: [
        {
          type: 'energy',
          valuesByRarity: [
            { rarity: "Common", value: "0.05x" },
            { rarity: "Uncommon", value: "0.075x" },
            { rarity: "Rare", value: "0.1x" },
            { rarity: "Epic", value: "0.125x" },
            { rarity: "Legendary", value: "0.15x" },
            { rarity: "Mythic", value: "0.175x" },
            { rarity: "Phantom", value: "0.25x" },
            { rarity: "Supreme", value: "0.375x" }
          ]
        },
        {
          type: 'damage',
          valuesByRarity: [
            { rarity: "Common", value: "0.05x" },
            { rarity: "Uncommon", value: "0.075x" },
            { rarity: "Rare", value: "0.1x" },
            { rarity: "Epic", value: "0.125x" },
            { rarity: "Legendary", value: "0.15x" },
            { rarity: "Mythic", value: "0.175x" },
            { rarity: "Phantom", value: "0.25x" },
            { rarity: "Supreme", value: "0.375x" }
          ]
        },
        {
          type: 'coin',
          valuesByRarity: [
            { rarity: "Common", value: "0.05x" },
            { rarity: "Uncommon", value: "0.075x" },
            { rarity: "Rare", value: "0.1x" },
            { rarity: "Epic", value: "0.125x" },
            { rarity: "Legendary", value: "0.15x" },
            { rarity: "Mythic", value: "0.175x" },
            { rarity: "Phantom", value: "0.25x" },
            { rarity: "Supreme", value: "0.375x" }
          ]
        },
        {
          type: 'exp',
          valuesByRarity: [
            { rarity: "Common", value: "1%" },
            { rarity: "Uncommon", value: "1.5%" },
            { rarity: "Rare", value: "2%" },
            { rarity: "Epic", value: "2.5%" },
            { rarity: "Legendary", value: "3%" },
            { rarity: "Mythic", value: "3.5%" },
            { rarity: "Phantom", value: "5%" },
            { rarity: "Supreme", value: "7.5%" }
          ]
        }
      ]
    }
  ],
};

  