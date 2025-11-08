
export const halloweenEventGuideArticle = {
  id: 'halloween-event-guide',
  title: 'Guia do Evento de Halloween',
  summary: 'Um guia completo para a Raid de Halloween, a Halloween Bag, os Energy Zombies e os Avatares exclusivos que são os únicos no jogo a concederem bônus de Star Luck.',
  content: `O Evento de Halloween traz uma nova raid desafiadora e itens exclusivos. Este guia detalha como participar e como maximizar as recompensas do evento.

### Nova Raid de Halloween (Mundo 1)

Uma nova raid temporária está disponível no Mundo 1.
- **Localização:** Mundo 1
- **Total de Ondas (Waves):** 1.000
- **Recompensa Final:** Ao completar a 1000ª onda, você recebe a **Halloween Bag**, um item de progressão com múltiplas evoluções.
- **Drop Exclusivo:** A raid também tem a chance de dropar o acessório de cintura **Imp Tail**.

### Graveyard Defense Raid (Ilha de Halloween)
Uma segunda raid, a **Graveyard Defense**, está localizada em sua própria ilha de evento. É aqui que você pode obter o **Halloween Ghost Power** e os **Energy Zombies**.

### Avatares de Halloween (Bônus de Star Luck Único)
Os avatares obtidos durante este evento são os únicos em todo o jogo que fornecem um bônus direto de **Star Luck**, tornando-os extremamente valiosos para farm de pets. O avatar **Spook-suke** também tem a chance de dropar a arma de energia **Overdrive Saw**.

### Sistema de Progressão da Halloween Bag

A Halloween Bag funciona de forma similar ao poder "Adolla" do Mundo 19. Você começa com uma versão Comum e a evolui usando **Halloween Candies** (doces de Halloween), que são obtidos durante a raid. O nível da bag é aumentado no **Halloween Bag Leveling**, enquanto a raridade é evoluída no **Halloween Envolve**.

#### **Halloween Bag Power**

| Raridade  | Stats (Base)                               | Stats (lvl 100)                             | Custo de Leveling |
|-----------|--------------------------------------------|---------------------------------------------|-------------------|
| Common    | 0.5x Energia                               | 1.5x Energia                                | 10k Candy         |
| Rare      | 1.5x Energia, 1.5x Dano                    | 3x Energia, 3x Dano                         | 10k Candy         |
| Legendary | 2.5x Energia, 2.5x Dano, 2x Moedas         | 5x Energia, 5x Dano, 4x Moedas              | 10k Candy         |
| Mythic    | 5x Energia, 5x Dano, 4x Moedas             | 7.5x Energia, 7.5x Dano, 6x Moedas          | 35k Candy         |
| Phantom   | 7.5x Energia, 7.5x Dano, 6x Moedas         | 11.2x Energia, 11.2x Dano, 6x Moedas        | 41k Candy         |
| Supreme   | 10x Energia, 10x Dano, 6x Moedas           | 15x Energia, 15x Dano, 6x Moedas            | 61k Candy         |

### Halloween Crafting (Spooky Portions)
No local do evento, também é possível fabricar **"Spooky Portions"** (Poções Assustadoras). Elas funcionam como consumíveis que fornecem um multiplicador de **2.5x** para seus respectivos bônus (dano, energia, moedas), sendo uma ótima forma de acelerar o farm durante o evento.

### Halloween Ghost Power
Este poder é obtido na **Graveyard Defense Raid** e evolui usando "Eyes".
| Raridade  | Stats (Base) | Stats (lvl 100) | Custo de Leveling |
|-----------|--------------|-----------------|-------------------|
| Common    | 0.5x         | 1x              | 11k Eyes          |
| Uncommon  | 1x           | 2x              | 21k Eyes          |
| Rare      | 1.5x         | 3x              | 31k Eyes          |
| Epic      | 2.5x         | 5x              | 41k Eyes          |
| Legendary | 3.5x         | 6.47x           | 50k Eyes          |
| Mythic    | 5.5x         | 9.62x           | 60k Eyes          |
| Phantom   | 7.5x         | 11.2x           | 70k Eyes          |
| Supreme   | 10x          | 15x             | 200k Eyes         |


### Fighters do Evento
Existem dois tipos de zumbis no jogo. Os de Energia são exclusivos do evento de Halloween. Os de Dano são encontrados no Mundo 25.
`,
  tags: ['guia', 'evento', 'halloween', 'raid', 'halloween bag', 'progressão', 'mundo 1', 'energia', 'dano', 'moedas', 'imp tail', 'zombie', 'spooky portions', 'ghost power', 'graveyard defense', 'star luck'],
  tables: {
    halloweenAvatars: {
      headers: ['Name', 'Stats (Energy)', 'Stats (lvl 150 Energy)', 'Stats (Star Luck)', 'Stats (lvl 150 Star Luck)'],
      rows: [
        { Name: 'Carrotto', 'Stats (Energy)': '2.34k', 'Stats (lvl 150 Energy)': '19.9k', 'Stats (Star Luck)': '5%', 'Stats (lvl 150 Star Luck)': '5%' },
        { Name: 'Evil Bald Man', 'Stats (Energy)': '228k', 'Stats (lvl 150 Energy)': '1.93M', 'Stats (Star Luck)': '10%', 'Stats (lvl 150 Star Luck)': '10%' },
        { Name: 'Pumpkinado', 'Stats (Energy)': '22.4M', 'Stats (lvl 150 Energy)': '190M', 'Stats (Star Luck)': '15%', 'Stats (lvl 150 Star Luck)': '15%' },
        { Name: 'Bald Warlock', 'Stats (Energy)': '2.19B', 'Stats (lvl 150 Energy)': '18.6B', 'Stats (Star Luck)': '20%', 'Stats (lvl 150 Star Luck)': '20%' },
        { Name: 'Spook-suke', 'Stats (Energy)': '214B', 'Stats (lvl 150 Energy)': '1.82T', 'Stats (Star Luck)': '25%', 'Stats (lvl 150 Star Luck)': '25%' }
      ]
    },
    energyZombies: {
      headers: ['Name', 'Stats', 'Stats (1 Star)', 'Stats (2 Star)', 'Stats (3 Star)'],
      rows: [
        { Name: 'Bolt-8', Stats: '0.2x', 'Stats (1 Star)': '1x', 'Stats (2 Star)': '2x', 'Stats (3 Star)': '4x' },
      ],
    },
  },
  accessories: [
    {
      id: 'imp-tail',
      name: 'Imp Tail',
      slot: 'Waist',
      world: '1',
      raid: 'Halloween Raid',
      bonuses: [
        {
          type: 'damage',
          valuesByRarity: [
            { rarity: "Common", value: "0.067x" },
            { rarity: "Uncommon", value: "0.1x" },
            { rarity: "Rare", value: "0.133x" },
            { rarity: "Epic", value: "0.167x" },
            { rarity: "Legendary", value: "0.2x" },
            { rarity: "Mythic", value: "0.233x" },
            { rarity: "Phantom", value: "0.334x" },
            { rarity: "Supreme", value: "0.5x" }
          ]
        },
        {
          type: 'energy',
          valuesByRarity: [
            { rarity: "Common", value: "0.067x" },
            { rarity: "Uncommon", value: "0.1x" },
            { rarity: "Rare", value: "0.133x" },
            { rarity: "Epic", value: "0.167x" },
            { rarity: "Legendary", value: "0.2x" },
            { rarity: "Mythic", value: "0.233x" },
            { rarity: "Phantom", value: "0.334x" },
            { rarity: "Supreme", value: "0.5x" }
          ]
        }
      ]
    }
  ]
};
