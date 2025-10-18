// Para simplificar, todos os artigos da wiki são definidos aqui.
// Em um sistema real, isso poderia vir de um CMS ou banco de dados.

export const gettingStartedArticle = {
    id: 'getting-started',
    title: 'Começando no Anime Eternal',
    summary: "Um guia para iniciantes para começar sua aventura no mundo do Anime Eternal.",
    content: `Bem-vindo ao Anime Eternal! Este guia irá guiá-lo através das principais características do Mundo 1, o hub central do jogo.`,
    tags: ['iniciante', 'guia', 'novo jogador', 'geral'],
    imageUrl: 'wiki-1',
};

export const scientificNotationArticle = {
  id: 'scientific-notation',
  title: 'Abreviações de Notação Científica',
  summary: 'Um guia de referência para as abreviações de números grandes usadas no jogo.',
  content: 'Entender as abreviações para números grandes é crucial para medir seu poder e o HP dos inimigos. Aqui está um guia completo.',
  tags: ['notação', 'abreviação', 'números', 'guia', 'geral'],
  imageUrl: 'wiki-13',
  tables: {
    notation1: {
      headers: ['Abreviação', 'Nome', 'Notação Científica'],
      rows: [
        { Abreviação: 'k', Nome: 'Thousand', 'Notação Científica': '1.00E+003' },
        { Abreviação: 'M', Nome: 'Million', 'Notação Científica': '1.00E+006' },
        { Abreviação: 'B', Nome: 'Billion', 'Notação Científica': '1.00E+009' },
        { Abreviação: 'T', Nome: 'Trillion', 'Notação Científica': '1.00E+012' },
        { Abreviação: 'qd', Nome: 'Quadrillion', 'Notação Científica': '1.00E+015' },
        { Abreviação: 'Qn', Nome: 'Quintillion', 'Notação Científica': '1.00E+018' },
        { Abreviação: 'sx', Nome: 'Sextillion', 'Notação Científica': '1.00E+021' },
      ],
    },
  }
};


export const allWikiArticles = [
    gettingStartedArticle,
    scientificNotationArticle,
];
