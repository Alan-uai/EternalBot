
export const world15Data = {
  id: 'world-15',
  title: 'Mundo 15 - Ilha Virtual',
  summary: 'Mundo de SAO, com a espada de energia Lucidator e a Gleam Raid.',
  npcs: [
    { name: 'Lobo', rank: 'E', exp: 2.2e11, hp: '1UTG' },
    { name: 'Javali', rank: 'D', exp: 3.2e11, hp: '10UTG' },
    { name: 'Goblin', rank: 'C', exp: 4.8e11, hp: '100UTG' },
    { name: 'Ogro', rank: 'B', exp: 7e11, hp: '1DTG' },
    { name: 'Ceifador', rank: 'A', exp: 1e12, hp: '10DTG' },
    { name: 'Kayaba', rank: 'S', exp: 1.5e12, hp: '483SPG' },
    { name: 'The Paladin', rank: 'SS', exp: 3e12, hp: '967SPG', drops: { aura: { name: 'Vitual Aura', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338800034513017/ScreenRecording_10-21-2025_10-57-29_1.mov?ex=68fa1310&is=68f8c190&hm=7e4aa96055fd3d86befd44af404ac119d421580bc8fad1771f2b8bf1dba031f3&' },
  ],
  powers: [
    {
      name: 'Habilidade de Espada',
      type: 'gacha',
      statType: 'mixed',
      unlockCost: '500M',
      stats: [
        { name: 'Corte Vertical', multiplier: '2.0x', rarity: 'Comum', probability: 30, statType: 'damage' },
        { name: 'Explosão Estelar', multiplier: '5.0x', rarity: 'Raro', probability: 5, statType: 'damage' },
        { name: 'Vontade Encarnada', multiplier: '10x', rarity: 'Phantom', probability: 0.05, statType: 'energy' },
      ],
    },
  ],
  dungeons: [
      { name: 'Gleam Raid', boss: 'The Gleam Eyes', description: 'Uma raid de desafio individual com 10 ondas.'}
  ],
  missions: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank C), com tarefas neste mundo."
    }
  ]
};
