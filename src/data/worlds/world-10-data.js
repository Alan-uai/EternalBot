
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
    { name: 'Killas Godspeed', rank: 'SS', exp: 900000000, hp: '296OcD', drops: { aura: { name: 'Aura Energética', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338613043925173/ScreenRecording_10-21-2025_10-53-16_1.mov?ex=68fa12e3&is=68f8c163&hm=5b03c81a24b49bedaf3ea6c5c7ae05912c1afea9e3e670f56c7d384ab0616484&' },
  ],
  pets: [
    { name: 'Drone', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.10x' },
    { name: 'Robô de Batalha', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.20x' },
    { name: 'Mecha', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.30x' },
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
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank D), com tarefas que se iniciam neste mundo."
    }
  ],
};

    