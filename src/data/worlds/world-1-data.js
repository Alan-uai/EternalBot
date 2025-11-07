
export const world1Data = {
  id: 'world-1',
  title: 'Mundo 1 - Ilha dos Monstros',
  summary: 'O mundo inicial, lar do Kid Kohan e onde você começa a sua jornada. Foco em energia e sorte.',
  npcs: [
    { name: 'Kriluni', rank: 'E', exp: 1, hp: '5k', drops: { coins: { amount: 'x50', probability: 1 }, dragon_race_token: { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.1 } } },
    { name: 'Ymicha', rank: 'D', exp: 2, hp: '230k', drops: { coins: { amount: 'x100', probability: 1 }, dragon_race_token: { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.11 } } },
    { name: 'Tian Shan', rank: 'C', exp: 3, hp: '5M', drops: { coins: { amount: 'x150', probability: 1 }, dragon_race_token: { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.125 } } },
    { name: 'Kohan', rank: 'B', exp: 4, hp: '30M', drops: { coins: { amount: 'x200', probability: 1 }, dragon_race_token: { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.15 } } },
    { name: 'Picco', rank: 'A', exp: 5, hp: '100M', drops: { coins: { amount: 'x250', probability: 1 }, dragon_race_token: { amount: 'x1-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.20 } } },
    { name: 'Koku', rank: 'S', exp: 6, hp: '240M', drops: { coins: { amount: 'x300', probability: 1 }, saiyan_token: { amount: 'x3-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.25 } } },
    { name: 'Kid Kohan', rank: 'SS', exp: 15, hp: '2.5Qd', drops: { coins: { amount: 'x700', probability: 1 }, saiyan_token: { amount: 'x3-5', probability: 0.1 }, dragon_race_token: { amount: 'x3-5', probability: 0.1 }, avatar_soul: { amount: 1, probability: 0.5 }, four_star_hat: { probability: 0.25 }, luck_aura: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337506850902126/ScreenRecording_10-21-2025_10-29-41_1.mov?ex=68fa11dc&is=68f8c05c&hm=427738471ba4c03c65ded4771f410444eb190deb54be08eecc33c0ff00286c7f&' },
  ],
  pets: [
    { name: 'Kriluni', rarity: 'Comum', energy_bonus: '3' },
    { name: 'Ymicha', rarity: 'Incomum', energy_bonus: '6' },
    { name: 'Tian Shan', rarity: 'Raro', energy_bonus: '9' },
    { name: 'Kohan', rarity: 'Épico', energy_bonus: '12' },
    { name: 'Picco', rarity: 'Lendário', energy_bonus: '15' },
    { name: 'Koku', rarity: 'Mítico', energy_bonus: '20' },
    { name: 'Kid Kohan', rarity: 'Phantom', energy_bonus: '45' },
  ],
  powers: [
    {
      name: 'Dragon Race',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '100',
      stats: [
        { name: 'Human', multiplier: '2x', rarity: 'Comum' },
        { name: 'Android', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Namekian', multiplier: '4x', rarity: 'Raro' },
        { name: 'Frost Demon', multiplier: '5x', rarity: 'Épico' },
        { name: 'Majin', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Half-Saiyan', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Saiyan', multiplier: '12x', rarity: 'Phantom' },
      ],
    },
    {
      name: 'Saiyan Evolution',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1000',
      stats: [
        { name: 'Great Ape', multiplier: '2x', rarity: 'Comum' },
        { name: 'Super Saiyan Grad 1', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Super Saiyan Grad 2', multiplier: '4x', rarity: 'Raro' },
        { name: 'Super Saiyan Grad 3', multiplier: '5x', rarity: 'Épico' },
        { name: 'Full Power Super Saiyan', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Super Saiyan 2', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Super Saiyan 3', multiplier: '12x', rarity: 'Phantom' },
      ],
    },
     {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Missão de Licença de Herói (Rank F), com tarefas neste mundo."
    }
  ],
  accessories: [
      { id: 'imp-tail', name: 'Imp Tail', world: 'Mundo 1', boss: 'Halloween Raid', rarity: 'Evento', coins_bonus: '0.2', energy_bonus: '0.2x', damage_bonus: '0.2x' }
  ],
  dungeons: [
      { name: 'Halloween Raid', boss: 'Pumpkin King', description: 'Uma raid de evento com temática de Halloween.'}
  ]
};
