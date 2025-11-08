
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
        { Cor: 'Lilás/Magenta', Raridade: 'Épico' },
        { Cor: 'Amarelo', Raridade: 'Lendário' },
        { Cor: 'Vermelho', Raridade: 'Mítico' },
        { Cor: 'Roxo', Raridade: 'Phantom' },
        { Cor: 'Laranja/Arco-íris', Raridade: 'Supremo' },
      ],
    },
    statusIcons: {
      headers: ['Ícone', 'Significado', 'Descrição'],
      rows: [
        { Ícone: '🧪 (Tubo de Ensaio Azul)', Significado: 'Poção de Energia', Descrição: 'Bônus temporário de energia.' },
        { Ícone: '🧪 (Tubo de Ensaio Vermelho)', Significado: 'Poção de Dano', Descrição: 'Bônus temporário de dano.' },
        { Ícone: '🧪 (Tubo de Ensaio Verde)', Significado: 'Poção de Sorte', Descrição: 'Bônus temporário de sorte.' },
        { Ícone: '🧪 (Tubo de Ensaio Amarelo)', Significado: 'Poção de Moedas', Descrição: 'Bônus temporário de moedas.' },
        { Ícone: '🧪 (Tubo de Ensaio Laranja)', Significado: 'Poção de Drop', Descrição: 'Bônus temporário na chance de drop.' },
        { Ícone: '🪙 (Moeda com Símbolo)', Significado: 'Token', Descrição: 'Recurso usado para girar gachas, fazer crafting e subir o nível de poderes de progressão.' },
        { Ícone: '👻 (Fantasminha Colorido)', Significado: 'Avatar Soul', Descrição: 'Material para evoluir avatares.' },
        { Ícone: '🔑 (Chave Azul)', Significado: 'Chave de Mundo', Descrição: 'Item necessário para desbloquear o próximo mundo.' },
        { Ícone: '`+EXP` (Texto Colorido)', Significado: 'Experiência', Descrição: 'Pontos de experiência ganhos.' },
        { Ícone: '💳 (Cartão Colorido)', Significado: 'Créditos', Descrição: 'Moeda F2P usada para comprar gamepasses e outros itens especiais.' },
        { Ícone: '⚡ (Raio)', Significado: 'Energia', Descrição: 'Bônus permanente de Energia.' },
        { Ícone: '🥊 (Luva de Boxe)', Significado: 'Dano', Descrição: 'Bônus permanente de Dano.' },
        { Ícone: '🪙 (Moeda)', Significado: 'Moedas (Coins)', Descrição: 'Bônus permanente de Moedas.' },
        { Ícone: '⭐ / 🍀 (Estrela / Trevo)', Significado: 'Sorte (Luck)', Descrição: 'Bônus permanente de Sorte.' },
      ],
    },
  },
};
