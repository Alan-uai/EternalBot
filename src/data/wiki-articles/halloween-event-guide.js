
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

#### **Etapa 1: Comum**
- **Bônus Base:** 0.5x Energia
- **Leveling:** Você deve upar este item até o nível máximo no **Halloween Bag Leveling**.
- **Bônus Máximo (após leveling):** 1.5x Energia

#### **Etapa 2: Incomum**
- **Como Obter:** Com a Bag Comum no nível máximo (nível 100), vá para o **"Halloween Envolve"** e crafte a versão Incomum. O processo de leveling com Halloween Candies tem 100% de chance de sucesso.
- **Bônus Base:** 1x Energia, 1x Dano
- **Leveling:** Upe o item até o nível máximo.
- **Bônus Máximo (após leveling):** 2x Energia, 2x Dano

#### **Etapa 3: Épico**
- **Como Obter:** Evolua a Bag Incomum no nível máximo para obter a versão Épica no **Halloween Envolve**.
- **Bônus Base:** 2x Energia, 2x Dano, 1x Moedas (Coin)
- **Leveling:** Upe o item até o nível 100.
- **Bônus Máximo (após leveling):** 3x Energia, 3x Dano, 2x Moedas

#### **Etapa 4: Lendário**
- **Como Obter:** Evolua a Bag Épica no nível máximo para obter a versão final, Lendária, no **Halloween Envolve**.
- **Bônus Base:** 3x Energia, 3x Dano, 2x Moedas
- **Leveling:** Upe o item até o nível máximo.
- **Bônus Máximo (após leveling):** 5x Energia, 5x Dano, 4x Moedas

### Dica de Farm
Em média, completar a Raid de Halloween **duas vezes** ou obter cerca de **30.000 a 40.000 Halloween Candies** é suficiente para evoluir a Halloween Bag até sua forma Lendária com nível máximo.

### Fighters do Evento
Existem dois tipos de zumbis no jogo. Os de Energia são exclusivos do evento de Halloween. Os de Dano são encontrados no Mundo 25.
`,
  tags: ['guia', 'evento', 'halloween', 'raid', 'halloween bag', 'progressão', 'mundo 1', 'energia', 'dano', 'moedas', 'imp tail', 'zombie'],
  tables: {
    energyZombies: {
      headers: ['Name', 'Stats', 'Stats (1 Star)', 'Stats (2 Star)', 'Stats (3 Star)'],
      rows: [
        { Name: 'Bolt-8', Stats: '0.2x', 'Stats (1 Star)': '1x', 'Stats (2 Star)': '2x', 'Stats (3 Star)': '4x' },
      ],
    },
  },
};

    