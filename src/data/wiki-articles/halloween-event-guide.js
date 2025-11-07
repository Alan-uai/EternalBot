
export const halloweenEventGuideArticle = {
  id: 'halloween-event-guide',
  title: 'Guia do Evento de Halloween',
  summary: 'Um guia completo para a Raid de Halloween, a Halloween Bag, os novos Energy Zombies e os drops exclusivos como o Imp Tail.',
  content: `O Evento de Halloween traz uma nova raid desafiadora e itens exclusivos. Este guia detalha como participar e como maximizar as recompensas do evento.

### Nova Raid de Halloween (Mundo 1)

Uma nova raid temporária está disponível no Mundo 1.
- **Localização:** Mundo 1
- **Total de Ondas (Waves):** 1.000
- **Recompensa Final:** Ao completar a 1000ª onda, você recebe a **Halloween Bag**, um item de progressão com múltiplas evoluções.
- **Drop Exclusivo:** A raid também tem a chance de dropar o acessório de cintura **Imp Tail**.

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

### Fighters do Evento
Existem dois tipos de zumbis no jogo. Os de Energia são exclusivos do evento de Halloween. Os de Dano são encontrados no Mundo 25.
`,
  tags: ['guia', 'evento', 'halloween', 'raid', 'halloween bag', 'progressão', 'mundo 1', 'energia', 'dano', 'moedas', 'imp tail', 'zombie', 'spooky portions', 'ghost power'],
  tables: {
    energyZombies: {
      headers: ['Name', 'Stats', 'Stats (1 Star)', 'Stats (2 Star)', 'Stats (3 Star)'],
      rows: [
        { Name: 'Bolt-8', Stats: '0.2x', 'Stats (1 Star)': '1x', 'Stats (2 Star)': '2x', 'Stats (3 Star)': '4x' },
      ],
    },
  },
};
