
export const world8Data = {
  id: 'world-8',
  title: 'Mundo 8 - Ilha Shinobi',
  summary: 'Mundo ninja com dois chefes, Itechi e Madera, e foco em sorte e dano.',
  npcs: [
    { name: 'Sekuri', rank: 'E', hp: '1SpD', drops: { coins: { amount: 'x500M', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x483', probability: 1 }, avatar_soul: { amount: 1, probability: 0.1 }, shadow_soul: { amount: 1, probability: 0.1 } } },
    { name: 'Kid Norto', rank: 'D', hp: '10SpD', drops: { coins: { amount: 'x1B', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x531', probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 }, shadow_soul: { amount: 1, probability: 0.11 } } },
    { name: 'Kid Seske', rank: 'C', hp: '100SpD', drops: { coins: { amount: 'x1.5B', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x584', probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 }, shadow_soul: { amount: 1, probability: 0.125 } } },
    { name: 'Kakashki', rank: 'B', hp: '1OcD', drops: { coins: { amount: 'x2B', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, 'ReAwakening Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x643', probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 }, shadow_soul: { amount: 1, probability: 0.15 } } },
    { name: 'Jiria', rank: 'A', hp: '10OcD', drops: { coins: { amount: 'x2.5B', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, 'Eye Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x707', probability: 1 }, avatar_soul: { amount: 1, probability: 0.2 }, shadow_soul: { amount: 1, probability: 0.2 } } },
    { name: 'Tsuni', rank: 'S', hp: '1.41QnD', drops: { coins: { amount: 'x3B', probability: 1 }, 'Chakra Token': { amount: '1-5', probability: 0.1 }, 'Eye Token': { amount: '1-5', probability: 0.1 }, exp: { amount: 'x777', probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 }, shadow_soul: { amount: 1, probability: 0.25 } } },
    { name: 'Itechi', rank: 'SS', hp: '2.82QnD', drops: { coins: { amount: 'x7B', probability: 1 }, 'Chakra Token': { amount: 'x3-5', probability: 0.1 }, 'Eye Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x1.92k', probability: 1 }, avatar_soul: { amount: 1, probability: 0.5 }, shadow_soul: { amount: 1, probability: 0.5 }, 'shinobi-flops': { probability: 0.25 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338276535046155/ScreenRecording_10-21-2025_10-36-25_1.mov?ex=68fa1293&is=68f8c113&hm=429938bb3f8f6e74c5a5d5aa424f68a3eab8aeb7f3822abc25bc049bb5e058a7&' },
    { name: 'Madera', rank: 'SS', hp: '5.64QnD', drops: { coins: { amount: 'x70B', probability: 1 }, 'Chakra Token': { amount: 'x3-5', probability: 0.1 }, 'Eye Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x2.88k', probability: 1 }, avatar_soul: { amount: 1, probability: 0.5 }, 'shadow:madera': { probability: 1 }, shadow_soul: { amount: 1, probability: 0.5 }, 'shinobi-flops': { probability: 0.25 }, leafy_aura: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338462162092093/ScreenRecording_10-21-2025_10-36-50_1.mov?ex=68fa12bf&is=68f8c13f&hm=6608bd1a66e65473faf5d3e05f279e8187d991512894aa533f07cf185ee2525e&' },
  ],
  powers: [
    {
      name: 'Poder Ninja',
      type: 'progression',
      statType: 'luck',
      maxLevel: 25,
      maxBoost: '30% Star Luck',
      unlockCost: '300B',
    },
    {
      name: 'Chakra Progression',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '300B',
    },
    {
      name: 'Power Eyes',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '350B',
    },
  ],
  accessories: [
    { 
      id: 'shinobi-flops', 
      name: 'Shinobi Flops', 
      slot: 'Leg',
      world: '8', 
      npc: 'Itechi, Madera', 
      rank: 'SS-Rank', 
      bonuses: [
        { 
          type: 'energy', 
          valuesByRarity: [
            { rarity: 'Common', value: '0.1x', chance: '36%' },
            { rarity: 'Uncommon', value: '0.15x', chance: '31.75%' },
            { rarity: 'Rare', value: '0.2x', chance: '15%' },
            { rarity: 'Epic', value: '0.25x', chance: '10%' },
            { rarity: 'Legendary', value: '0.3x', chance: '5%' },
            { rarity: 'Mythic', value: '0.35x', chance: '1%' },
            { rarity: 'Phantom', value: '0.75x', chance: '0.75%' },
            { rarity: 'Supreme', value: '1x', chance: '0.5%' }
          ]
        },
        { 
          type: 'movespeed', 
          valuesByRarity: [
            { rarity: 'Common', value: '10%', chance: '36%' },
            { rarity: 'Uncommon', value: '15%', chance: '31.75%' },
            { rarity: 'Rare', value: '20%', chance: '15%' },
            { rarity: 'Epic', value: '25%', chance: '10%' },
            { rarity: 'Legendary', value: '30%', chance: '5%' },
            { rarity: 'Mythic', value: '35%', chance: '1%' },
            { rarity: 'Phantom', value: '50%', chance: '0.75%' },
            { rarity: 'Supreme', value: '75%', chance: '0.5%' }
          ]
        }
      ]
    }
  ],
};
