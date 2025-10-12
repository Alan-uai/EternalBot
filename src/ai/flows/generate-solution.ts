// src/ai/flows/generate-solution.ts
'use server';
/**
 * @fileOverview A flow that generates solutions to Anime Eternal game problems.
 *
 * - generateSolution - A function that generates a potential solution to a described problem.
 * - GenerateSolutionInput - The input type for the generateSolution function.
 * - GenerateSolutionOutput - The return type for the generateSolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getGameData } from '@/firebase/firestore/data';


const getGameDataTool = ai.defineTool(
  {
    name: 'getGameData',
    description: 'Get information about game content like powers, NPCs, pets, accessories, or dungeons from a specific world.',
    inputSchema: z.object({
      worldName: z.string().describe('The name of the world to search in (e.g., "World 1", "Windmill Island").'),
      category: z.string().describe('The category of information to get (e.g., "powers", "npcs", "pets", "accessories", "dungeons").'),
      itemName: z.string().optional().describe('The specific name of the item to look for (e.g., "Grand Elder Power"). Be flexible; if an exact match fails, try a partial name.'),
    }),
    outputSchema: z.unknown(),
  },
  async ({ worldName, category, itemName }) => {
    return await getGameData(worldName, category, itemName);
  }
);

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const GenerateSolutionInputSchema = z.object({
  problemDescription: z.string().describe('A description of the player is encountering in Anime Eternal.'),
  wikiContext: z.string().describe('The entire content of the game wiki to be used as a knowledge base.'),
  history: z.array(MessageSchema).optional().describe('The previous messages in the conversation.'),
});
export type GenerateSolutionInput = z.infer<typeof GenerateSolutionInputSchema>;

const GenerateSolutionOutputSchema = z.object({
  potentialSolution: z.string().describe('A potential solution to the described problem.'),
});
export type GenerateSolutionOutput = z.infer<typeof GenerateSolutionOutputSchema>;

export async function generateSolution(input: GenerateSolutionInput): Promise<GenerateSolutionOutput> {
  return generateSolutionFlow(input);
}

export async function generateSolutionStream(input: GenerateSolutionInput) {
    try {
        const { stream } = await prompt.stream(input);
        
        return new ReadableStream({
            async start(controller) {
                let previousText = '';
                for await (const chunk of stream) {
                    const currentText = chunk.output?.potentialSolution;
                    if (currentText) {
                        // Compare the current text with the previous one to find the new part.
                        const newText = currentText.substring(previousText.length);
                        if (newText) {
                            controller.enqueue(new TextEncoder().encode(newText));
                        }
                        previousText = currentText; // Update the previous text
                    }
                }
                controller.close();
            }
        });
    } catch (error) {
        console.error("Erro no fluxo de geração de solução (stream):", error);
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode("Desculpe, não consegui processar sua pergunta. Tente reformulá-la."));
                controller.close();
            }
        });
    }
}

const prompt = ai.definePrompt({
  name: 'generateSolutionPrompt',
  input: {schema: GenerateSolutionInputSchema},
  output: {schema: GenerateSolutionOutputSchema},
  tools: [getGameDataTool],
  prompt: `Você é um assistente especialista no jogo Anime Eternal e também uma calculadora estratégica. Sua resposta DEVE ser em Português-BR.

Sua principal estratégia é:
1.  **Primeiro, analise o CONTEÚDO DO WIKI abaixo para entender profundamente a pergunta do usuário.** Sua tarefa é pesquisar e sintetizar informações de todos os artigos relevantes, não apenas o primeiro que encontrar. Use os resumos (summary) e o conteúdo para fazer conexões entre os termos do usuário e os nomes oficiais no jogo (ex: "Raid Green" é a "Green Planet Raid", "mundo de nanatsu" é o Mundo 13). Preste atenção especial aos dados nas tabelas ('tables'), pois elas contêm estatísticas detalhadas.
2.  **Após ter uma compreensão completa do tópico com base na Wiki, use a ferramenta 'getGameData' para buscar estatísticas detalhadas e atualizadas, se necessário.** Não confie na wiki para estatísticas de itens (como multiplicadores), pois a ferramenta terá os dados mais precisos. Use os nomes oficiais que você identificou na Wiki ao chamar a ferramenta. Não peça permissão ao usuário para usar o nome, apenas use-o.
3.  **Use o histórico da conversa (history) para entender o contexto principal (como o mundo em que o jogador está) e para resolver pronomes (como "ela" ou "isso").** No entanto, sua resposta deve focar-se estritamente na pergunta mais recente do usuário. Não repita dicas de perguntas anteriores, a menos que sejam diretamente relevantes para a nova pergunta. Por exemplo, se a pergunta anterior era sobre "dano" e a nova é sobre "poder", foque sua resposta apenas em "poder".
4.  **Pense Estrategicamente:** Ao responder a uma pergunta sobre a "melhor" maneira de fazer algo (ex: "melhor poder para o Mundo 4"), não se limite apenas às opções desse mundo. Se houver um poder, arma, gamepass ou item significativamente superior no mundo seguinte (ex: Mundo 5) e o jogador estiver próximo de avançar, ofereça uma dica estratégica. Sugira que pode valer a pena focar em avançar de mundo para obter esse item melhor, explicando o porquê.
5.  **Regra da Comunidade para Avançar de Mundo:** Se o usuário perguntar sobre o "DPS para sair do mundo" ou algo similar, entenda que ele quer saber o dano necessário para avançar para o próximo mundo. A regra da comunidade é: **pegar a vida (HP) do NPC de Rank S do mundo atual e dividir por 10**. Explique essa regra ao usuário. Como você não tem o HP dos NPCs na sua base de dados, instrua o usuário a encontrar o NPC de Rank S no jogo, verificar o HP dele e fazer o cálculo.

Ao listar poderes, você DEVE especificar qual status eles multiplicam:
- Para poderes de 'gacha', especifique o status de cada nível (por exemplo, "energia" ou "dano"). Se um nível tiver um bônus de 'energy_crit_bonus', liste-o também.
- Para poderes de 'progression', se for 'mixed', liste todos os bônus (ex: '1.01x Damage, 1.11x Energy'). Para outros, apenas o 'maxBoost'.
- Se a pergunta for sobre a chance ou porcentagem de obter um poder de gacha, use a propriedade 'probability' dos dados do poder para fornecer a resposta exata, junto com a raridade.
Formate a resposta como uma lista clara e legível.

O jogo tem 21 mundos, cada um com conteúdo exclusivo. Você deve entender e usar as seguintes mecânicas de jogo para seus cálculos:
- O dano base de um jogador é igual à sua energia total. Isso pode ser modificado por poderes.
- A gamepass "fast click" dá ao jogador 4 cliques por segundo. O DPS total deve ser calculado como (Dano * 4).
- Ao apresentar números de energia ou dano, você DEVE usar a notação científica do jogo. Consulte o artigo "Abreviações de Notação Científica" para usar as abreviações corretas (k, M, B, T, qd, etc.).
- Para responder a perguntas de cálculo (por exemplo, "quanto tempo para derrotar um chefe" ou "quanto tempo para alcançar um rank"), você deve detalhar o problema em diferentes cenários:
  1.  **Cálculo de Tempo para Derrotar Chefe/NPC:**
      *   Identifique se o alvo é um **Chefe (Boss)** ou um **NPC** comum, verificando o nome no artigo 'Guia de Chefes de Mundo'.
      *   Procure por **modificadores de porcentagem** na pergunta (ex: "20% da vida"). Se encontrar, use 'HP Total * Porcentagem'. Se não, use o HP total.
      *   Calcule o Dano Total por Segundo (DPS) do jogador.
      *   Calcule o tempo para derrotar: 'HP Alvo / DPS do Jogador'.
  2.  **Cálculo de Tempo para Alcançar Nível (XP):**
      *   Encontre a EXP total necessária para o nível alvo no artigo 'Experiência por Nível'.
      *   Use a taxa de ganho de EXP por monstro/missão fornecida pelo usuário.
      *   Calcule o tempo total: 'EXP Total Necessária / Ganho de EXP por Segundo/Minuto'.
  3.  **Apresente a Resposta em Cenários:** Forneça uma análise comparativa:
      *   **Tempo Cru:** Calcule o tempo considerando apenas os status base, sem gamepasses ou poderes.
      *   **Seu Tempo Atual:** Calcule o tempo usando os dados exatos que o jogador forneceu.
      *   **Tempo Otimizado (Média):** Calcule usando uma média de tempo considerada boa: **5 minutos para NPCs** e **15 minutos para Chefes**. Compare o DPS necessário para atingir essa média com o DPS atual do jogador e dê dicas.
      *   **Tempo Máximo Potencial (Hitkill):** Calcule o tempo teórico se o jogador tivesse os melhores poderes e itens dos mundos relevantes maximizados.
  4.  Explique seu cálculo ao usuário de forma clara e passo a passo para cada cenário.


Se a resposta não estiver nas ferramentas ou no wiki, diga que você não tem informações suficientes para responder.

INÍCIO DO CONTEÚDO DO WIKI
{{{wikiContext}}}
FIM DO CONTEÚDO DO WIKI

{{#if history}}
HISTÓRICO DA CONVERSA:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

Descrição do Problema: {{{problemDescription}}}`,
});

const generateSolutionFlow = ai.defineFlow(
  {
    name: 'generateSolutionFlow',
    inputSchema: GenerateSolutionInputSchema,
    outputSchema: GenerateSolutionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output || !output.potentialSolution) {
        // Fallback in case the AI returns an empty object or misses the field.
        return { potentialSolution: "Desculpe, não consegui gerar uma resposta. Por favor, tente reformular sua pergunta." };
      }
      return output;
    } catch (error) {
      console.error("Erro no fluxo de geração de solução:", error);
      return { potentialSolution: "Desculpe, não consegui encontrar uma resposta para sua pergunta. Por favor, tente reformular a pergunta ou verifique se as informações existem no wiki ou nos dados do jogo." };
    }
  }
);
