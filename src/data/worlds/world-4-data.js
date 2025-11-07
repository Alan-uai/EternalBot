
export const world4Data = {
  id: 'world-4',
  title: 'Mundo 4 - Ilha dos Demônios de Fogo',
  summary: 'Um mundo infernal focado em dano e drops, com o chefe Sakuni.',
  npcs: [
    { name: 'Diabinho', rank: 'E', exp: 5000, hp: '100qd' },
    { name: 'Cão Infernal', rank: 'D', exp: 7000, hp: '1Qn' },
    { name: 'Demônio de Fogo', rank: 'C', exp: 10000, hp: '25Qn' },
    { name: 'Demônio Maior', rank: 'B', exp: 15000, hp: '250Qn' },
    { name: 'Lorde Demônio', rank: 'A', exp: 22000, hp: '500Qn' },
    { name: 'Akaza', rank: 'S', exp: 30000, hp: '60O' },
    { name: 'Sakuni', rank: 'SS', exp: 60000, hp: '120Sp', drops: { aura: { name: 'Aura do Rei do Fogo', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337777840554126/ScreenRecording_10-21-2025_10-31-17_1.mov?ex=68fa121c&is=68f8c09c&hm=4701c56efe6c8b63f39d235ca2353f417c474b290038f6c2874b44537ce6ead1&' },
  ],
  pets: [
    { name: 'Salamandra', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.04x' },
    { name: 'Cerberus Jr.', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.08x' },
    { name: 'Lord Diabinho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.12x' },
  ],
  powers: [
    {
      name: 'Curses',
      type: 'gacha',
      statType: 'energy',
      unlockCost: 'Varia',
      description: "Poder de energia obtido na Cursed Raid.",
      stats: [
        { name: 'Blazing Cataclysm', multiplier: '2x', rarity: 'Comum' },
        { name: 'Nullborn Phantom', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Infernal Crater', multiplier: '4x', rarity: 'Raro' },
        { name: 'Abyssal Tide', multiplier: '5x', rarity: 'Épico' },
        { name: 'Verdant Calamity', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Soulbender', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Wandered Mind', multiplier: '12x', rarity: 'Phantom' }
      ]
    },
    {
      name: 'Cursed Power',
      type: 'gacha',
      statType: 'mixed',
      unlockCost: 'Varia',
      description: "Poder de dano e crítico de energia obtido na Cursed Raid.",
      stats: [
        { name: 'Common Curse', statType: 'damage', multiplier: '0.6x', rarity: 'Comum' },
        { name: 'Uncommon Curse', statType: 'damage', multiplier: '0.8x', rarity: 'Incomum' },
        { name: 'Rare Curse', statType: 'damage', multiplier: '1x', rarity: 'Raro', energy_crit_bonus: '1.00%' },
        { name: 'Epic Curse', statType: 'damage', multiplier: '2x', rarity: 'Épico', energy_crit_bonus: '2.00%' },
        { name: 'Legendary Curse', statType: 'damage', multiplier: '3x', rarity: 'Lendário', energy_crit_bonus: '3.00%' },
        { name: 'Mythical Curse', statType: 'damage', multiplier: '4x', rarity: 'Mítico', energy_crit_bonus: '4.00%' },
        { name: 'Phantom Curse', statType: 'damage', multiplier: '5x', rarity: 'Phantom', energy_crit_bonus: '5.00%' }
      ]
    },
    {
      name: 'Cursed Progression',
      type: 'progression',
      statType: 'damage',
      maxLevel: 410,
      maxBoost: '4.10x Damage',
      unlockCost: 'Varia',
    }
  ],
  accessories: [
      { id: 'chifres-demonio', name: 'Chifres de Demônio', world: 'Mundo 4', boss: 'Lorde Demônio', rarity: 'Épico', damage_bonus: '0.05x' }
  ],
  dungeons: [
      { name: 'Cursed Raid', boss: 'Desconhecido', description: 'Uma raid onde se obtém os poderes Curses e Cursed Power.'}
  ]
};
