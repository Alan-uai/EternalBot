
export const world13Data = {
  id: 'world-13',
  title: 'Mundo 13 - Ilha dos Pecados',
  summary: 'Mundo de Nanatsu no Taizai, com os chefes Esanor e Number 8.',
  npcs: [
    { name: 'Cavaleiro Sagrado', rank: 'E', exp: 9e9, hp: '1SPG' },
    { name: 'Demônio Vermelho', rank: 'D', exp: 1.3e10, hp: '10SPG' },
    { name: 'Demônio Cinza', rank: 'C', exp: 1.9e10, hp: '100SPG' },
    { name: 'Albion', rank: 'B', exp: 2.8e10, hp: '1OVG' },
    { name: 'Mandamento', rank: 'A', exp: 4e10, hp: '10OVG' },
    { name: 'Meliodas', rank: 'S', exp: 6e10, hp: '4.88DVg' },
    { name: 'Esanor', rank: 'SS', exp: 1.2e11, hp: '9.77DVg', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338725602394213/ScreenRecording_10-21-2025_10-55-51_1.mov?ex=68fa12fe&is=68f8c17e&hm=375f983f81a944d7cbfa3a5cd0a434035e8b6ef58fc3a730dd4f73e9947242f8&', drops: { aura: { name: 'Monster Aura', probability: 0.05 } } },
    { name: 'Number 8', rank: 'SS', exp: 1.5e11, hp: '5.55qtV', drops: {} },
  ],
  powers: [
    {
      name: 'Poder dos Pecados',
      type: 'gacha',
      statType: 'damage',
      unlockCost: '100M',
      stats: [
        { name: 'Revenge Counter', multiplier: '3.5x', rarity: 'Raro', probability: 6 },
        { name: 'The One', multiplier: '6x', rarity: 'Phantom', probability: 0.08 },
      ],
    },
    {
      name: 'Kaiju energy',
      type: 'progression',
      statType: 'energy',
      unlockCost: '100qd',
    },
    {
      name: 'Fortitude Level',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '200qd',
    },
    {
      name: 'Kaiju Powers',
      type: 'progression',
      statType: 'mixed',
      unlockCost: '650qd',
    },
  ],
};

  