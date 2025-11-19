
export const world7Data = {
  id: 'world-7',
  title: 'Mundo 7 - Ilha dos Viajantes',
  summary: 'Mundo temático de Black Clover, com foco em energia e moedas. O chefe final é Novi Chroni.',
  npcs: [
    { name: 'Noalle', rank: 'E', exp: 400000, hp: '1sxD' },
    { name: 'Megna', rank: 'D', exp: 600000, hp: '10sxD' },
    { name: 'Finrel', rank: 'C', exp: 900000, hp: '100sxD' },
    { name: 'Aste', rank: 'B', exp: 1300000, hp: '1SpD' },
    { name: 'Yune', rank: 'A', exp: 1900000, hp: '10SpD' },
    { name: 'Yemi', rank: 'S', exp: 2800000, hp: '50.5tdD' },
    { name: 'Novi Chroni', rank: 'SS', exp: 7000000, hp: '101tdD', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338227725664287/ScreenRecording_10-21-2025_10-35-22_1.mov?ex=68fa1287&is=68f8c107&hm=6ce1e4abfb80c01df86b05dc364cc1e0f45515182d53142c7d75fe9ffad47f3b&', drops: {} },
  ],
  powers: [
    {
      name: 'Poder Temporal',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1M',
      stats: [
        { name: 'Acelerar', multiplier: '2.5x', rarity: 'Comum', probability: 30 },
        { name: 'Parar o Tempo', multiplier: '4x', rarity: 'Raro', probability: 8 },
        { name: 'Deus do Tempo', multiplier: '6x', rarity: 'Phantom', probability: 0.15 },
      ],
    },
    {
        name: 'Grimoire',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '250B',
    },
    {
        name: 'Water Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '50B',
    },
    {
        name: 'Fire Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '75B',
    },
    {
        name: 'Wind Spirit Progression',
        type: 'progression',
        statType: 'mixed',
        unlockCost: '150B',
    },
  ],
  missions: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank E), com tarefas neste mundo."
    }
  ]
};

  
