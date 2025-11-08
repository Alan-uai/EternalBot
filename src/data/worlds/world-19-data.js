
export const world19Data = {
  id: 'world-19',
  title: 'Mundo 19 - Ilha do Inferno',
  summary: 'Um mundo infernal com múltiplos chefes e a espada de energia Excalibur.',
  npcs: [
    { name: 'Diabo de Fogo', rank: 'E', exp: 1.5e14, hp: '1NoTG' },
    { name: 'Diabo de Gelo', rank: 'D', exp: 2.2e14, hp: '10NoTG' },
    { name: 'Diabo das Sombras', rank: 'C', exp: 3.2e14, hp: '100NoTG' },
    { name: 'Diabo da Morte', rank: 'B', exp: 4.8e14, hp: '1QDR' },
    { name: 'Lúcifer', rank: 'A', exp: 7e14, hp: '10QDR' },
    { name: 'Satan', rank: 'S', exp: 1e15, hp: '60.5UTG' },
    { name: 'Leonardo', rank: 'SS', exp: 2e15, hp: '1.76QnTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339126934241340/ScreenRecording_10-21-2025_11-02-02_1.mov?ex=68fa135e&is=68f8c1de&hm=1afe3e75d2e8f95359ea7bde3ae5a1303cb0743cb4a21e6b43ee65b50fdcd00&', drops: {} },
    { name: 'Bansho', rank: 'SSS', exp: 1e16, hp: '17.6ssTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339182936457297/ScreenRecording_10-21-2025_11-05-48_1.mov?ex=68fa136b&is=68f8c1eb&hm=8d3acdfc32be2c008eb6c46e92068bafa52b13850e5f798fe6307535da102052&', drops: {} },
  ],
  pets: [
    { name: 'Cérbero', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.38x' },
    { name: 'Diabrete', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.57x' },
  ],
  powers: [
    {
      name: 'Poder Infernal',
      type: 'progression',
      statType: 'damage',
      maxLevel: 50,
      maxBoost: '50% Damage',
      unlockCost: '2B',
    },
  ],
  accessories: [
    { 
      id: 'fire-force-pants', 
      name: 'Fire Force Pants', 
      slot: 'Pant',
      world: '19', 
      boss: 'Diabo das Sombras', 
      rarity: 'C', 
      bonuses: [
        { type: 'coin', values: ['0.133', '0.2x', '0.266x', '0.333x', '0.4x', '0.466x', '0.665x', '1x'] }
      ]
    },
    { 
      id: 'fire-force-cape', 
      name: 'Fire Force Cape', 
      slot: 'Back',
      world: '19', 
      boss: 'Satan', 
      rarity: 'S', 
      bonuses: [
        { type: 'energy', values: ['1.2x'] },
        { type: 'damage', values: ['1.2x'] },
        { type: 'exp', values: ['1.2x'] }
      ] 
    },
    { 
      id: 'fire-witch-hat', 
      name: 'Fire Witch Hat', 
      slot: 'Head',
      world: '19', 
      boss: 'Satan', 
      rarity: 'S', 
      bonuses: [
        { type: 'damage', values: ['1.5x'] },
        { type: 'coin', values: ['1.5x'] }
      ]
    },
    { 
      id: 'fire-eye-patch', 
      name: 'Fire Eye Patch', 
      slot: 'Face',
      world: '19', 
      boss: 'Leonardo', 
      rarity: 'SS', 
      bonuses: [
        { type: 'energy', values: ['1.2x'] },
        { type: 'damage', values: ['1.2x'] },
        { type: 'coin', values: ['1.2x'] },
        { type: 'exp', values: ['1.2x'] }
      ]
    }
  ],
};
