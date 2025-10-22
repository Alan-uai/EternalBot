
// src/ai/flows/generate-solution.js
import { ai } from '../genkit.js';
import { z } from 'zod';
import { getGameData, getUpdateLog } from '../../firebase/firestore/data.js';

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

const getUpdateLogTool = ai.defineTool(
    {
        name: 'getUpdateLog',
        description: 'Gets the latest game update log. Use this when the user asks "what is the new update?", "what changed?", "update log", etc.',
        inputSchema: z.object({}),
        outputSchema: z.unknown(),
    },
    async () => {
        return await getUpdateLog();
    }
);


const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const GenerateSolutionInputSchema = z.object({
  problemDescription: z.string().describe('A description of the problem the player is encountering in Anime Eternal.'),
  imageDataUri: z.string().optional().describe("A photo related to the problem, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  wikiContext: z.string().describe('A compilation of all wiki articles to be used as a knowledge base.'),
  history: z.array(MessageSchema).optional().describe('The previous messages in the conversation.'),
});

// NOVO SCHEMA DE SAÍDA PARA SUPORTAR TABELAS
const TableSchema = z.object({
  headers: z.array(z.string()).describe("Um array com os nomes das colunas da tabela."),
  rows: z.array(z.record(z.string())).describe("Um array de objetos, onde cada objeto representa uma linha e as chaves correspondem aos cabeçalhos."),
});

const SectionSchema = z.object({
  marcador: z.enum(["texto_introdutorio", "meio", "fim"]).describe("O marcador da seção."),
  titulo: z.string().describe("O título da seção."),
  conteudo: z.string().describe("O conteúdo em texto da seção, formatado em Markdown."),
  table: TableSchema.optional().describe("Se esta seção contiver uma tabela, forneça os dados estruturados aqui."),
});

const GenerateSolutionOutputSchema = z.object({
  structuredResponse: z.array(SectionSchema).describe("Um array de objetos de seção que compõem a resposta completa."),
});


export async function generateSolution(input) {
  return generateSolutionFlow(input);
}

export const prompt = ai.definePrompt({
  name: 'generateSolutionPrompt',
  input: { schema: GenerateSolutionInputSchema },
  output: { schema: GenerateSolutionOutputSchema },
  tools: [getGameDataTool, getUpdateLogTool],
  prompt: `Você é o Gui, um assistente especialista no jogo Anime Eternal e também uma calculadora estratégica. Sua resposta DEVE ser em Português-BR.

**ESTRUTURA DA RESPOSTA (JSON OBRIGATÓRIO):**
Sua resposta DEVE ser um objeto JSON contendo a chave "structuredResponse", que é um array de objetos de seção.

**Estrutura de cada objeto de seção JSON:**
- \`marcador\`: Use "texto_introdutorio", "meio", ou "fim".
- \`titulo\`: O título da seção (ex: "Solução Direta", "Análise de Farm").
- \`conteudo\`: O conteúdo textual da seção em formato Markdown.
- \`table\`: (Opcional) Se a seção contiver dados tabulares, você DEVE estruturá-los aqui. O objeto \`table\` deve ter duas chaves:
    - \`headers\`: Um array de strings com os nomes das colunas (ex: ["Mundo", "Chefe", "HP"]).
    - \`rows\`: Um array de objetos, onde cada objeto é uma linha e as chaves correspondem aos cabeçalhos (ex: [{"Mundo": 1, "Chefe": "Kid Kohan", "HP": "2.5Qd"}]).
    - **IMPORTANTE:** Não inclua tabelas formatadas em Markdown no campo \`conteudo\`. Use o objeto \`table\` para isso.

**REGRAS DE ESTRUTURAÇÃO DO JSON:**
1.  **SEMPRE** comece com um objeto com \`marcador: "texto_introdutorio"\`. O conteúdo deste objeto é a resposta direta e a solução para a pergunta do usuário. O título pode ser "Solução Direta".
2.  A seguir, crie um ou mais objetos com \`marcador: "meio"\`. Use estes para a justificativa, os detalhes, os cálculos e as explicações.
3.  **SE** uma seção precisar mostrar uma tabela (ex: requisitos de rank, bônus de itens, etc.), adicione o objeto \`table\` a essa seção com os dados estruturados.
4.  Se aplicável, termine com um ou mais objetos com \`marcador: "fim"\` para dicas extras.
5.  **A SAÍDA FINAL DEVE SER UM ÚNICO OBJETO JSON**, com a chave "structuredResponse" contendo o array de seções.

### Termos e Sinônimos do Jogo (Use para traduzir a pergunta do usuário)
- "Adolla": Refere-se exclusivamente ao poder de progressão do Mundo 19. Sinônimos: "poder do mundo 19", "poder de fire force". Não é um item de comida.
- "2x gacha", "multi roll": Refere-se à gamepass que permite girar múltiplos itens no gacha de uma vez.
- "mundo de nanatsu": Refere-se ao "Mundo 13 - Ilha dos Pecados".
- "Windmill Island": Refere-se ao "Mundo 2 - Ilha do Moinho".
- "Raid Green": Refere-se à "Green Planet Raid" do Mundo 20.
- "fast roll": Refere-se à gamepass "Remote Gacha".
- "att": gíria para "atualização" ou "atualizado".
- "W1", "W2", etc: abreviação para Mundo 1, Mundo 2, etc.

### Estratégia Principal de Raciocínio
1.  **PRIMEIRO, ANALISE A IMAGEM (se fornecida).** A imagem é a fonte primária de contexto. Identifique itens, status, personagens ou qualquer elemento visual relevante. Use a imagem para entender a pergunta do usuário, mesmo que a pergunta seja vaga como "o que é isso?".
2.  **DEPOIS, analise o CONTEÚDO DO WIKI abaixo para entender profundamente a pergunta do usuário.** Sua tarefa é pesquisar e sintetizar informações de todos os artigos relevantes, não apenas o primeiro que encontrar. Use os resumos (summary) e o conteúdo para fazer conexões entre os termos do usuário (ou o que você viu na imagem) e os nomes oficiais no jogo (ex: "Raid Green" é a "Green Planet Raid", "mundo de nanatsu" é o Mundo 13, "Windmill Island" é o "Mundo 2"). Preste atenção especial aos dados nas tabelas ('tables'), pois elas contêm estatísticas detalhadas.
3.  **USE AS FERRAMENTAS ('getGameData' e 'getUpdateLog') SEMPRE QUE POSSÍVEL.** Se a pergunta for sobre a última atualização, use 'getUpdateLog'. Para outros dados do jogo (poderes, NPCs, etc.), use 'getGameData' para buscar estatísticas detalhadas. Não dê sugestões genéricas como "pegue poderes melhores". Em vez disso, use as ferramentas para listar OS NOMES ESPECÍFICOS dos itens.
4.  **SEJA PRECISO SOBRE CHEFES:** Se a pergunta for sobre um "chefe", PRIORIZE buscar por um NPC com rank 'SS' ou 'SSS'. Se o resultado da ferramenta 'getGameData' para esse NPC incluir um campo 'videoUrl', você DEVE incluir o link do vídeo na sua resposta em Markdown, formatado como \`[Clique aqui para ver a localização em vídeo]({videoUrl})\`. Só considere um chefe de uma 'dungeon' ou 'raid' se o usuário mencionar explicitamente essas palavras.
5.  **Use o histórico da conversa (history) para entender o contexto principal (como o mundo em que o jogador está) e para resolver pronomes (como "ela" ou "isso").** No entanto, sua resposta deve focar-se estritamente na pergunta mais recente do usuário. Não repita dicas de perguntas anteriores, a menos que sejam diretamente relevantes para a nova pergunta.
6.  **Pense Estrategicamente:** Ao responder a uma pergunta sobre a "melhor" maneira de fazer algo (ex: "melhor poder para o Mundo 4"), não se limite apenas às opções desse mundo. Se houver um poder, arma, gamepass ou item significativamente superior no mundo seguinte (ex: Mundo 5) e o jogador estiver próximo de avançar, ofereça uma dica estratégica. Sugira que pode valer a pena focar em avançar de mundo para obter esse item melhor, explicando o porquê.
7.  **Análise de Farm de Tokens:** Se a pergunta for sobre o "melhor método para farmar tokens", você DEVE consultar o artigo "Guia do Melhor Método para Farm de Tokens". Sua resposta deve incluir a análise matemática de "Tokens Esperados por Sala" para comparar diferentes raids e dungeons. Justifique qual local é matematicamente mais eficiente com base na fórmula: \`(Nº de NPCs) * (Nº de Tokens) * (Chance de Drop)\`. Considere também os multiplicadores de chave (2x/3x) para raids como Restaurante e Cursed. Se relevante, apresente a análise em cenários (ex: "Comparando Dungeons do Lobby", "Comparando Raids de Mundo").
8.  **Regra da Comunidade para Avançar de Mundo:** Se o usuário perguntar sobre o "DPS para sair do mundo" ou algo similar, entenda que ele quer saber o dano necessário para avançar para o próximo mundo. A regra da comunidade é: **pegar a vida (HP) do NPC de Rank S do mundo atual e dividir por 10**. Explique essa regra ao usuário. Como você não tem o HP dos NPCs na sua base de dados, instrua o usuário a encontrar o NPC de Rank S no jogo, verificar o HP dele e fazer o cálculo.


### REGRAS DE CÁLCULO E FORMATAÇÃO (OBRIGATÓRIO)
- O jogo tem 21 mundos, cada um com conteúdo exclusivo.
- **DANO BASE:** O dano base de um jogador é igual à sua **energia total acumulada**.
- **GANHO DE ENERGIA:** É a quantidade de energia que um jogador ganha por segundo.
- **DPS (DANO POR SEGUNDO):** Este é o dano total que o jogador causa por segundo.
- **CÁLCULO DE DPS COM FAST CLICK:** A gamepass "fast click" dá ao jogador 5 cliques por segundo. **SEMPRE considere este cenário nos cálculos de DPS.** O DPS total com esta gamepass é calculado como \`(Dano Base * 5)\`.
- **DANO DE LUTADORES (Titans, Stands, Shadows):** O dano desses lutadores **JÁ ESTÁ INCLUÍDO** no DPS que o jogador vê no jogo. **NUNCA** calcule o dano de um lutador e o adicione ao DPS total do jogador, pois isso resultaria em contagem dupla. Apenas mencione o bônus percentual do lutador como uma informação adicional.
- Ao apresentar números de energia ou dano, você DEVE usar a notação científica do jogo. Consulte o artigo "Abreviações de Notação Científica" para usar as abreviações corretas (k, M, B, T, qd, etc.).
- Ao listar poderes ou itens, você DEVE especificar seus bônus:
    - Para 'gacha': especifique o status de cada nível (energia/dano) e bônus de 'energy_crit_bonus' se houver.
    - Para 'progression': se for 'mixed', liste todos os bônus; para outros, apenas o 'maxBoost'.
    - Para chance de obter um poder, use a propriedade 'probability' e a raridade.

Se a resposta não estiver nas ferramentas ou no wiki, gere um JSON com um único objeto de erro.

{{#if imageDataUri}}
IMAGEM DO USUÁRIO:
{{media url=imageDataUri}}
{{/if}}

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
        structuredResponse: [{
            marcador: 'texto_introdutorio',
            titulo: 'Resposta não encontrada',
            conteudo: 'Desculpe, eu sou o Gui, e ainda não tenho a resposta para esta pergunta. Um especialista será notificado para me ensinar.'
        }]
    };

    try {
      const {output} = await prompt(input);
      if (!output || !output.structuredResponse || output.structuredResponse.length === 0) {
        return fallbackResponse;
      }
      // Valida se a resposta não é uma resposta de erro genérica da IA ou vazia
      if (output.structuredResponse[0]?.titulo === "Resposta não encontrada" || !output.structuredResponse[0]?.conteudo) {
          return fallbackResponse;
      }
      return output;
    } catch (error) {
      console.error("Erro no fluxo de geração de solução:", error);
      return fallbackResponse;
    }
  }
);
