
export const world19Data = {
  id: 'world-19',
  title: 'Mundo 19 - Ilha do Inferno',
  summary: 'Um mundo infernal com múltiplos chefes e a espada de energia Excalibur.',
  npcs: [
    { name: 'Diabo de Fogo', rank: 'E', exp: 1.5e14, hp: '1NoTG' },
    { name: 'Diabo de Gelo', rank: 'D', exp: 2.2e14, hp: '10NoTG', drops: { weapon: { name: 'Excalibur', type: 'energy', probability: 0.1 } } },
    { name: 'Diabo das Sombras', rank: 'C', exp: 3.2e14, hp: '100NoTG' },
    { name: 'Diabo da Morte', rank: 'B', exp: 4.8e14, hp: '1QDR' },
    { name: 'Lúcifer', rank: 'A', exp: 7e14, hp: '10QDR' },
    { name: 'Satan', rank: 'S', exp: 1e15, hp: '60.5UTG' },
    { name: 'Leonardo', rank: 'SS', exp: 2e15, hp: '1.76QnTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339126934241340/ScreenRecording_10-21-2025_11-02-02_1.mov?ex=68fa135e&is=68f8c1de&hm=1afe3e75d2e8f95359ea7bde3ae5a1303cb0743cb4a21e6b43ee65b50fdcd00&', drops: {} },
    { name: 'Bansho', rank: 'SSS', exp: 1e16, hp: '17.6ssTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339182936457297/ScreenRecording_10-21-2025_11-05-48_1.mov?ex=68fa136b&is=68f8c1eb&hm=8d3acdfc32be2c008eb6c46e92068bafa52b13850e5f798fe6307535da102052&', drops: {} },
  ],
  pets: [
    { name: 'Cérbero', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.38x' },
    { name: 'Diabrete', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.57x' },
  ],
  powers: [
    {
      name: 'Poder Infernal',
      type: 'progression',
      statType: 'damage',
      maxLevel: 50,
      maxBoost: '50% Damage',
      unlockCost: '2B',
    },
    {
        name: 'Special Fire Force',
        type: 'gacha',
        statType: 'mixed',
        unlockCost: '200Sp',
    },
    {
        name: 'Mushi Bite',
        type: 'gacha',
        statType: 'mixed',
        unlockCost: '100Sp',
    },
    {
        name: '1st Gen Leveling',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '200Sp',
    },
    {
        name: '2nd Gen Leveling',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '300Sp',
    },
    {
        name: '3rd Gen Leveling',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '400Sp',
    },
    {
        name: 'Hybrid Leveling',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '500Sp',
    },
    {
        name: 'Adolla Leveling',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '600Sp',
    },
    {
        name: 'Pyrokenetics Evolve',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '100Sp',
    },
    {
        name: 'Adolla Blessing',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '10',
    },
  ],
  accessories: [
    { 
      id: 'fire-force-pants', 
      name: 'Fire Force Pants', 
      slot: 'Pant',
      world: '19', 
      npc: 'Diabo das Sombras', 
      rank: 'C-Rank', 
      bonuses: [
        { 
          type: 'energy', 
          valuesByRarity: [
            { rarity: "Common", value: "0.133x" },
            { rarity: "Uncommon", value: "0.2x" },
            { rarity: "Rare", value: "0.266x" },
            { rarity: "Epic", value: "0.333x" },
            { rarity: "Legendary", value: "0.4x" },
            { rarity: "Mythic", value: "0.466x" },
            { rarity: "Phantom", value: "0.665x" },
            { rarity: "Supreme", value: "1x" }
          ]
        }
      ]
    },
    { 
      id: 'fire-force-cape', 
      name: 'Fire Force Cape', 
      slot: 'Back',
      world: '19', 
      npc: 'Satan', 
      rank: 'S-Rank', 
      bonuses: [
        { 
          type: 'damage', 
          valuesByRarity: [
            { rarity: "Common", value: "0.06x" },
            { rarity: "Uncommon", value: "0.09x" },
            { rarity: "Rare", value: "0.12x" },
            { rarity: "Epic", value: "0.15x" },
            { rarity: "Legendary", value: "0.18x" },
            { rarity: "Mythic", value: "0.21x" },
            { rarity: "Phantom", value: "0.3x" },
            { rarity: "Supreme", value: "0.45x" }
          ] 
        },
        { 
          type: 'energy', 
          valuesByRarity: [
            { rarity: "Common", value: "0.2x" },
            { rarity: "Uncommon", value: "0.3x" },
            { rarity: "Rare", value: "0.4x" },
            { rarity: "Epic", value: "0.5x" },
            { rarity: "Legendary", value: "0.6x" },
            { rarity: "Mythic", value: "0.7x" },
            { rarity: "Phantom", value: "1x" },
            { rarity: "Supreme", value: "1.5x" }
          ]
        },
        { 
          type: 'exp', 
          valuesByRarity: [
            { rarity: "Common", value: "1%" },
            { rarity: "Uncommon", value: "1.5%" },
            { rarity: "Rare", "value": "2%" },
            { rarity: "Epic", value: "2.5%" },
            { rarity: "Legendary", value: "3%" },
            { rarity: "Mythic", value: "3.5%" },
            { rarity: "Phantom", value: "5%" },
            { rarity: "Supreme", value: "7.5%" }
          ]
        }
      ] 
    },
    { 
      id: 'fire-witch-hat', 
      name: 'Fire Witch Hat', 
      slot: 'Head',
      world: '19', 
      npc: 'Satan', 
      rank: 'S-Rank', 
      bonuses: [
        { 
          type: 'coin', 
          valuesByRarity: [
            { rarity: "Common", value: "0.133x" },
            { rarity: "Uncommon", value: "0.2x" },
            { rarity: "Rare", value: "0.266x" },
            { rarity: "Epic", value: "0.333x" },
            { rarity: "Legendary", value: "0.4x" },
            { rarity: "Mythic", value: "0.466x" },
            { rarity: "Phantom", value: "0.665x" },
            { rarity: "Supreme", value: "1x" }
          ]
        },
        { 
          type: 'damage', 
          valuesByRarity: [
            { rarity: "Common", value: "0.133x" },
            { rarity: "Uncommon", value: "0.2x" },
            { rarity: "Rare", value: "0.266x" },
            { rarity: "Epic", value: "0.333x" },
            { rarity: "Legendary", value: "0.4x" },
            { rarity: "Mythic", value: "0.466x" },
            { rarity: "Phantom", value: "0.665x" },
            { rarity: "Supreme", value: "1x" }
          ]
        }
      ]
    },
    { 
      id: 'fire-eye-patch', 
      name: 'Fire Eye Patch', 
      slot: 'Face',
      world: '19', 
      npc: 'Leonardo', 
      rank: 'SS-Rank', 
      bonuses: [
        { 
          type: 'energy', 
          valuesByRarity: [
            { rarity: "Common", value: "0.0667x" },
            { rarity: "Uncommon", value: "0.1x" },
            { rarity: "Rare", value: "0.133x" },
            { rarity: "Epic", value: "0.167x" },
            { rarity: "Legendary", value: "0.2x" },
            { rarity: "Mythic", value: "0.233x" },
            { rarity: "Phantom", value: "0.334x" },
            { rarity: "Supreme", value: "0.5x" }
          ]
        },
        { 
          type: 'damage', 
          valuesByRarity: [
            { rarity: "Common", value: "0.133x" },
            { rarity: "Uncommon", value: "0.2x" },
            { rarity: "Rare", value: "0.266x" },
            { rarity: "Epic", value: "0.333x" },
            { rarity: "Legendary", value: "0.4x" },
            { rarity: "Mythic", value: "0.466x" },
            { rarity: "Phantom", value: "0.665x" },
            { rarity: "Supreme", value: "1x" }
          ]
        },
        { 
          type: 'coin', 
          valuesByRarity: [
            { rarity: "Common", value: "0.0667x" },
            { rarity: "Uncommon", value: "0.1x" },
            { rarity: "Rare", value: "0.133x" },
            { rarity: "Epic", value: "0.167x" },
            { rarity: "Legendary", value: "0.2x" },
            { rarity: "Mythic", value: "0.233x" },
            { rarity: "Phantom", value: "0.334x" },
            { rarity: "Supreme", value: "0.5x" }
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

  