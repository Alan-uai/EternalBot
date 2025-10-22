
export const world11Data = {
  id: 'world-11',
  title: 'Mundo 11 - Ilha dos Titãs',
  summary: 'Introduz os Titãs, um novo tipo de lutador focado em causar dano.',
  npcs: [
    { name: 'Titã Anormal', rank: 'E', exp: 350000000, hp: '1TVg' },
    { name: 'Titã Blindado', rank: 'D', exp: 500000000, hp: '10TVg' },
    { name: 'Titã Colossal', rank: 'C', exp: 750000000, hp: '100TVg' },
    { name: 'Titã Bestial', rank: 'B', exp: 1100000000, hp: '1qtV' },
    { name: 'Titã de Ataque', rank: 'A', exp: 1600000000, hp: '10qtV' },
    { name: 'Eran', rank: 'S', exp: 2300000000, hp: '24.7Vgn' },
    { name: 'Killas Godspeed', rank: 'SS', exp: 4500000000, hp: '49.4Vgn', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338644438421535/ScreenRecording_10-21-2025_10-54-38_1.mov?ex=68fa12eb&is=68f8c16b&hm=4434db7c13223af1fa8e998b48f6c3a0c7fca219d7f4a831e47359e13ba74da4&', drops: {} },
  ],
  pets: [
    { name: 'Soldado de Paradis', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.11x' },
    { name: 'Soldado de Marley', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.22x' },
    { name: 'Fundador Ymir', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.33x' },
  ],
  powers: [
    {
      name: 'Poder dos Titãs',
      type: 'progression',
      statType: 'damage',
      maxLevel: 30,
      maxBoost: '30% Damage',
      unlockCost: '25M',
    },
  ],
};
