
export const colorRulesGuideArticle = {
  id: 'color-rules-guide',
  title: 'Guia de Cores de Raridade',
  summary: 'Um guia de referência para entender o que cada cor de item significa no jogo, seus tipos e os bônus associados.',
  content: `No Anime Eternal, a cor de fundo do nome de um item indica sua raridade e, consequentemente, seu poder. Saber o que cada cor significa é essencial para avaliar a força de um equipamento, poder ou lutador.

### Tipos de Bônus
Os itens geralmente fornecem um ou mais dos seguintes tipos de bônus:
- **Dano:** Aumenta o dano que você causa aos inimigos.
- **Energia:** Aumenta a sua energia total, que serve como base para o seu dano.
- **Moedas (Coin):** Aumenta a quantidade de moedas que você ganha.
- **Sorte (Luck):** Aumenta a chance de obter itens de maior raridade.

Abaixo está a tabela completa de raridades, da mais fraca para a mais forte.`,
  tags: ['cores', 'raridade', 'guia', 'itens', 'dano', 'energia', 'sorte', 'moedas'],
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
  },
};
