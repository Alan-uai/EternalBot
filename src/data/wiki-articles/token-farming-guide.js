
export const tokenFarmingGuideArticle = {
  id: 'token-farming-guide',
  title: 'Guia do Melhor Método para Farm de Tokens',
  summary: 'Aprenda o método mais eficiente para farmar qualquer tipo de token no jogo, comparando matematicamente a eficiência das raids e empilhando todos os bônus de drop disponíveis.',
  content: `Este guia explica o método definitivo para maximizar a coleta de **qualquer token** no Anime Eternal. A estratégia se divide em duas partes: primeiro, entender como acumular bônus para maximizar o ganho, e segundo, saber onde aplicar esses bônus para ter o farm mais eficiente.

### Parte 1: A Fórmula do Farm Otimizado (Empilhando Bônus)

Para calcular o ganho máximo de tokens por drop, você deve multiplicar o drop base do NPC por todos os seus bônus de multiplicador.

**Fórmula de Bônus:**
**Ganho Final = (Drop Base) * (Bônus de Aura) * (Bônus de Poção) * (Bônus de Macarrão)**

**Detalhes de Cada Bônus:**
- **Drop Base:** A quantidade de tokens que um NPC ou fonte dropa sem nenhum bônus.
- **Bônus de Aura (Ex: Aura do Rei do Fogo):** Aumenta a chance de drop em 25%, resultando em um multiplicador de **x1.25**.
- **Bônus de Poção (Poção de Drop):** Multiplicador de **x2**.
- **Bônus de Macarrão (Comida de Drop):** Aumenta a chance de drop em 50%, resultando em um multiplicador de **x1.5**.

**O Multiplicador Máximo:**
Ao combinar todos esses bônus, você alcança um multiplicador massivo na chance de drop:
\`1.25 (Aura) * 2 (Poção) * 1.5 (Macarrão) = 3.75x\`
Isso significa que você pode ter **3.75 vezes mais chance** de conseguir um drop.

### Parte 2: Análise de Eficiência de Raids (Onde Farmar)

Ter um multiplicador alto não adianta se o local de farm não for eficiente. Para determinar a melhor raid ou dungeon, devemos calcular os **"Tokens Esperados por Sala"**.

**Fórmula de Eficiência:**
**Tokens por Sala = (Nº de NPCs na Sala) * (Nº de Tokens Diferentes que Dropam) * (Chance de Drop de Cada Token)**

Esta fórmula nos dá uma estimativa matemática de quantos tokens você pode esperar obter ao limpar uma única sala em uma raid. O número total de salas em uma dungeon afeta o rendimento total, mas esta fórmula mede a eficiência por tempo gasto.

**Exemplo Prático: Restaurante Raid vs. Cursed Raid**

Vamos usar o exemplo que você deu:
- **Restaurante Raid:**
  - 5 NPCs por sala.
  - 5 tokens diferentes dropam.
  - 20% (0.20) de chance de drop por token.
  - **Cálculo:** \`5 * 5 * 0.20 = 5.0 Tokens Esperados por Sala\`
- **Cursed Raid:**
  - 6 NPCs por sala.
  - 11 tokens diferentes dropam.
  - 9% (0.09) de chance de drop por token.
  - **Cálculo:** \`6 * 11 * 0.09 = 5.94 Tokens Esperados por Sala\`

**Conclusão da Análise:** Matematicamente, a **Cursed Raid é aproximadamente 19% mais eficiente** para farm de tokens do que a Restaurante Raid, pois você pode esperar quase 1 token a mais por sala limpa.

### Parte 3: Multiplicadores de Chave de Raid (2x e 3x)

Um fator crucial para o farm de alto nível é o uso de chaves de raid extras para multiplicar as recompensas.

- **Raids com Multiplicador:** As raids **Restaurante, Cursed, Progression e Progression 2** oferecem a opção de usar 2 ou 3 chaves de uma vez.
- **Funcionamento:** Ao usar 2x ou 3x as chaves, você recebe **2x ou 3x a quantidade de tokens** e outras recompensas ao final da raid.

Isso significa que, embora a Cursed Raid seja mais eficiente por sala, se um jogador puder completar a Restaurante Raid três vezes no mesmo tempo que leva para completar a Cursed Raid uma vez (ou usar o modo 3x), a escolha pode mudar. A IA deve considerar esses multiplicadores como um fator decisivo nas recomendações.

**Cenários de Comparação:** A IA deve ser capaz de criar cenários comparativos, como "Análise de Dungeons do Lobby" versus "Análise de Raids de Mundo (com multiplicadores)", para dar ao jogador a visão mais completa.
`,
  tags: ['tokens', 'farm', 'guia', 'método', 'otimização', 'bônus', 'cálculo', 'eficiente', 'raid', 'dungeon', '3x'],
  imageUrl: 'wiki-13',
};
