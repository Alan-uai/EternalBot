
export const world1Data = {
  id: 'world-1',
  title: 'Mundo 1 - Ilha dos Monstros',
  summary: 'O mundo inicial, lar do Kid Kohan e onde você começa a sua jornada. Foco em energia e sorte.',
  npcs: [
    { name: 'Bandido', rank: 'E', exp: 20, hp: '1k' },
    { name: 'Marinheiro', rank: 'D', exp: 35, hp: '1.25k' },
    { name: 'Touro', rank: 'C', exp: 50, hp: '1.5k' },
    { name: 'Krilin', rank: 'B', exp: 75, hp: '2k' },
    { name: 'Tartaruga', rank: 'A', exp: 100, hp: '2.5k' },
    { name: 'Mestre Kame', rank: 'S', exp: 150, hp: '3.5k' },
    { name: 'Kid Kohan', rank: 'SS', exp: 300, hp: '2.5Qd', drops: { aura: { name: 'Aura da Sorte', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337506850902126/ScreenRecording_10-21-2025_10-29-41_1.mov?ex=68fa11dc&is=68f8c05c&hm=427738471ba4c03c65ded4771f410444eb190deb54be08eecc33c0ff00286c7f&' },
  ],
  pets: [
    { name: 'Monstrinho', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.01x' },
    { name: 'Monstro Maior', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.02x' },
    { name: 'Monstro Chefe', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.03x' },
  ],
  powers: [
    {
      name: 'Poder do Monstro',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '100',
      stats: [
        { name: 'Poder Adormecido', multiplier: '1.1x', rarity: 'Comum', probability: 50 },
        { name: 'Poder Desperto', multiplier: '1.5x', rarity: 'Raro', probability: 10 },
        { name: 'Fúria do Monstro', multiplier: '2x', rarity: 'Phantom', probability: 0.5, energy_crit_bonus: '0.50%' },
      ],
    },
    {
      name: 'Sorte do Iniciante',
      type: 'progression',
      statType: 'luck',
      maxLevel: 10,
      maxBoost: '10% Star Luck',
      unlockCost: '500',
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

    