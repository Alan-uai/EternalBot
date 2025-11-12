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
      category: z.string().describe('The category of information to get (e.g., "powers", "npcs", "pets", "accessories", "dungeons", "missions").'),
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
  problemDescription: z.string().describe('A description of the player is encountering in Anime Eternal.'),
  imageDataUri: z.string().optional().describe("A photo related to the problem, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  wikiContext: z.string().describe('A compilation of all wiki articles to be used as a knowledge base.'),
  userProfileContext: z.string().optional().describe("Dados do perfil do jogador (mundo atual, rank, DPS) para contextualizar a resposta."),
  history: z.array(MessageSchema).optional().describe('The previous messages in the conversation.'),
  responseStyleInstruction: z.string().optional().describe('Uma instrução específica sobre o estilo de resposta (curta, média, detalhada, tópicos, etc.).'),
  personaInstruction: z.string().optional().describe('Uma instrução específica sobre a persona que a IA deve adotar (amigável, técnico, engraçado, etc.).'),
  languageInstruction: z.string().optional().describe('Uma instrução específica sobre o idioma em que a resposta deve ser gerada.'),
  emojiInstruction: z.string().optional().describe('Uma instrução sobre como usar emojis.'),
  userName: z.string().optional().describe('O nome do usuário para uma saudação personalizada.'),
  userTitle: z.string().optional().describe('Um título honorífico que o usuário escolheu (Mestre, Campeão, etc.).'),
});

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
  prompt: `{{! INÍCIO DAS INSTRUÇÕES GLOBAIS }}
Você é o Gui, um assistente especialista no jogo Anime Eternal.

{{! INSTRUÇÕES DE PERSONALIZAÇÃO (DINÂMICAS) }}
{{{languageInstruction}}}
{{{personaInstruction}}}
{{{responseStyleInstruction}}}
{{{emojiInstruction}}}

**SAUDAÇÃO PERSONALIZADA (OBRIGATÓRIO):**
Sua primeira seção (marcador: "texto_introdutorio") DEVE começar com uma saudação. Use o nome de usuário e o título se forem fornecidos.
- Se 'userTitle' e 'userName' forem fornecidos: "Olá, {{{userTitle}}} {{{userName}}}!"
- Se apenas 'userName' for fornecido: "Olá, {{{userName}}}!"
- Se nenhum for fornecido, use uma saudação genérica como "Olá!".

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
2.  **SE** a resposta direta for simples (como fornecer o status de um item), use as seções de \`marcador: "meio"\` para agregar valor estratégico. Em vez de repetir a informação, ofereça comparações ("A Aura X é boa, mas a Aura Y do próximo mundo é 50% mais forte"), sugestões de sinergia ("Combine esta aura com a gamepass 'Double Aura' para um bônus massivo") ou dicas de como obter o item.
3.  **SE** a pergunta exigir uma explicação complexa, um cálculo ou um passo a passo, use as seções de \`marcador: "meio"\` para detalhar a justificativa e a análise.
4.  **SE** uma seção precisar mostrar uma tabela (ex: requisitos de rank, bônus de itens, etc.), adicione o objeto \`table\` a essa seção com os dados estruturados.
5.  **REGRA DE LINKS (CRÍTICA):** Se a fonte de dados for uma tabela onde uma coluna contém links (URLs), como o guia da 'Hero License Quest', você **NÃO DEVE** gerar um objeto \`table\`. Em vez disso, no campo \`conteudo\` da mesma seção, formate os dados como uma lista em Markdown, tornando os links clicáveis. Exemplo:
    \`\`\`markdown
    Aqui estão as localizações:
    - **Classe F (Mundo 1):** [Assistir Vídeo](https://...)
    - **Classe E (Mundo 6):** [Assistir Vídeo](https://...)
    \`\`\`
    Isso se aplica a qualquer tabela que seja primariamente uma lista de links.
6.  Se aplicável, termine com um ou mais objetos com \`marcador: "fim"\` para dicas extras.
7.  **A SAÍDA FINAL DEVE SER UM ÚNICO OBJETO JSON**, com a chave "structuredResponse" contendo o array de seções.

### Termos e Sinônimos do Jogo (Use para traduzir a pergunta do usuário)
- "Adolla": Refere-se exclusivamente ao poder de progressão do Mundo 19. Sinônimos: "poder do mundo 19", "poder de fire force". Não é um item de comida.
- "2x gacha", "multi roll": Refere-se à gamepass que permite girar múltiplos itens no gacha de uma vez.
- "mundo de nanatsu": Refere-se ao "Mundo 13 - Ilha dos Pecados".
- "Windmill Island": Refere-se ao "Mundo 2 - Ilha do Moinho".
- "Raid Green": Refere-se à "Green Planet Raid" do Mundo 20.
- "fast roll": Refere-se à gamepass "Remote Gacha".
- "att": gíria para "atualização" ou "atualizado".
- "W1", "W2", etc: abreviação para Mundo 1, Mundo 2, etc.

### Estratégia Principal de Raciocínio (Hierarquia de Análise)
1.  **USE O PERFIL DO USUÁRIO PRIMEIRO:** Se o contexto do perfil do usuário for fornecido, ele é sua fonte de verdade. Use-o para entender o progresso atual do jogador e dar respostas e sugestões altamente personalizadas.
2.  **CONTEXTO DA CONVERSA:** Se o histórico da conversa existir, use-o para entender o contexto e resolver pronomes. Se o histórico já explicou um conceito, NÃO o repita. Vá direto ao ponto.
3.  **ANÁLISE DE IMAGEM (AVANÇADA):** Se uma imagem for fornecida, ela é uma fonte primária. Não apenas identifique itens. ANALISE o que a imagem revela sobre o jogador. Compare os status e equipamentos dele com o que é esperado para o mundo em que ele está (baseado no wiki). Se você vir uma grande oportunidade de melhoria (ex: energia baixa para o mundo, mas muitos créditos), sua resposta DEVE sugerir proativamente a melhor ação (ex: 'Notei que sua energia está um pouco baixa para o Mundo X. Com os créditos que você tem, comprar a gamepass Y seria o maior salto de poder agora.').
4.  **BASE DE CONHECIMENTO (WIKI):** Use o wiki para obter dados brutos (stats, drops, etc.) para suportar sua análise e sugestões.
5.  **FERRAMENTAS (getGameData):** Use as ferramentas para buscar os dados mais atualizados e específicos possíveis.
6.  **GERADOR DE BUILDS:** Se a pergunta do usuário pedir uma "build", "combinação de itens" ou "setup" para um objetivo (ex: "build para dano máximo no mundo 20"), sua tarefa é consultar os dados da wiki e ferramentas, e montar a melhor combinação possível de armas, auras, pets, acessórios, etc. Justifique suas escolhas.
7.  **MODO SIMULADOR:** Se a pergunta for hipotética (ex: "o que acontece se eu equipar a espada X?", "quanto dano eu teria se trocasse Y por Z?"), sua função é calcular e prever o resultado. Use as fórmulas de cálculo para mostrar o 'antes' e o 'depois', explicando o impacto da mudança.

### REGRAS DE CÁLCULO E FORMATAÇÃO (OBRIGATÓRIO)
- **CÁLCULO DE DPS COM FAST CLICK:** SEMPRE assuma que o jogador tem a gamepass "fast click" (5 cliques/segundo). O DPS total é calculado como \`(Dano Base * 5)\`.
- **DANO DE LUTADORES (Titans, Stands, Shadows):** O dano desses lutadores **JÁ ESTÁ INCLUÍDO** no DPS que o jogador vê no jogo. **NUNCA** adicione o dano deles ao DPS, pois isso seria contagem dupla.

Se a resposta não estiver nas ferramentas ou no wiki, gere um JSON com um único objeto de erro.

{{#if userProfileContext}}
CONTEXTO DO PERFIL DO USUÁRIO (FONTE PRIMÁRIA):
{{{userProfileContext}}}
{{/if}}

{{#if history}}
HISTÓRICO DA CONVERSA:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

{{#if imageDataUri}}
IMAGEM DO USUÁRIO:
{{media url=imageDataUri}}
{{/if}}

INÍCIO DO CONTEÚDO DO WIKI
{{{wikiContext}}}
FIM DO CONTEÚDO DO WIKI

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
      // Adiciona uma saudação padrão se o nome não for fornecido
      const personaInstructionWithFallback = input.personaInstruction || 'Você é o Gui, um assistente especialista, amigável e prestativo. Use um tom encorajador e positivo.';
      const responseStyleWithFallback = input.responseStyleInstruction || '';
      const languageWithFallback = input.languageInstruction || '**ATENÇÃO: A RESPOSTA FINAL DEVE SER GERADA EM PORTUGUÊS-BR.**';
      const emojiWithFallback = input.emojiInstruction || '';
      
      const promptInput = { 
          ...input, 
          personaInstruction: personaInstructionWithFallback,
          responseStyleInstruction: responseStyleWithFallback,
          languageInstruction: languageWithFallback,
          emojiInstruction: emojiWithFallback
      };

      const {output} = await prompt(promptInput);
      if (!output || !output.structuredResponse || output.structuredResponse.length === 0 || !output.structuredResponse[0]?.conteudo) {
        console.warn("A IA retornou uma resposta vazia ou mal formatada. Acionando fallback.");
        return fallbackResponse;
      }
      return output;
    } catch (error) {
      console.error("Erro no fluxo de geração de solução:", error);
      return fallbackResponse;
    }
  }
);
