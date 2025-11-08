
export const world24Data = {
  id: 'world-24',
  title: 'Mundo 24 - Tumba de Nazarick',
  summary: 'Um mundo antigo e amaldiçoado que abriga a perigosa Tomb Arena Raid e os poderosos seres da tumba.',
  npcs: [
    { name: 'Albedis', rank: 'SS', exp: 0, hp: '414qQGNT', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339948678221874/ScreenRecording_10-18-2025_08-55-11_1.mov?ex=68fa1422&is=68f8c2a2&hm=e8afd88f206840d96e9bf2c3950141a8ccf4f6f2c8100520ba04b41a96618a4b&', drops: {} },
    { name: 'Anz Ool Gawn', rank: 'SSS', exp: 0, hp: '4.14dQGNT', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430340009541763184/ScreenRecording_10-18-2025_08-56-23_1.mov?ex=68fa1430&is=68f8c2b0&hm=ec3ebdf9aed49253605c11f52d55c69ede9c67bfc3b376cc190570e0de358b0c&', drops: {} },
  ],
  pets: [],
  powers: [],
  dungeons: [
    { name: 'Tomb Arena Raid', boss: 'Jalbathar', description: 'Uma raid desafiadora em uma arena antiga.'}
  ],
  accessories: [
      { 
        id: 'jalbathar-mask', 
        name: 'Jalbathar Mask', 
        slot: 'Face',
        world: 'Mundo 24', 
        npc: 'Tomb Arena Raid', 
        rank: 'Lendário-Rank', 
        bonuses: [
            {
                type: 'energy',
                valuesByRarity: [
                    { "rarity": "Common", "value": "0.133x" },
                    { "rarity": "Uncommon", "value": "0.2x" },
                    { "rarity": "Rare", "value": "0.266x" },
                    { "rarity": "Epic", "value": "0.333x" },
                    { "rarity": "Legendary", "value": "0.4x" },
                    { "rarity": "Mythic", "value": "0.466x" },
                    { "rarity": "Phantom", "value": "0.665x" },
                    { "rarity": "Supreme", "value": "1x" }
                ]
            },
            {
                type: 'damage',
                valuesByRarity: [
                    { "rarity": "Common", "value": "0.266x" },
                    { "rarity": "Uncommon", "value": "0.399x" },
                    { "rarity": "Rare", "value": "0.532x" },
                    { "rarity": "Epic", "value": "0.665x" },
                    { "rarity": "Legendary", "value": "0.8x" },
                    { "rarity": "Mythic", "value": "0.931x" },
                    { "rarity": "Phantom", "value": "1.33x" },
                    { "rarity": "Supreme", "value": "2x" }
                ]
            },
            {
                type: 'coin',
                valuesByRarity: [
                    { "rarity": "Common", "value": "0.133x" },
                    { "rarity": "Uncommon", "value": "0.2x" },
                    { "rarity": "Rare", "value": "0.266x" },
                    { "rarity": "Epic", "value": "0.333x" },
                    { "rarity": "Legendary", "value": "0.4x" },
                    { "rarity": "Mythic", "value": "0.466x" },
                    { "rarity": "Phantom", "value": "0.665x" },
                    { "rarity": "Supreme", "value": "1x" }
                ]
            },
            {
                type: 'exp',
                valuesByRarity: [
                    { "rarity": "Common", "value": "1.67%" },
                    { "rarity": "Uncommon", "value": "2.51%" },
                    { "rarity": "Rare", "value": "3%" },
                    { "rarity": "Epic", "value": "4.18%" },
                    { "rarity": "Legendary", "value": "5.01%" },
                    { "rarity": "Mythic", "value": "5.85%" },
                    { "rarity": "Phantom", "value": "8%" },
                    { "rarity": "Supreme", "value": "12.5%" }
                ]
            }
        ]
      },
      { 
        id: 'jalbathar-wings', 
        name: 'Jalbathar Wings', 
        slot: 'Back',
        world: 'Mundo 24', 
        npc: 'Tomb Arena Raid', 
        rank: 'Lendário-Rank', 
        bonuses: [
        { 
          type: 'damage', 
          valuesByRarity: [
            { "rarity": "Common", "value": "0.133x" },
            { "rarity": "Uncommon", "value": "0.2x" },
            { "rarity": "Rare", "value": "0.266x" },
            { "rarity": "Epic", "value": "0.333x" },
            { "rarity": "Legendary", "value": "0.4x" },
            { "rarity": "Mythic", "value": "0.466x" },
            { "rarity": "Phantom", "value": "0.665x" },
            { "rarity": "Supreme", "value": "1x" }
          ] 
        },
        { 
          type: 'energy', 
          valuesByRarity: [
            { "rarity": "Common", "value": "0.4x" },
            { "rarity": "Uncommon", "value": "0.6x" },
            { "rarity": "Rare", "value": "0.8x" },
            { "rarity": "Epic", "value": "1x" },
            { "rarity": "Legendary", "value": "1.2x" },
            { "rarity": "Mythic", "value": "1.4x" },
            { "rarity": "Phantom", "value": "2x" },
            { "rarity": "Supreme", "value": "3x" }
          ] 
        },
        { 
          type: 'exp', 
          valuesByRarity: [
            { "rarity": "Common", "value": "2%" },
            { "rarity": "Uncommon", "value": "2.51%" },
            { "rarity": "Rare", "value": "3%" },
            { "rarity": "Epic", "value": "4.18%" },
            { "rarity": "Legendary", "value": "5%" },
            { "rarity": "Mythic", "value": "5.85%" },
            { "rarity": "Phantom", "value": "8%" },
            { "rarity": "Supreme", "value": "12.5%" }
          ]
        }
      ]
      },
      { 
        id: 'jalbathar-tail', 
        name: 'Jalbathar Tail', 
        slot: 'Waist',
        world: 'Mundo 24', 
        npc: 'Tomb Arena Raid', 
        rank: 'Lendário-Rank',
        bonuses: [
          {
            type: 'damage',
            valuesByRarity: [
              { "rarity": "Common", "value": "0.133x" },
              { "rarity": "Uncommon", "value": "0.2x" },
              { "rarity": "Rare", "value": "0.266x" },
              { "rarity": "Epic", "value": "0.333x" },
              { "rarity": "Legendary", "value": "0.4x" },
              { "rarity": "Mythic", "value": "0.466x" },
              { "rarity": "Phantom", "value": "0.665x" },
              { "rarity": "Supreme", "value": "1x" }
            ]
          },
          {
            type: 'energy',
            valuesByRarity: [
              { "rarity": "Common", "value": "0.133x" },
              { "rarity": "Uncommon", "value": "0.2x" },
              { "rarity": "Rare", "value": "0.266x" },
              { "rarity": "Epic", "value": "0.333x" },
              { "rarity": "Legendary", "value": "0.4x" },
              { "rarity": "Mythic", "value": "0.466x" },
              { "rarity": "Phantom", "value": "0.665x" },
              { "rarity": "Supreme", "value": "1x" }
            ]
          }
        ]
      }
  ],
};
