
export const world17Data = {
  id: 'world-17',
  title: 'Mundo 17 - Ilha Ghoul',
  summary: 'Mundo sombrio que introduz os Ghouls, lutadores com bônus de energia e dano, e o sistema de Kagunes.',
  content: 'Este mundo introduz os Ghouls, um tipo especial de lutador que pode ser equipado. Eles fornecem bônus de energia e dano, e suas Kagunes (as "armas" dos ghouls) podem ter diferentes raridades, cada uma com status variados. Não há um "nível máximo" para a Kagune em si; o poder vem da raridade do Ghoul que você equipa.',
  tags: ['ghoul', 'kagune', 'mundo 17', '17', 'guia', 'geral'],
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
  tables: {
    ghouls: {
        headers: ['Nome', 'Raridade', 'Bônus de Energia', 'Bônus de Dano'],
        rows: [
            { 'Nome': 'Ghoul Comum', 'Raridade': 'Comum', 'Bônus de Energia': '5%', 'Bônus de Dano': '1%' },
            { 'Nome': 'Ghoul Incomum', 'Raridade': 'Incomum', 'Bônus de Energia': '7.5%', 'Bônus de Dano': '1.5%' },
            { 'Nome': 'Ghoul Raro', 'Raridade': 'Raro', 'Bônus de Energia': '10%', 'Bônus de Dano': '2%' },
            { 'Nome': 'Ghoul Épico', 'Raridade': 'Épico', 'Bônus de Energia': '12.5%', 'Bônus de Dano': '2.5%' },
            { 'Nome': 'Ghoul Lendário', 'Raridade': 'Lendário', 'Bônus de Energia': '15%', 'Bônus de Dano': '3%' },
            { 'Nome': 'Ghoul Mítico', 'Raridade': 'Mítico', 'Bônus de Energia': '20%', 'Bônus de Dano': '5%' },
            { 'Nome': 'Ghoul Phantom', 'Raridade': 'Phantom', 'Bônus de Energia': '25%', 'Bônus de Dano': '7.5%' },
            { 'Nome': 'Ghoul Supremo', 'Raridade': 'Supremo', 'Bônus de Energia': '30%', 'Bônus de Dano': '10%' },
        ]
    }
  }
};
