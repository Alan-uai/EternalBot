
export const colorsAndIconsGuideArticle = {
  id: 'colors-and-icons-guide',
  title: 'Guia de Cores de Raridade e Ícones de Status',
  summary: 'Um guia de referência para entender o que cada cor de item e cada ícone de bônus significa no jogo.',
  content: `No Anime Eternal, a cor de fundo do nome de um item e os ícones de bônus indicam sua raridade e o tipo de status que eles afetam. Saber o que cada um significa é essencial para avaliar a força de um equipamento, poder ou lutador.

### Legenda de Cores (Raridade)
Abaixo está a tabela completa de raridades, da mais fraca para a mais forte.`,
  tags: ['cores', 'ícones', 'raridade', 'guia', 'itens', 'dano', 'energia', 'sorte', 'moedas', 'créditos'],
  tables: {
    rarityColors: {
      headers: ['Cor', 'Raridade'],
      rows: [
        { Cor: 'Cinza', Raridade: 'Comum' },
        { Cor: 'Verde', Raridade: 'Incomum' },
        { Cor: 'Azul', Raridade: 'Raro' },
        { Cor: 'Magenta/Rosa', Raridade: 'Épico' },
        { Cor: 'Amarelo', Raridade: 'Lendário' },
        { Cor: 'Vermelho', Raridade: 'Mítico' },
        { Cor: 'Roxo/Lilás', Raridade: 'Phantom' },
        { Cor: 'Laranja/Arco-íris', Raridade: 'Supremo' },
      ],
    },
    statusIcons: {
      headers: ['Ícone', 'Bônus'],
      rows: [
        { Ícone: '⚡ (Raio)', Bônus: 'Energia' },
        { Ícone: '🥊 (Luva de Boxe)', Bônus: 'Dano' },
        { Ícone: '🪙 (Moeda)', Bônus: 'Moedas (Coins)' },
        { Ícone: '⭐ (Estrela) / 🍀 (Trevo)', Bônus: 'Sorte (Luck)' },
        { Ícone: '👤+1 (Boneco com +1)', Bônus: '+1 Slot de Pet Equipado' },
        { Ícone: '💳 (Cartão Colorido)', Bônus: 'Créditos (Moeda F2P)' },
      ],
    },
  },
};

    