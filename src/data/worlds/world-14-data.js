
export const world14Data = {
  id: 'world-14',
  title: 'Mundo 14 - Ilha da Magia',
  summary: 'Mundo de Clover, focado em sorte e energia.',
  npcs: [
    { name: 'Plebeu Mágico', rank: 'E', exp: 4.5e10, hp: '1NVG' },
    { name: 'Nobre Mágico', rank: 'D', exp: 6.5e10, hp: '10NVG' },
    { name: 'Cavaleiro Mágico', rank: 'C', exp: 9.5e10, hp: '100NVG' },
    { name: 'Vice-Capitão', rank: 'B', exp: 1.4e11, hp: '1TGN' },
    { name: 'Capitão', rank: 'A', exp: 2e11, hp: '10TGN' },
    { name: 'Rei Mago', rank: 'S', exp: 3e11, hp: '2.39SeV' },
    { name: 'Valzora', rank: 'SS', exp: 6e11, hp: '4.79SeV', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338750591930449/ScreenRecording_10-21-2025_10-57-05_1.mov?ex=68fa1304&is=68f8c184&hm=24d9660f7aebb87aaa473d6dbe06e9b920ca22c0080fffe07b81913cf3b3fdbe&', drops: {} },
  ],
  pets: [
    { name: 'Grimório', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.14x' },
    { name: 'Pássaro Anti-Magia', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.28x' },
    { name: 'Diabinho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.42x' },
  ],
  powers: [
    {
      name: 'Poder Mágico',
      type: 'progression',
      statType: 'luck',
      maxLevel: 40,
      maxBoost: '40% Star Luck',
      unlockCost: '250M',
    },
  ],
  accessories: [
    { 
      id: 'greenello-scarf', 
      name: 'Greenello Scarf', 
      slot: 'Neck',
      world: '14', 
      boss: 'Rei Mago', 
      rarity: 'S-Rank', 
      bonuses: [
        { type: 'coin', values: ['0.5x', '0.75x', '1.x', '1.25x', '1.5x', '1.75x', '2.5x', '3.75x'] },
        { type: 'exp', values: ['1%', '1.5%', '2%', '2.5%', '3%', '3.5%', '5%', '7.5%'] }
      ]
    },
    { 
      id: 'slime-mask', 
      name: 'Slime Mask', 
      slot: 'Head',
      world: '14', 
      boss: 'Rei Mago', 
      rarity: 'S-Rank', 
      bonuses: [
          { type: 'energy', values: ['1x'] },
          { type: 'damage', values: ['1x'] },
          { type: 'coin', values: ['1x'] },
          { type: 'exp', values: ['1x'] }
      ]
    }
  ],
};
