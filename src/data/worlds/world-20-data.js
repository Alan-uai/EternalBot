
export const world20Data = {
  id: 'world-20',
  title: 'Mundo 20 - Planeta Namekusei',
  summary: 'O mundo final antes do lobby 2, com as raids Green Planet e Suffering e chefes poderosos.',
  npcs: [
    { name: 'Soldado de Freeza', rank: 'E', exp: 8e15, hp: '1dQDR' },
    { name: 'Forças Especiais Ginyu', rank: 'D', exp: 1.2e16, hp: '10dQDR' },
    { name: 'Freeza (Forma 1)', rank: 'C', exp: 1.8e16, hp: '100dQDR' },
    { name: 'Freeza (Forma Final)', rank: 'B', exp: 2.6e16, hp: '1tQDR' },
    { name: 'Koku (Super Saiyajin)', rank: 'A', exp: 3.8e16, hp: '10tQDR' },
    { name: 'Koku SSJ', rank: 'SS', exp: 5.5e16, hp: '1.52NoTG', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339247122026546/ScreenRecording_10-21-2025_11-06-40_1.mov?ex=68fa137a&is=68f8c1fa&hm=42096a1a9cd93e3a83be6bd157f5a923a7fd467293a736127462c26f217102fa&' },
    { name: 'Frezi Final Form', rank: 'SSS', exp: 1.1e17, hp: '15.2QdDR', videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430339308862312568/ScreenRecording_10-21-2025_11-07-45_1.mov?ex=68fa1389&is=68f8c209&hm=31f0464acc8164d46a89020eb87f1756e22e10994049b4f7a4720feed25b1387&', drops: {} },
  ],
  pets: [
    { name: 'Porunga Mini', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.60x' },
    { name: 'Super Shenlong Mini', rank: 'Épico', rarity: 'Épico', energy_bonus: '0.80x' },
  ],
  dungeons: [
    { name: 'Green Planet Raid', boss: 'Broly', description: 'Uma raid em um planeta verde instável.'},
    { name: 'Suffering Raid', boss: 'Jiren', description: 'Uma raid de resistência extrema.'}
  ],
  accessories: [
    { 
      id: 'scarffy', 
      name: 'Scarffy', 
      slot: 'Neck',
      world: '20', 
      boss: 'Forças Especiais Ginyu', 
      rank: 'D-Rank', 
      bonuses: [
        { 
          type: 'damage', 
          valuesByRarity: [
            { "rarity": "Common", "value": "0.133x" },
            { "rarity": "Uncommon", "value": "0.2x" },
            { "rarity": "Rare", "value": "0.266x" },
            { "rarity": "Epic", "value": "0.333x" },
            { "rarity": "Legendary", "value": "0.4x" },
            { "rarity": "Mythic", "value": "0.466x" },
            { "rarity": "Phantom", "value": "0.665x" },
            { "rarity": "Supreme", "value": "1x" }
          ]
        },
        { 
          type: 'coin', 
          valuesByRarity: [
            { "rarity": "Common", "value": "0.6x" },
            { "rarity": "Uncommon", "value": "0.9x" },
            { "rarity": "Rare", "value": "1.2x" },
            { "rarity": "Epic", "value": "1.5x" },
            { "rarity": "Legendary", "value": "1.8x" },
            { "rarity": "Mythic", "value": "2.1x" },
            { "rarity": "Phantom", "value": "3x" },
            { "rarity": "Supreme", "value": "4.5x" }
          ]
        },
        { 
          type: 'exp', 
          valuesByRarity: [
            { "rarity": "Common", "value": "2%" },
            { "rarity": "Uncommon", "value": "3%" },
            { "rarity": "Rare", "value": "4%" },
            { "rarity": "Epic", "value": "5%" },
            { "rarity": "Legendary", "value": "6%" },
            { "rarity": "Mythic", "value": "7%" },
            { "rarity": "Phantom", "value": "10%" },
            { "rarity": "Supreme", "value": "15%" }
          ]
        }
      ]
    }
  ],
};

    