
export const world1Data = {
  id: 'world-1',
  title: 'Mundo 1 - Cidade da Terra',
  summary: 'O mundo inicial e hub central do jogo. Lar do Kid Kohan, do Lobby de Dungeons, do local de Prestígio e das missões iniciais.',
  content: 'O Mundo 1 é a área principal onde você encontrará a maioria dos sistemas de progressão do jogo. É aqui que se localiza o Lobby de Dungeons, o local de Prestígio, a loja de comidas (egg, chocolate, milk, donuts, hot sausage), os baús de recompensa (diário, comum, comunidade, vip, premium) e os placares de líderes (leaderboards).',
  npcs: [
    { name: 'Kriluni', rank: 'E', exp: 1, hp: '5k', drops: { coins: { amount: 'x50', probability: 1 }, 'Dragon Race Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x1', probability: 1 }, avatar_soul: { amount: 1, probability: 0.1 }, avatar: { probability: 0.01 } } },
    { name: 'Ymicha', rank: 'D', exp: 2, hp: '230k', drops: { coins: { amount: 'x100', probability: 1 }, 'Dragon Race Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x2', probability: 1 }, avatar_soul: { amount: 1, probability: 0.11 }, avatar: { probability: 0.01 } } },
    { name: 'Tian Shan', rank: 'C', exp: 3, hp: '5M', drops: { coins: { amount: 'x150', probability: 1 }, 'Dragon Race Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x3', probability: 1 }, avatar_soul: { amount: 1, probability: 0.125 }, avatar: { probability: 0.01 } } },
    { name: 'Kohan', rank: 'B', exp: 4, hp: '30M', drops: { coins: { amount: 'x200', probability: 1 }, 'Dragon Race Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x4', probability: 1 }, avatar_soul: { amount: 1, probability: 0.15 }, avatar: { probability: 0.01 } } },
    { name: 'Picco', rank: 'A', exp: 5, hp: '100M', drops: { coins: { amount: 'x250', probability: 1 }, 'Dragon Race Token': { amount: 'x1-5', probability: 0.1 }, exp: { amount: 'x5', probability: 1 }, avatar_soul: { amount: 1, probability: 0.2 }, avatar: { probability: 0.01 } } },
    { name: 'Koku', rank: 'S', exp: 6, hp: '240M', drops: { coins: { amount: 'x300', probability: 1 }, 'Saiyan Evolution Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x6', probability: 1 }, avatar_soul: { amount: 1, probability: 0.25 }, avatar: { probability: 0.01 } } },
    { name: 'Kid Kohan', rank: 'SS', exp: 15, hp: '2.5Qd', drops: { coins: { amount: 'x700', probability: 1 }, 'Saiyan Evolution Token': { amount: 'x3-5', probability: 0.1 }, 'Dragon Race Token': { amount: 'x3-5', probability: 0.1 }, exp: { amount: 'x15', probability: 1 }, 'four_star_hat': { probability: 0.25 }, luck_aura: { probability: 0.01 }, avatar_soul: { amount: 1, probability: 0.5 }, avatar: { probability: 0.01 } }, videoUrl: 'https://cdn.discordapp.com/attachments/1430337273794265250/1430337506850902126/ScreenRecording_10-21-2025_10-29-41_1.mov?ex=68fa11dc&is=68f8c05c&hm=427738471ba4c03c65ded4771f410444eb190deb54be08eecc33c0ff00286c7f&' },
  ],
  pets: [
    { name: 'Kriluni', rarity: 'Comum', energy_bonus: '3' },
    { name: 'Ymicha', rarity: 'Incomum', energy_bonus: '6' },
    { name: 'Tian Shan', rarity: 'Raro', energy_bonus: '9' },
    { name: 'Kohan', rarity: 'Épico', energy_bonus: '12' },
    { name: 'Picco', rarity: 'Lendário', energy_bonus: '15' },
    { name: 'Koku', rarity: 'Mítico', energy_bonus: '20' },
    { name: 'Kid Kohan', rarity: 'Phantom', energy_bonus: '45' },
  ],
  powers: [
    {
      name: 'Dragon Race',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '100',
      stats: [
        { name: 'Human', multiplier: '2x', rarity: 'Comum' },
        { name: 'Android', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Namekian', multiplier: '4x', rarity: 'Raro' },
        { name: 'Frost Demon', multiplier: '5x', rarity: 'Épico' },
        { name: 'Majin', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Half-Saiyan', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Saiyan', multiplier: '12x', rarity: 'Phantom' },
      ],
    },
    {
      name: 'Saiyan Evolution',
      type: 'gacha',
      statType: 'energy',
      unlockCost: '1000',
      stats: [
        { name: 'Great Ape', multiplier: '2x', rarity: 'Comum' },
        { name: 'Super Saiyan Grad 1', multiplier: '3x', rarity: 'Incomum' },
        { name: 'Super Saiyan Grad 2', multiplier: '4x', rarity: 'Raro' },
        { name: 'Super Saiyan Grad 3', multiplier: '5x', rarity: 'Épico' },
        { name: 'Full Power Super Saiyan', multiplier: '8x', rarity: 'Lendário' },
        { name: 'Super Saiyan 2', multiplier: '10x', rarity: 'Mítico' },
        { name: 'Super Saiyan 3', multiplier: '12x', rarity: 'Phantom' },
      ],
    },
  ],
  accessories: [
      { id: 'imp-tail', name: 'Imp Tail', world: 'Mundo 1', boss: 'Halloween Raid', rarity: 'Evento', coins_bonus: '0.2', energy_bonus: '0.2x', damage_bonus: '0.2x' }
  ],
  dungeons: [
      { 
        name: 'Tournament Raid', 
        boss: 'Desconhecido', 
        description: 'Uma dungeon de progressão no Mundo 1 que vai até a sala 550.',
        achievements: {
            headers: ['Conquista', 'Requisito', 'Bônus'],
            rows: [
                { 'Conquista': 'Tournament Raid I', 'Requisito': 'Reach Wave 10', 'Bônus': '5% Energy' },
                { 'Conquista': 'Tournament Raid II', 'Requisito': 'Reach Wave 20', 'Bônus': '5% Energy' },
                { 'Conquista': 'Tournament Raid III', 'Requisito': 'Reach Wave 30', 'Bônus': '5% Energy' },
                { 'Conquista': 'Tournament Raid IV', 'Requisito': 'Reach Wave 40', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid V', 'Requisito': 'Reach Wave 60', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid VI', 'Requisito': 'Reach Wave 80', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid VII', 'Requisito': 'Reach Wave 100', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid VIII', 'Requisito': 'Reach Wave 120', 'Bônus': '+5% Coin Drop' },
                { 'Conquista': 'Tournament Raid IX', 'Requisito': 'Reach Wave 140', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid X', 'Requisito': 'Reach Wave 160', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XI', 'Requisito': 'Reach Wave 180', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XII', 'Requisito': 'Reach Wave 200', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XIII', 'Requisito': 'Reach Wave 220', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XIV', 'Requisito': 'Reach Wave 240', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XV', 'Requisito': 'Reach Wave 260', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XVI', 'Requisito': 'Reach Wave 280', 'Bônus': '+5% Coin Drop' },
                { 'Conquista': 'Tournament Raid XVII', 'Requisito': 'Reach Wave 300', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XVIII', 'Requisito': 'Reach Wave 320', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XIX', 'Requisito': 'Reach Wave 340', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XX', 'Requisito': 'Reach Wave 360', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XXI', 'Requisito': 'Reach Wave 380', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXII', 'Requisito': 'Reach Wave 400', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XXIII', 'Requisito': 'Reach Wave 420', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXIV', 'Requisito': 'Reach Wave 440', 'Bônus': '+5% Coin Drop' },
                { 'Conquista': 'Tournament Raid XXV', 'Requisito': 'Reach Wave 460', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXVI', 'Requisito': 'Reach Wave 480', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XXVII', 'Requisito': 'Reach Wave 500', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXVIII', 'Requisito': 'Reach Wave 520', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XXIX', 'Requisito': 'Reach Wave 540', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXX', 'Requisito': 'Reach Wave 560', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XXXI', 'Requisito': 'Reach Wave 580', 'Bônus': '5% Energy' },
                { 'Conquista': 'Tournament Raid XXXII', 'Requisito': 'Reach Wave 600', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXXIII', 'Requisito': 'Reach Wave 620', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XXXIV', 'Requisito': 'Reach Wave 640', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XXXV', 'Requisito': 'Reach Wave 660', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXXVI', 'Requisito': 'Reach Wave 680', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XXXVII', 'Requisito': 'Reach Wave 700', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XXXVIII', 'Requisito': 'Reach Wave 720', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XXXIX', 'Requisito': 'Reach Wave 740', 'Bônus': '10% Damage' },
                { 'Conquista': 'Tournament Raid XL', 'Requisito': 'Reach Wave 760', 'Bônus': '5% Star Luck' },
                { 'Conquista': 'Tournament Raid XLI', 'Requisito': 'Reach Wave 780', 'Bônus': '10% Energy' },
                { 'Conquista': 'Tournament Raid XLII', 'Requisito': 'Reach Wave 800', 'Bônus': '10% Damage' }
            ]
        }
      },
      { 
        name: 'Halloween Raid', 
        boss: 'Pumpkin King', 
        description: 'Uma raid de evento com temática de Halloween. Contém o Halloween Crafting para criar Spooky Portions (2.5x de bônus) e o sistema de evolução da Halloween Bag.',
        achievements: {
            headers: ['Conquista', 'Requisito', 'Bônus'],
            rows: [
                { 'Conquista': 'Halloween Raid I', 'Requisito': 'Reach Wave 50', 'Bônus': '1% Energia' },
                { 'Conquista': 'Halloween Raid II', 'Requisito': 'Reach Wave 100', 'Bônus': '2% Dano' },
                { 'Conquista': 'Halloween Raid III', 'Requisito': 'Reach Wave 150', 'Bônus': '3% Energia' },
                { 'Conquista': 'Halloween Raid IV', 'Requisito': 'Reach Wave 200', 'Bônus': '4% Dano' },
                { 'Conquista': 'Halloween Raid V', 'Requisito': 'Reach Wave 250', 'Bônus': '5% Energia' },
                { 'Conquista': 'Halloween Raid VI', 'Requisito': 'Reach Wave 300', 'Bônus': '6% Dano' },
                { 'Conquista': 'Halloween Raid VII', 'Requisito': 'Reach Wave 350', 'Bônus': '7% Energia' },
                { 'Conquista': 'Halloween Raid VIII', 'Requisito': 'Reach Wave 400', 'Bônus': '8% Dano' },
                { 'Conquista': 'Halloween Raid IX', 'Requisito': 'Reach Wave 450', 'Bônus': '9% Energia' },
                { 'Conquista': 'Halloween Raid X', 'Requisito': 'Reach Wave 500', 'Bônus': '10% Dano' },
                { 'Conquista': 'Halloween Raid XI', 'Requisito': 'Reach Wave 550', 'Bônus': '11% Energia' },
                { 'Conquista': 'Halloween Raid XII', 'Requisito': 'Reach Wave 600', 'Bônus': '12% Dano' },
                { 'Conquista': 'Halloween Raid XIII', 'Requisito': 'Reach Wave 650', 'Bônus': '13% Energia' },
                { 'Conquista': 'Halloween Raid XIV', 'Requisito': 'Reach Wave 700', 'Bônus': '14% Dano' },
                { 'Conquista': 'Halloween Raid XV', 'Requisito': 'Reach Wave 750', 'Bônus': '15% Energia' },
                { 'Conquista': 'Halloween Raid XVI', 'Requisito': 'Reach Wave 800', 'Bônus': '16% Dano' },
                { 'Conquista': 'Halloween Raid XVII', 'Requisito': 'Reach Wave 850', 'Bônus': '17% Energia' },
                { 'Conquista': 'Halloween Raid XVIII', 'Requisito': 'Reach Wave 900', 'Bônus': '18% Dano' },
                { 'Conquista': 'Halloween Raid XIX', 'Requisito': 'Reach Wave 950', 'Bônus': '19% Energia' },
                { 'Conquista': 'Halloween Raid XX', 'Requisito': 'Reach Wave 1000', 'Bônus': 'Halloween Bag' },
            ]
        }
      },
      {
        name: 'Graveyard Defense',
        boss: 'Necromancer',
        description: 'Uma raid de evento em sua própria ilha, focada em defender contra hordas de mortos-vivos.'
      }
  ],
  obelisks: [
    {
      id: 'dragon-obelisk',
      name: 'Dragon Obelisk',
      description: 'Um obelisco comum que fornece bônus permanentes após completar uma missão.',
      mission: {
        name: 'Missão #1',
        requirement: 'Derrotar Kid Kohan 10 vezes.',
        rewards: [
          { name: 'Obelisk Part', amount: 1 },
          { name: 'Energy Percent', value: '5%' },
          { name: 'Exp', amount: '1.5k' },
          { name: 'Avatar Soul', amount: 100 },
          { name: 'Energy Potion', amount: 1 }
        ]
      },
      boosts: [
        { type: 'Energy Multiply', value: '0.15x' },
        { type: 'Damage Multiply', value: '0.25x' },
        { type: 'Exp Percent', value: '3.5%' }
      ]
    }
  ],
  missions: [
    {
        name: 'Missão #1',
        requirement: 'Derrotar 30 Kriluni',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Coin Potion', amount: 1 },
            { name: 'Exp', amount: '30' }
        ]
    },
    {
        name: 'Missão #2',
        requirement: 'Derrotar 25 Ymicha',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Coin Percent', value: '1%' },
            { name: 'Exp', amount: '100' }
        ]
    },
    {
        name: 'Missão #3',
        requirement: 'Derrotar 20 Tian Shan',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Damage Percent', value: '1%' },
            { name: 'Exp', amount: '180' }
        ]
    },
    {
        name: 'Missão #4',
        requirement: 'Derrotar 15 Kohan',
        rewards: [
            { name: 'World Key', amount: 1 },
            { name: 'Energy Percent', value: '1%' },
            { name: 'Exp', amount: '300' }
        ]
    },
    {
        name: 'Missão #5',
        requirement: 'Derrotar 10 Picco',
        rewards: [
            { name: 'Avatar Soul', amount: 5 },
            { name: 'Luck Percent', value: '1%' },
            { name: 'Dragon Race Token', amount: 10 },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '500' }
        ]
    },
    {
        name: 'Missão #6',
        requirement: 'Derrotar 5 Koku',
        rewards: [
            { name: 'Saiyan Evolution Token', amount: 10 },
            { name: 'Energy Percent', value: '2%' },
            { name: 'World Key', amount: 1 },
            { name: 'Exp', amount: '600' }
        ]
    },
    {
      name: 'Hero License Quest',
      type: 'progression',
      statType: 'mixed',
      description: "Uma questline da Classe F iniciada no Mundo 1. Suas missões se estendem por vários mundos (1-5 e Lobby) e o jogador só pode aceitar uma missão desta categoria por vez.",
      missions: [
          { name: 'F Class Quest #1', world: 1, requirement: 'Derrotar 100 Kriluni', rewards: [{name: 'Soul Potion', amount: 1}, {name: 'Energy Potion', amount: 1}] },
          { name: 'F Class Quest #2', world: 1, requirement: 'Coletar 500 Dragon Race Token', rewards: [{name: 'Porção de alcance de ataque', amount: 1}, {name: 'Coin Potion', amount: 1}] },
          { name: 'F Class Quest #3', world: 2, requirement: 'Derrotar 75 Usors', rewards: [{name: 'Exp Potion', amount: 1}, {name: 'Damage Potion', amount: 1}] },
          { name: 'F Class Quest #4', world: 2, requirement: 'Coletar 1000 Haki Token', rewards: [{name: 'Exp Potion', amount: 1}, {name: 'Soul Potion', amount: 1}] },
          { name: 'F Class Quest #5', world: 3, requirement: 'Derrotar 50 Uryuas', rewards: [{name: 'Damage Potion', amount: 1}, {name: 'Energy Potion', amount: 1}] },
          { name: 'F Class Quest #6', world: 5, requirement: 'Derrotar 25 Rangaki', rewards: [{name: 'Damage Potion', amount: 1}, {name: 'Energy Potion', amount: 1}, {name: 'Drop Potion', amount: 1}] },
          { name: 'F Class Quest #7', world: 'Dungeon Lobby 1', requirement: 'Chegar ao piso 50 na Dungeon Easy (Lobby 1) + 2000 Breathing Token', rewards: [{name: 'License F Class', amount: 1}, {name: 'Credits', amount: 5}, {name: 'Drop Potion', amount: 1}] }
      ]
    }
  ]
};

    