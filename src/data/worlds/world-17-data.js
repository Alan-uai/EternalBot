
export const world17Data = {
  id: 'world-17',
  title: 'Mundo 17 - Ilha dos Investigadores',
  summary: 'Mundo sombrio que introduz os poderes de Investigadores e Kagunes, a progressão de Damage Cells, e a Ghoul Raid.',
  content: 'Este mundo introduz dois novos tipos de poderes gacha: Investigadores (energia) e Kagunes (dano). As progressões principais são através dos poderes "Damage Cells" e "Kagune Leveling".',
  tags: ['investigadores', 'kagune', 'mundo 17', '17', 'guia', 'geral', 'damage cells', 'ghoul raid', 'ghoul mask'],
  npcs: [
    { name: 'Ghoul Rank C', rank: 'E', exp: 6e12, hp: '1QnTG' },
    { name: 'Ghoul Rank B', rank: 'D', exp: 9e12, hp: '10QnTG' },
    { name: 'Ghoul Rank A', rank: 'C', exp: 1.3e13, hp: '100QnTG' },
    { name: 'Ghoul Rank S', rank: 'B', exp: 1.9e13, hp: '1ssTG' },
    { name: 'Ghoul Rank SS', rank: 'A', exp: 2.8e13, hp: '10ssTG' },
    { name: 'Kaneki', rank: 'S', exp: 4.2e13, hp: '343UTG' },
    { name: 'Arama', rank: 'SS', exp: 8.4e13, hp: '686UTG', drops: { aura: { name: 'Aura de Ghoul', probability: 0.05 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430338887196213278/ScreenRecording_10-21-2025_10-58-38_1.mov?ex=68fa1325&is=68f8c1a5&hm=9a34e7f09b898166e0819f706849d7fe410364eac27e09760790a9052a9042c3&' },
  ],
  pets: [
    { name: 'Máscara Ghoul', rank: 'Comum', rarity: 'Comum', energy_bonus: '0.17x' },
    { name: 'Kagune Rinkaku', rank: 'Incomum', rarity: 'Incomum', energy_bonus: '0.34x' },
    { name: 'Coruja de Um Olho', rank: 'Raro', rarity: 'Raro', energy_bonus: '0.51x' },
  ],
  powers: [
    {
      name: "Poder do Investigador",
      type: "gacha",
      statType: "energy",
      unlockCost: "Varia (usa Quinque)",
      stats: [
          { name: 'Bureau', multiplier: '2x', rarity: 'Comum' },
          { name: 'Assistants', multiplier: '3x', rarity: 'Incomum' },
          { name: 'Rank 3', multiplier: '4.5x', rarity: 'Raro' },
          { name: 'Rank 2', multiplier: '6x', rarity: 'Épico' },
          { name: 'Rank 1', multiplier: '8x', rarity: 'Lendário' },
          { name: 'First Class', multiplier: '10x', rarity: 'Mítico' },
          { name: 'Associate Special Class', multiplier: '12x', rarity: 'Phantom' },
          { name: 'Special Class', multiplier: '15x', rarity: 'Supremo' },
      ]
    },
    {
        name: "Poder do Kagune",
        type: "gacha",
        statType: "damage",
        unlockCost: "Varia (usa Yen)",
        stats: [
            { name: 'Retto', multiplier: '1x', rarity: 'Comum' },
            { name: 'Hakuro', multiplier: '1.5x', rarity: 'Incomum' },
            { name: 'Shinku', multiplier: '2x', rarity: 'Raro' },
            { name: 'Tetsuba', multiplier: '3x', rarity: 'Épico' },
            { name: 'Shidare', multiplier: '5x', rarity: 'Lendário' },
            { name: 'Hakuja', multiplier: '7x', rarity: 'Mítico' },
            { name: 'Mukade', multiplier: '9x', rarity: 'Phantom' },
            { name: 'Koumyaku', multiplier: '12x', rarity: 'Supremo' },
        ]
    },
    {
        name: "Damage Cells",
        type: "progression",
        statType: "damage",
        maxLevel: 110,
        maxBoost: "1.10x Damage",
        unlockCost: "Varia",
        description: "Poder de progressão que aumenta o dano."
    },
    {
        name: "Kagune Leveling",
        type: "progression",
        statType: "damage",
        maxLevel: 50,
        maxBoost: "Varia com a raridade da Kagune",
        unlockCost: "Flesh Token",
        description: "Sistema de leveling para o Poder do Kagune (dano), usando Flesh Tokens. O nível máximo é 50."
    }
  ],
  accessories: [
    { 
      id: 'ghoul-mask', 
      name: 'Ghoul Mask', 
      world: 'Mundo 17', 
      boss: 'Ghoul Raid', 
      rarity: 'Variável',
      description: `Um acessório que dropa da Ghoul Raid. Os bônus variam com a raridade:\nComum: 1x\nIncomum: 1.2x\nÉpico: 1.6x\nRaro: 1.4x\nLendário: 1.8x\nMítico: 2.0x\nPhantom: 2.4x\nSupremo: 3.0x`
    }
  ],
  dungeons: [
    { 
      name: 'Ghoul Raid', 
      boss: 'Desconhecido', 
      description: 'Uma raid no Mundo 17 onde se pode obter o acessório Ghoul Mask e Flesh Tokens.'
    }
  ]
};
