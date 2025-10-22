
export const world2Data = {
  id: 'world-2',
  title: 'Mundo 2 - Ilha do Moinho',
  summary: 'Mundo temático de piratas, focado em moedas e dano. Introduz o chefe Shanks.',
  npcs: [
    { name: 'Marinheiro Pirata', rank: 'E', exp: 150, hp: '100M' },
    { name: 'Espadachim Pirata', rank: 'D', exp: 250, hp: '500M' },
    { name: 'Canhoneiro Pirata', rank: 'C', exp: 400, hp: '1B' },
    { name: 'Imediato Pirata', rank: 'B', exp: 600, hp: '10B' },
    { name: 'Capitão Pirata', rank: 'A', exp: 850, hp: '50B' },
    { name: 'Luffy', rank: 'S', exp: 1200, hp: '2.5sx' },
    { name: 'Shanks', rank: 'SS', exp: 2500, hp: '5sx', drops: { aura: { name: 'Aura do Imperador Vermelho', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337623989157898/ScreenRecording_10-21-2025_10-30-18_1.mov?ex=68fa11f7&is=68f8c077&hm=545bf96550f91648d3cb19976024f9177520781ec5a21df3210a4c85af955e54&' },
  ],
  pets: [
    { name: 'Papagaio', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.02x' },
    { name: 'Macaco', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.04x' },
    { name: 'Rei dos Mares Bebê', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.06x' },
  ],
  powers: [
    {
      name: 'Poder do Pirata',
      type: 'gacha',
      statType: 'coin',
      unlockCost: '1k',
      stats: [
        { name: 'Tesouro Pequeno', multiplier: '1.2x', rarity: 'Comum', probability: 45 },
        { name: 'Tesouro Grande', multiplier: '1.8x', rarity: 'Raro', probability: 15 },
        { name: 'Conquistador', multiplier: '2.5x', rarity: 'Phantom', probability: 0.4 },
      ],
    },
    {
      name: 'Força do Espadachim',
      type: 'progression',
      statType: 'damage',
      maxLevel: 15,
      maxBoost: '15% Damage',
      unlockCost: '5k',
    },
  ],
  accessories: [
    { id: 'bandana-pirata', name: 'Bandana Pirata', world: 'Mundo 2', boss: 'Capitão Pirata', rarity: 'Incomum', coins_bonus: '0.05' }
  ],
  dungeons: [
    { name: 'Caverna do Tesouro', boss: 'Rei dos Mares', description: 'Uma caverna cheia de tesouros guardada por um monstro marinho.'}
  ]
};
