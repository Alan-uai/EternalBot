
export const avatarIndexArticle = {
  id: 'avatar-index',
  title: 'Avatar Index',
  summary: 'Uma tabela de referência completa para os bônus de energia concedidos pelos Avatares de cada mundo, tanto no nível base quanto no nível 150.',
  content: `Esta página serve como um índice para os bônus de energia de todos os Avatares no jogo, organizados por mundo e rank. Use estas tabelas para planejar qual avatar obter para maximizar seus ganhos de energia.`,
  tags: ['avatar', 'energia', 'index', 'guia', 'bônus', 'lvl 150'],
  tables: {
    world1: {
        headers: ['Avatar', 'Raridade', 'Stats (Base)', 'Stats (lvl 150)'],
        rows: [
          { 'Avatar': '[Av] Kriluni', 'Raridade': 'Comum', 'Stats (Base)': '3', 'Stats (lvl 150)': '25.5' },
          { 'Avatar': '[Av] Ymicha', 'Raridade': 'Incomum', 'Stats (Base)': '6', 'Stats (lvl 150)': '51' },
          { 'Avatar': '[Av] Tian Shan', 'Raridade': 'Raro', 'Stats (Base)': '9', 'Stats (lvl 150)': '76.5' },
          { 'Avatar': '[Av] Kohan', 'Raridade': 'Épico', 'Stats (Base)': '12', 'Stats (lvl 150)': '102' },
          { 'Avatar': '[Av] Picco', 'Raridade': 'Lendário', 'Stats (Base)': '15', 'Stats (lvl 150)': '127.5' },
          { 'Avatar': '[Av] Koku', 'Raridade': 'Mítico', 'Stats (Base)': '20', 'Stats (lvl 150)': '170' },
          { 'Avatar': '[Av] Kid Kohan', 'Raridade': 'Phantom', 'Stats (Base)': '60', 'Stats (lvl 150)': '510' },
        ],
    },
    world2_3: {
        headers: ['Rank', 'Stats (W2)', 'Stats (lvl 150, W2)', 'Stats (W3)', 'Stats (lvl 150, W3)'],
        rows: [
          { Rank: 'E', 'Stats (W2)': '8', 'Stats (lvl 150, W2)': '68', 'Stats (W3)': '19', 'Stats (lvl 150, W3)': '161.5' },
          { Rank: 'D', 'Stats (W2)': '15', 'Stats (lvl 150, W2)': '127.5', 'Stats (W3)': '38', 'Stats (lvl 150, W3)': '323' },
          { Rank: 'C', 'Stats (W2)': '23', 'Stats (lvl 150, W2)': '195.5', 'Stats (W3)': '56', 'Stats (lvl 150, W3)': '476' },
          { Rank: 'B', 'Stats (W2)': '30', 'Stats (lvl 150, W2)': '255', 'Stats (W3)': '75', 'Stats (lvl 150, W3)': '637.5' },
          { Rank: 'A', 'Stats (W2)': '38', 'Stats (lvl 150, W2)': '323', 'Stats (W3)': '94', 'Stats (lvl 150, W3)': '799' },
          { Rank: 'S', 'Stats (W2)': '50', 'Stats (lvl 150, W2)': '425', 'Stats (W3)': '125', 'Stats (lvl 150, W3)': '1.06k' },
          { Rank: 'SS', 'Stats (W2)': '150', 'Stats (lvl 150, W2)': '1.27k', 'Stats (W3)': '375', 'Stats (lvl 150, W3)': '3.18k' },
        ],
    },
    world4_6: {
        headers: ['Rank', 'Stats (W4)', 'Stats (lvl 150, W4)', 'Stats (W5)', 'Stats (lvl 150, W5)', 'Stats (W6)', 'Stats (lvl 150, W6)'],
        rows: [
          { Rank: 'E', 'Stats (W4)': '47', 'Stats (lvl 150, W4)': '399', 'Stats (W5)': '117', 'Stats (lvl 150, W5)': '994', 'Stats (W6)': '293', 'Stats (lvl 150, W6)': '2.49k' },
          { Rank: 'D', 'Stats (W4)': '94', 'Stats (lvl 150, W4)': '799', 'Stats (W5)': '234', 'Stats (lvl 150, W5)': '1.98k', 'Stats (W6)': '586', 'Stats (lvl 150, W6)': '4.98k' },
          { Rank: 'C', 'Stats (W4)': '141', 'Stats (lvl 150, W4)': '1.19k', 'Stats (W5)': '352', 'Stats (lvl 150, W5)': '2.99k', 'Stats (W6)': '879', 'Stats (lvl 150, W6)': '7.47k' },
          { Rank: 'B', 'Stats (W4)': '188', 'Stats (lvl 150, W4)': '1.59k', 'Stats (W5)': '469', 'Stats (lvl 150, W5)': '3.98k', 'Stats (W6)': '1.17k', 'Stats (lvl 150, W6)': '9.96k' },
          { Rank: 'A', 'Stats (W4)': '234', 'Stats (lvl 150, W4)': '1.98k', 'Stats (W5)': '586', 'Stats (lvl 150, W5)': '4.98k', 'Stats (W6)': '1.46k', 'Stats (lvl 150, W6)': '12.4k' },
          { Rank: 'S', 'Stats (W4)': '313', 'Stats (lvl 150, W4)': '2.66k', 'Stats (W5)': '781', 'Stats (lvl 150, W5)': '6.63k', 'Stats (W6)': '1.95k', 'Stats (lvl 150, W6)': '16.6k' },
          { Rank: 'SS', 'Stats (W4)': '938', 'Stats (lvl 150, W4)': '7.29k', 'Stats (W5)': '2.43k', 'Stats (lvl 150, W5)': '19.9k', 'Stats (W6)': '5.85k', 'Stats (lvl 150, W6)': '49.8k' },
        ],
    },
    world7_9: {
        headers: ['Rank', 'Stats (W7)', 'Stats (lvl 150, W7)', 'Stats (W8)', 'Stats (lvl 150, W8)', 'Stats (W9)', 'Stats (lvl 150, W9)'],
        rows: [
          { Rank: 'E', 'Stats (W7)': '732', 'Stats (lvl 150, W7)': '6.22k', 'Stats (W8)': '1.83k', 'Stats (lvl 150, W8)': '15.5k', 'Stats (W9)': '4.57k', 'Stats (lvl 150, W9)': '38.9k' },
          { Rank: 'D', 'Stats (W7)': '1.46k', 'Stats (lvl 150, W7)': '12.4k', 'Stats (W8)': '3.66k', 'Stats (lvl 150, W8)': '31.1k', 'Stats (W9)': '9.15k', 'Stats (lvl 150, W9)': '77.8k' },
          { Rank: 'C', 'Stats (W7)': '2.19k', 'Stats (lvl 150, W7)': '18.6k', 'Stats (W8)': '5.49k', 'Stats (lvl 150, W8)': '46.6k', 'Stats (W9)': '13.7k', 'Stats (lvl 150, W9)': '116k' },
          { Rank: 'B', 'Stats (W7)': '2.93k', 'Stats (lvl 150, W7)': '24.9k', 'Stats (W8)': '7.32k', 'Stats (lvl 150, W8)': '62.2k', 'Stats (W9)': '18.3k', 'Stats (lvl 150, W9)': '155k' },
          { Rank: 'A', 'Stats (W7)': '3.66k', 'Stats (lvl 150, W7)': '31.1k', 'Stats (W8)': '9.15k', 'Stats (lvl 150, W8)': '77.8k', 'Stats (W9)': '22.8k', 'Stats (lvl 150, W9)': '194k' },
          { Rank: 'S', 'Stats (W7)': '4.88k', 'Stats (lvl 150, W7)': '41.5k', 'Stats (W8)': '12.2k', 'Stats (lvl 150, W8)': '103k', 'Stats (W9)': '30.5k', 'Stats (lvl 150, W9)': '259k' },
          { Rank: 'SS', 'Stats (W7)': '14.6k', 'Stats (lvl 150, W7)': '124k', 'Stats (W8)': '36.6k', 'Stats (lvl 150, W8)': '311k', 'Stats (W9)': '91.5k', 'Stats (lvl 150, W9)': '778k' },
        ],
    },
  },
};
