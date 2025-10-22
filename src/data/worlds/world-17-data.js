
export const world17Data = {
  id: 'world-17',
  title: 'Mundo 17 - Ilha Ghoul',
  summary: 'Mundo sombrio que introduz os Ghouls, lutadores com bônus de energia e dano.',
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
  ghouls: [
      { id: 'ghoul-comum', name: 'Ghoul Comum', rarity: 'Comum', energy_bonus: '5%', damage_bonus: '1%' },
      { id: 'ghoul-raro', name: 'Ghoul Raro', rarity: 'Raro', energy_bonus: '10%', damage_bonus: '2%' },
      { id: 'ghoul-lendario', name: 'Ghoul Lendário', rarity: 'Lendário', energy_bonus: '20%', damage_bonus: '5%' },
  ]
};
