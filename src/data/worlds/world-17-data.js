
export const world17Data = {
  id: 'world-17',
  title: 'Mundo 17 - Ilha Ghoul',
  summary: 'Mundo sombrio que introduz os Ghouls, lutadores com bônus de energia e dano, e o sistema de Kagunes, que possui raridades e níveis próprios.',
  content: 'Este mundo introduz os Ghouls, um tipo especial de lutador que pode ser equipado. O poder principal aqui é a Kagune, que possui seu próprio sistema de raridade (que define o multiplicador de dano base) e um sistema de leveling (que aumenta o dano final).',
  tags: ['ghoul', 'kagune', 'mundo 17', '17', 'guia', 'geral', 'leveling'],
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
      { name: 'Ghoul Comum', rarity: 'Comum', energy_bonus: '5%', damage_bonus: '1%' },
      { name: 'Ghoul Incomum', rarity: 'Incomum', energy_bonus: '7.5%', damage_bonus: '1.5%' },
      { name: 'Ghoul Raro', rarity: 'Raro', energy_bonus: '10%', damage_bonus: '2%' },
      { name: 'Ghoul Épico', rarity: 'Épico', energy_bonus: '12.5%', damage_bonus: '2.5%' },
      { name: 'Ghoul Lendário', rarity: 'Lendário', energy_bonus: '15%', damage_bonus: '3%' },
      { name: 'Ghoul Mítico', rarity: 'Mítico', energy_bonus: '20%', damage_bonus: '5%' },
      { name: 'Ghoul Phantom', rarity: 'Phantom', energy_bonus: '25%', damage_bonus: '7.5%' },
      { name: 'Ghoul Supremo', rarity: 'Supremo', energy_bonus: '30%', damage_bonus: '10%' },
  ],
  powers: [
      {
          name: "Kagune Leveling",
          type: "progression",
          statType: "damage",
          maxLevel: 50,
          maxBoost: "+50% Damage (total)",
          unlockCost: "Varia (usa Flesh Token)",
          description: "Sistema de leveling para o poder Kagune, que aumenta seu dano base. O custo é em Flesh Tokens."
      }
  ],
  tables: {
      kaguneRarities: {
          headers: ['Kagune', 'Raridade', 'Multiplicador de Dano'],
          rows: [
              { 'Kagune': 'Retto', 'Raridade': 'Comum', 'Multiplicador de Dano': '1x' },
              { 'Kagune': 'Hakuro', 'Raridade': 'Incomum', 'Multiplicador de Dano': '1.5x' },
              { 'Kagune': 'Shinku', 'Raridade': 'Raro', 'Multiplicador de Dano': '2x' },
              { 'Kagune': 'Tetsuba', 'Raridade': 'Épico', 'Multiplicador de Dano': '3x' },
              { 'Kagune': 'Shidare', 'Raridade': 'Lendário', 'Multiplicador de Dano': '5x' },
              { 'Kagune': 'Hakuja', 'Raridade': 'Mítico', 'Multiplicador de Dano': '7x' },
              { 'Kagune': 'Mukade', 'Raridade': 'Phantom', 'Multiplicador de Dano': '9x' },
              { 'Kagune': 'Koumyaku', 'Raridade': 'Supremo', 'Multiplicador de Dano': '12x' },
          ]
      }
  }
};
