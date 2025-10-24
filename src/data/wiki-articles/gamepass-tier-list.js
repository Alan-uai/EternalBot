
export const gamepassTierListArticle = {
  id: 'gamepass-tier-list',
  title: 'Guia de Gamepasses',
  summary: 'Um guia completo sobre as gamepasses, incluindo a ordem de compra recomendada, custos e categorias de utilidade.',
  content: `Este guia detalha todas as gamepasses do jogo. A primeira tabela mostra a ordem de compra recomendada pela comunidade e seus custos em créditos. As tabelas seguintes agrupam as gamepasses por sua função principal no jogo.

### Ordem de Compra Recomendada
Esta lista é priorizada para maximizar a progressão de poder e eficiência de farm.

### Categorias de Gamepass
As gamepasses podem ser divididas em categorias para melhor entendimento:
- **Gamepass de Energia:** Focadas em aumentar seu ganho de energia.
- **Gamepass de Dano:** Focadas em aumentar seu potencial de dano.
- **Gamepass de Utilidade:** Oferecem melhorias de qualidade de vida e eficiência geral.
- **Gamepass de Giro de Estrela:** Focadas em melhorar a obtenção e o gerenciamento de pets (champions).`,
  tags: ['gamepass', 'tier list', 'ordem de compra', 'custo', 'crédito', 'guia', 'energia', 'dano', 'utilidade'],
  imageUrl: 'wiki-12',
  tables: {
    buyOrder: {
      headers: ['Gamepass', 'Custo (Crédito)'],
      rows: [
        { Gamepass: 'Fast Click', 'Custo (Crédito)': '300' },
        { Gamepass: 'Double Energy', 'Custo (Crédito)': '625' },
        { Gamepass: 'Double Damage', 'Custo (Crédito)': '625' },
        { Gamepass: 'Double Weapon', 'Custo (Crédito)': '950' },
        { Gamepass: 'Fast Roll', 'Custo (Crédito)': '950' },
        { Gamepass: 'Double Aura', 'Custo (Crédito)': '900' },
        { Gamepass: 'Triple Weapon', 'Custo (Crédito)': '1.080' },
        { Gamepass: '2x Exp', 'Custo (Crédito)': '625' },
        { Gamepass: 'Extra Champions', 'Custo (Crédito)': '1.080' },
        { Gamepass: 'Extra Stand', 'Custo (Crédito)': '550' },
        { Gamepass: '2 Equips', 'Custo (Crédito)': '900' },
        { Gamepass: 'Vip', 'Custo (Crédito)': '550' },
        { Gamepass: 'Extra Shadow', 'Custo (Crédito)': '550' },
        { Gamepass: 'Extra Titan', 'Custo (Crédito)': '550' },
        { Gamepass: 'Fast Star Open', 'Custo (Crédito)': '700' },
        { Gamepass: 'Multi Roll', 'Custo (Crédito)': '950' },
        { Gamepass: 'Multi Open', 'Custo (Crédito)': '700' },
        { Gamepass: 'Remote Acess', 'Custo (Crédito)': '1.600' },
        { Gamepass: 'Lucky!', 'Custo (Crédito)': '300' },
        { Gamepass: 'Small and Big Storage', 'Custo (Crédito)': '300 / 550' },
        { Gamepass: 'Double Souls', 'Custo (Crédito)': '700' },
        { Gamepass: 'Super Lucky!', 'Custo (Crédito)': '1.100' },
        { Gamepass: 'Ultra Luck!', 'Custo (Crédito)': '2.300' },
        { Gamepass: 'Double Coins', 'Custo (Crédito)': '550' }
      ]
    },
    energyCategory: {
        headers: ['Gamepass de Energia'],
        rows: [
            { 'Gamepass de Energia': 'Double Energy' },
            { 'Gamepass de Energia': 'Fast Click' },
            { 'Gamepass de Energia': 'Double Aura' },
            { 'Gamepass de Energia': 'More Equips' },
            { 'Gamepass de Energia': 'Extra Champions' },
            { 'Gamepass de Energia': 'Vip' },
            { 'Gamepass de Energia': 'Extra Shadow' },
            { 'Gamepass de Energia': 'Small Bag' },
            { 'Gamepass de Energia': 'Big Storage' },
        ]
    },
    damageCategory: {
        headers: ['Gamepass de Dano'],
        rows: [
            { 'Gamepass de Dano': 'Double Damage' },
            { 'Gamepass de Dano': 'Double Weapon' },
            { 'Gamepass de Dano': 'Double Aura' },
            { 'Gamepass de Dano': 'Triple Weapon' },
            { 'Gamepass de Dano': 'Extra Stand' },
            { 'Gamepass de Dano': 'Extra Shadow' },
            { 'Gamepass de Dano': 'Extra Titan' },
        ]
    },
    utilityCategory: {
        headers: ['Gamepass de Utilidade'],
        rows: [
            { 'Gamepass de Utilidade': 'Fast Roll' },
            { 'Gamepass de Utilidade': 'Double Exp' },
            { 'Gamepass de Utilidade': 'Double Aura' },
            { 'Gamepass de Utilidade': 'Multi Roll' },
            { 'Gamepass de Utilidade': 'Fast Star Open' },
            { 'Gamepass de Utilidade': 'Multi Open' },
            { 'Gamepass de Utilidade': 'Remote Acess' },
            { 'Gamepass de Utilidade': 'Double Souls' },
            { 'Gamepass de Utilidade': 'Double Coins' },
        ]
    },
    starSpinCategory: {
        headers: ['Gamepass de Giro de Estrela'],
        rows: [
            { 'Gamepass de Giro de Estrela': 'Fast Star Open' },
            { 'Gamepass de Giro de Estrela': 'Multi Open' },
            { 'Gamepass de Giro de Estrela': 'Double Aura' },
            { 'Gamepass de Giro de Estrela': 'Lucky!' },
            { 'Gamepass de Giro de Estrela': 'Super Lucky!' },
            { 'Gamepass de Giro de Estrela': 'Ultra Luck!' },
        ]
    }
  },
};
