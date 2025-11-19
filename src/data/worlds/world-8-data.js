
export const world8Data = {
  id: 'world-8',
  title: 'Mundo 8 - Ilha Shinobi',
  summary: 'Mundo ninja com dois chefes, Itechi e Madera, e foco em sorte e dano.',
  npcs: [
    { name: 'Sekuri', rank: 'E', exp: 2800000, hp: '1SpD' },
    { name: 'Kid Norto', rank: 'D', exp: 4000000, hp: '10SpD' },
    { name: 'Kid Seske', rank: 'C', exp: 6000000, hp: '100SpD' },
    { name: 'Kakashki', rank: 'B', exp: 9000000, hp: '1OcD' },
    { name: 'Jiria', rank: 'A', exp: 13000000, hp: '10OcD' },
    { name: 'Tsuni', rank: 'S', exp: 18000000, hp: '1.41QnD' },
    { name: 'Itechi', rank: 'SS', exp: 35000000, hp: '2.82QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338276535046155/ScreenRecording_10-21-2025_10-36-25_1.mov?ex=68fa1293&is=68f8c113&hm=429938bb3f8f6e74c5a5d5aa424f68a3eab8aeb7f3822abc25bc049bb5e058a7&' },
    { name: 'Madera', rank: 'SS', exp: 40000000, hp: '5.64QnD', drops: { aura: { name: 'Aura da Folha', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338462162092093/ScreenRecording_10-21-2025_10-36-50_1.mov?ex=68fa12bf&is=68f8c13f&hm=6608bd1a66e65473faf5d3e05f279e8187d991512894aa533f07cf185ee2525e&' },
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
            { rarity: 'Common', value: '0.1x' },
            { rarity: 'Uncommon', value: '0.15x' },
            { rarity: 'Rare', value: '0.2x' },
            { rarity: 'Epic', value: '0.25x' },
            { rarity: 'Legendary', value: '0.3x' },
            { rarity: 'Mythic', value: '0.35x' },
            { rarity: 'Phantom', value: '0.75x' },
            { rarity: 'Supreme', value: '1x' }
          ]
        },
        { 
          type: 'movespeed', 
          valuesByRarity: [
            { rarity: 'Common', value: '10%' },
            { rarity: 'Uncommon', value: '15%' },
            { rarity: 'Rare', value: '20%' },
            { rarity: 'Epic', value: '25%' },
            { rarity: 'Legendary', value: '30%' },
            { rarity: 'Mythic', value: '35%' },
            { rarity: 'Phantom', value: '50%' },
            { rarity: 'Supreme', value: '75%' }
          ]
        }
      ]
    }
  ],
};
