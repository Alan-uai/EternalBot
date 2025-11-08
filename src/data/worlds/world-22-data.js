
export const world22Data = {
  id: 'world-22',
  title: 'Mundo 22 - Ilha da Rainha de Sangue',
  summary: 'Mundo governado pela temível Rainha de Sangue e seus asseclas.',
  npcs: [
    { name: 'Blood Queen', rank: 'SS', exp: 0, hp: '30.5qdQDR', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339417649844325/ScreenRecording_10-21-2025_11-09-58_1.mov?ex=68fa13a3&is=68f8c223&hm=c1909e1aa4cfccbf5603388e58e759e8512fe5029ee899d4480488e12894004f&', drops: {} },
    { name: 'Shadow', rank: 'SSS', exp: 0, hp: '305QnQDR', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339471680733245/ScreenRecording_10-21-2025_11-11-00_1.mov?ex=68fa13b0&is=68f8c230&hm=d7c9a2f290d181b637bead0f162ef94bc0cdbfbcd16d724752e24784e90ef541&', drops: {} },
  ],
  pets: [],
  powers: [],
  dungeons: [],
  accessories: [
    { 
      id: 'neck-fur', 
      name: 'Neck Fur', 
      slot: 'Neck',
      world: '22', 
      npc: 'Shadow', 
      rank: 'SSS-Rank', 
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
        },
        { 
          type: 'coin', 
          valuesByRarity: [
            { rarity: "Common", value: "0.6x" },
            { rarity: "Uncommon", value: "0.9x" },
            { rarity: "Rare", value: "1.2x" },
            { rarity: "Epic", value: "1.5x" },
            { rarity: "Legendary", value: "1.8x" },
            { rarity: "Mythic", value: "2.1x" },
            { rarity: "Phantom", value: "3x" },
            { rarity: "Supreme", value: "4.5x" }
          ]
        },
        { 
          type: 'exp', 
          valuesByRarity: [
            { rarity: "Common", value: "2%" },
            { rarity: "Uncommon", value: "3%" },
            { rarity: "Rare", value: "4%" },
            { rarity: "Epic", value: "5%" },
            { rarity: "Legendary", value: "6%" },
            { rarity: "Mythic", value: "7%" },
            { rarity: "Phantom", value: "10%" },
            { rarity: "Supreme", value: "15%" }
          ]
        }
      ]
    },
    { 
      id: 'crested-wingbands', 
      name: 'Crested Wingbands', 
      slot: 'Back',
      world: '22', 
      npc: 'Shadow', 
      rank: 'SSS-Rank', 
      bonuses: [
        { 
          type: 'damage', 
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
          type: 'coin', 
          valuesByRarity: [
            { rarity: "Common", value: "0.4x" },
            { rarity: "Uncommon", value: "0.6x" },
            { rarity: "Rare", value: "0.8x" },
            { rarity: "Epic", value: "1x" },
            { rarity: "Legendary", value: "1.2x" },
            { rarity: "Mythic", value: "1.4x" },
            { rarity: "Phantom", value: "2x" },
            { rarity: "Supreme", value: "3x" }
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
  missions: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank A), com tarefas que se iniciam neste mundo."
    }
  ],
};

    