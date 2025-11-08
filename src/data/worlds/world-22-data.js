
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
      boss: 'Shadow', 
      rarity: 'SSS-Rank', 
      bonuses: [
        { type: 'energy', values: ['2%', '3%', '4%', '5%', '6%', '7%', '10%', '15%'] },
        { type: 'damage', values: ['0.6x', '0.9x', '1.2x', '1.5x', '1.8x', '2.1x', '3x', '4.5x'] }
      ]
    },
    { 
      id: 'crested-wingbands', 
      name: 'Crested Wingbands', 
      slot: 'Back',
      world: '22', 
      boss: 'Shadow', 
      rarity: 'B-Rank', 
      bonuses: [
        { type: 'damage', values: ['1.1x'] },
        { type: 'coin', values: ['1.1x'] },
        { type: 'exp', values: ['1.1x'] }
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
