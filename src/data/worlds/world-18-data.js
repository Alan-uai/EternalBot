
export const world18Data = {
  id: 'world-18',
  title: 'Mundo 18 - Ilha da Motosserra',
  summary: 'Mundo caótico com demônios e a Chainsaw Defense.',
  npcs: [
    { name: 'Zombie Devil', rank: 'E', exp: 3e13, hp: '1SpTG' },
    { name: 'Bat Devil', rank: 'D', exp: 4.5e13, hp: '10SpTG' },
    { name: 'Leech Devil', rank: 'C', exp: 6.5e13, hp: '100SpTG' },
    { name: 'Eternity Devil', rank: 'B', exp: 9.5e13, hp: '1OcTG' },
    { name: 'Katana Man', rank: 'A', exp: 1.4e14, hp: '10OcTG' },
    { name: 'Bomb Devil', rank: 'S', exp: 2e14, hp: '750TGN' },
    { name: 'Mr. Chainsaw', rank: 'SS', exp: 4e14, hp: '1.5qTG', drops: {} },
  ],
  pets: [
    { name: 'Pochita', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.18x' },
    { name: 'Gato', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.36x' },
    { name: 'Anjo', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.54x' },
  ],
  shadows: [
    {
      id: 'chainsaw-shadow',
      name: 'Chainsaw Shadow',
      type: 'Damage',
      stats: [
        { rank: 'Rank SS', rarity: 'Phantom', bonus: '15% Damage', cooldown: '1s' },
      ],
    },
  ],
  powers: [
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank B), com tarefas neste mundo."
    }
  ],
  dungeons: [
      { name: 'Chainsaw Defense', boss: 'Gun Devil', description: 'Uma raid de defesa contra hordas de demônios.'}
  ]
};
