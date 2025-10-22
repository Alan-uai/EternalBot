
export const world7Data = {
  id: 'world-7',
  title: 'Mundo 7 - Ilha dos Viajantes',
  summary: 'Focado em energia e moedas, este mundo tem o chefe Novi Chroni.',
  npcs: [
    { name: 'Viajante do Tempo', rank: 'E', exp: 550000, hp: '1QnD' },
    { name: 'Guardião do Tempo', rank: 'D', exp: 800000, hp: '10QnD' },
    { name: 'Paradoxo Temporal', rank: 'C', exp: 1200000, hp: '100QnD' },
    { name: 'Mestre do Tempo', rank: 'B', exp: 1800000, hp: '1sxD' },
    { name: 'Senhor do Tempo', rank: 'A', exp: 2500000, hp: '10sxD' },
    { name: 'Chronomancer', rank: 'S', exp: 3500000, hp: '50.5tD' },
    { name: 'Novi Chroni', rank: 'SS', exp: 7000000, hp: '101tdD', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338227725664287/ScreenRecording_10-21-2025_10-35-22_1.mov?ex=68fa1287&is=68f8c107&hm=6ce1e4abfb80c01df86b05dc364cc1e0f45515182d53142c7d75fe9ffad47f3b&', drops: {} },
  ],
  pets: [
    { name: 'Ampulheta', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.07x' },
    { name: 'Relógio de Bolso', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.14x' },
    { name: 'Paradoxo Encapsulado', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.21x' },
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
  ],
};
