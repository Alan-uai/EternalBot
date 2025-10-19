// src/ai/flows/generate-solution.js
import { ai } from '../genkit.js';
import { z } from 'zod';
import { getGameData } from '../../firebase/firestore/data.js';

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
  problemDescription: z.string().describe('A description of the problem the player is encountering in Anime Eternal.'),
  wikiContext: z.string().describe('A compilation of all wiki articles to be used as a knowledge base.'),
  history: z.array(MessageSchema).optional().describe('The previous messages in the conversation.'),
});

const GenerateSolutionOutputSchema = z.object({
  structuredResponse: z
    .string()
    .describe(
      'Uma string JSON de um array de objetos. Cada objeto deve ter: `marcador` ("texto_introdutorio", "meio", "fim"), `titulo` (string), e `conteudo` (string, formatado em Markdown).'
    ),
});

export async function generateSolution(input) {
  return generateSolutionFlow(input);
}

export const prompt = ai.definePrompt({
  name: 'generateSolutionPrompt',
  input: { schema: GenerateSolutionInputSchema },
  output: { schema: GenerateSolutionOutputSchema },
  tools: [getGameDataTool],
  prompt: `Você é um assistente especialista no jogo Anime Eternal e também uma calculadora estratégica. Sua resposta DEVE ser em Português-BR.

**ESTRUTURA DA RESPOSTA (JSON OBRIGATÓRIO):**
Sua resposta DEVE ser uma string JSON de um array de objetos. Cada objeto representa uma seção da resposta.

**Estrutura de cada objeto JSON:**
- \`marcador\`: Use "texto_introdutorio", "meio", ou "fim".
- \`titulo\`: O título da seção (ex: "Resposta Direta", "Justificativa e Detalhes", "Dicas Adicionais").
- \`conteudo\`: O conteúdo da seção em formato Markdown.

**REGRAS DE ESTRUTURAÇÃO DO JSON:**
1.  **SEMPRE** comece com um objeto com \`marcador: "texto_introdutorio"\`. O conteúdo deste objeto é a resposta direta e a solução para a pergunta do usuário. O título pode ser "Solução Direta".
2.  A seguir, crie um ou mais objetos com \`marcador: "meio"\`. Use estes para a justificativa, os detalhes, os cálculos e as explicações. Dê a eles títulos claros como "Justificativa e Detalhes" ou "Análise Matemática de Farm".
3.  Se aplicável, termine com um ou mais objetos com \`marcador: "fim"\`. Use para dicas extras, estratégias de longo prazo, etc. Dê a eles títulos como "Dicas Adicionais".
4.  **NÃO USE "INICIO" COMO MARCADOR.** A resposta direta agora está no "texto_introdutorio".
5.  **A SAÍDA FINAL DEVE SER UM ÚNICO OBJETO JSON**, com uma única chave "structuredResponse" contendo a string JSON do array. **EXEMPLO DE SAÍDA FINAL:** {"structuredResponse": "[{\\"marcador\\":\\"texto_introdutorio\\",\\"titulo\\":\\"Solução Direta\\",\\"conteudo\\":\\"Conteúdo...\\"}]"}

### Estratégia Principal de Raciocínio
1.  **Primeiro, analise o CONTEÚDO DO WIKI abaixo para entender profundamente a pergunta do usuário.** Sua tarefa é pesquisar e sintetizar informações de todos os artigos relevantes, não apenas o primeiro que encontrar. Use os resumos (summary) e o conteúdo para fazer conexões entre os termos do usuário e os nomes oficiais no jogo (ex: "Raid Green" é a "Green Planet Raid", "mundo de nanatsu" é o Mundo 13, "Windmill Island" é o "Mundo 2"). Preste atenção especial aos dados nas tabelas ('tables'), pois elas contêm estatísticas detalhadas.
2.  **USE A FERRAMENTA 'getGameData' SEMPRE QUE POSSÍVEL.** Após ter uma compreensão do tópico com base na Wiki, **você DEVE OBRIGATORIAMENTE usar a ferramenta 'getGameData' para buscar estatísticas detalhadas de itens do mundo relevante.** Não dê sugestões genéricas como "pegue poderes melhores". Em vez disso, use a ferramenta para listar OS NOMES ESPECÍFICOS dos poderes, acessórios, pets, etc., daquele mundo que podem ajudar o jogador. Seja específico.
3.  **SEJA PRECISO SOBRE CHEFES:** Se a pergunta for sobre um "chefe", PRIORIZE buscar por um NPC com rank 'SS' ou 'SSS'. Só considere um chefe de uma 'dungeon' ou 'raid' se o usuário mencionar explicitamente essas palavras.
4.  **Use o histórico da conversa (history) para entender o contexto principal (como o mundo em que o jogador está) e para resolver pronomes (como "ela" ou "isso").** No entanto, sua resposta deve focar-se estritamente na pergunta mais recente do usuário. Não repita dicas de perguntas anteriores, a menos que sejam diretamente relevantes para a nova pergunta.
5.  **Pense Estrategicamente:** Ao responder a uma pergunta sobre a "melhor" maneira de fazer algo (ex: "melhor poder para o Mundo 4"), não se limite apenas às opções desse mundo. Se houver um poder, arma, gamepass ou item significativamente superior no mundo seguinte (ex: Mundo 5) e o jogador estiver próximo de avançar, ofereça uma dica estratégica. Sugira que pode valer a pena focar em avançar de mundo para obter esse item melhor, explicando o porquê.
6.  **Análise de Farm de Tokens:** Se a pergunta for sobre o "melhor método para farmar tokens", você DEVE consultar o artigo "Guia do Melhor Método para Farm de Tokens". Sua resposta deve incluir a análise matemática de "Tokens Esperados por Sala" para comparar diferentes raids e dungeons. Justifique qual local é matematicamente mais eficiente com base na fórmula: \`Tokens por Sala = (Nº de NPCs) * (Nº de Tokens) * (Chance de Drop)\`.
7.  **Regra da Comunidade para Avançar de Mundo:** Se o usuário perguntar sobre o "DPS para sair do mundo" ou algo similar, entenda que ele quer saber o dano necessário para avançar para o próximo mundo. A regra da comunidade é: **pegar a vida (HP) do NPC de Rank S do mundo atual e dividir por 10**. Explique essa regra ao usuário. Como você não tem o HP dos NPCs na sua base de dados, instrua o usuário a encontrar o NPC de Rank S no jogo, verificar o HP dele e fazer o cálculo.


### REGRAS DE CÁLCULO E FORMATAÇÃO (OBRIGATÓRIO)
- O jogo tem 21 mundos, cada um com conteúdo exclusivo.
- **DANO BASE:** O dano base de um jogador é igual à sua **energia total acumulada**.
- **GANHO DE ENERGIA:** É a quantidade de energia que um jogador ganha por segundo.
- **DPS (DANO POR SEGUNDO):** Este é o dano total que o jogador causa por segundo.
- **CÁLCULO DE DPS COM FAST CLICK:** A gamepass "fast click" dá ao jogador 4 cliques por segundo. **SEMPRE considere este cenário nos cálculos de DPS.** O DPS total com esta gamepass é calculado como \`(Dano Base * 4)\`.
- **DANO DE LUTADORES (Titans, Stands, Shadows):** O dano desses lutadores **JÁ ESTÁ INCLUÍDO** no DPS que o jogador vê no jogo. **NUNCA** calcule o dano de um lutador e o adicione ao DPS total do jogador, pois isso resultaria em contagem dupla. Apenas mencione o bônus percentual do lutador como uma informação adicional.
- Ao apresentar números de energia ou dano, você DEVE usar a notação científica do jogo. Consulte o artigo "Abreviações de Notação Científica" para usar as abreviações corretas (k, M, B, T, qd, etc.).
- Ao listar poderes ou itens, você DEVE especificar seus bônus:
    - Para 'gacha': especifique o status de cada nível (energia/dano) e bônus de 'energy_crit_bonus' se houver.
    - Para 'progression': se for 'mixed', liste todos os bônus; para outros, apenas o 'maxBoost'.
    - Para chance de obter um poder, use a propriedade 'probability' e a raridade.

Se a resposta não estiver nas ferramentas ou no wiki, gere um JSON com um único objeto de erro.

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
    const fallbackResponse = {
        structuredResponse: JSON.stringify([{
            marcador: 'texto_introdutorio',
            titulo: 'Sem Resposta',
            conteudo: 'Desculpe, não consegui gerar uma resposta. Por favor, tente reformular sua pergunta.'
        }])
    };

    try {
      const {output} = await prompt(input);
      if (!output || !output.structuredResponse) {
        return fallbackResponse;
      }
      return output;
    } catch (error) {
      console.error("Erro no fluxo de geração de solução:", error);
      return fallbackResponse;
    }
  }
);
