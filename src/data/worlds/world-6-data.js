
export const world6Data = {
  id: 'world-6',
  title: 'Mundo 6 - Ilha da Estátua',
  summary: 'Introduz o sistema de Shadows, que são lutadores especiais dropados por chefes.',
  npcs: [
    { name: 'Cavaleiro de Pedra', rank: 'E', exp: 120000, hp: '1DD' },
    { name: 'Gárgula', rank: 'D', exp: 180000, hp: '10DD' },
    { name: 'Golem', rank: 'C', exp: 250000, hp: '100DD' },
    { name: 'Guardião de Pedra', rank: 'B', exp: 350000, hp: '1tD' },
    { name: 'Colosso de Pedra', rank: 'A', exp: 500000, hp: '10tD' },
    { name: 'General de Pedra', rank: 'S', exp: 750000, hp: '97.5Ud' },
    { name: 'Statue of God', rank: 'SS', exp: 1500000, hp: '195Ud', drops: { aura: { name: 'Aura da Estátua', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337947248361472/ScreenRecording_10-21-2025_10-32-26_1.mov?ex=68fa1245&is=68f8c0c5&hm=451a0c7979d34bf34b974d59f558aed19077082b2d29cf14342f0f5079111b12&' },
  ],
  pets: [
    { name: 'Pedrinha', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.06x' },
    { name: 'Golem Pequeno', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.12x' },
    { name: 'Estátua Viva', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.18x' },
  ],
  powers: [
    {
      name: 'Earth Power',
      type: 'progression',
      statType: 'mixed',
      maxLevel: 25,
      unlockCost: '500k',
      boosts: [
          { type: 'damage', value: '15% Damage' },
          { type: 'energy', value: '10% Energy' }
      ]
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank E), com tarefas que se estendem pelos mundos 6 a 9."
    }
  ],
};

    