
export const world10Data = {
  id: 'world-10',
  title: 'Mundo 10 - Ilha Turbo',
  summary: 'Mundo de ciborgues e tecnologia, com foco pesado em energia.',
  npcs: [
    { name: 'Ciborgue Nv.1', rank: 'E', exp: 70000000, hp: '1UVg' },
    { name: 'Ciborgue Nv.2', rank: 'D', exp: 100000000, hp: '10UVg' },
    { name: 'Ciborgue Nv.3', rank: 'C', exp: 150000000, hp: '100UVg' },
    { name: 'Ciborgue Nv.4', rank: 'B', exp: 220000000, hp: '1DVg' },
    { name: 'Ciborgue Nv.5', rank: 'A', exp: 320000000, hp: '10DVg' },
    { name: 'Android 18', rank: 'S', exp: 450000000, hp: '247sxD' },
    { name: 'Ken Turbo', rank: 'SS', exp: 900000000, hp: '494sxD', drops: { aura: { name: 'Energetic Aura', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338613043925173/ScreenRecording_10-21-2025_10-53-16_1.mov?ex=68fa12e3&is=68f8c163&hm=5b03c81a24b49bedaf3ea6c5c7ae05912c1afea9e3e670f56c7d384ab0616484&' },
  ],
  powers: [
    {
      name: 'Cyborg Power',
      type: 'progression',
      statType: 'energy',
      maxLevel: 30,
      maxBoost: '50% Energy',
      unlockCost: '10M',
    },
    {
      name: 'Energy Card',
      type: 'progression',
      statType: 'energy',
      unlockCost: '30T',
    },
    {
      name: 'Damage Card',
      type: 'progression',
      statType: 'damage',
      unlockCost: '69T',
    },
    {
      name: 'Ten Progression',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '99T',
    },
    {
      name: 'Contract of Greed',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '89T',
    },
  ],
  missions: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank D), com tarefas que se iniciam neste mundo."
    }
  ]
};

  