'use server';
/**
 * @fileOverview Um fluxo que identifica poderes do jogo a partir de um screenshot.
 *
 * - identifyPowersFromImage - A função principal que lida com a identificação.
 * - IdentifyPowersInput - O tipo de entrada para a função.
 * - IdentifyPowersOutput - O tipo de retorno para a função.
 * - IdentifiedPower - O tipo para um único poder identificado.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { world1Data } from '@/lib/world-1-data';
import { world2Data } from '@/lib/world-2-data';
import { world3Data } from '@/lib/world-3-data';
import { world4Data } from '@/lib/world-4-data';
import { world20Data } from '@/lib/world-20-data';

const allWorldsData = [world1Data, world2Data, world3Data, world4Data, world20Data];

// Gera um contexto de string com todos os poderes conhecidos para a IA.
const powerKnowledgeContext = allWorldsData.map(world => 
    `Mundo: ${world.name}\nPoderes:\n${(world.powers || []).map(power => {
        const statsString = (power.stats && Array.isArray(power.stats))
            ? `\n  Status:\n${power.stats.map(stat => 
                `  - ${stat.name} (Raridade: ${stat.rarity})`
              ).join('\n')}`
            : '';
        return `- Nome: ${power.name}${statsString}`;
    }).join('\n')}`
).join('\n\n');

const IdentifiedPowerSchema = z.object({
  name: z.string().describe('O nome exato do poder identificado na imagem.'),
  rarity: z.string().describe('A raridade do poder, inferida pela cor da borda ou pelo nome (ex: "Phantom", "Supreme").'),
  world: z.string().describe('O mundo de origem deste poder.'),
});
export type IdentifiedPower = z.infer<typeof IdentifiedPowerSchema>;

const IdentifyPowersInputSchema = z.object({
  images: z.array(z.string()).describe("Uma lista de screenshots da tela de poderes, como data URIs."),
});
export type IdentifyPowersInput = z.infer<typeof IdentifyPowersInputSchema>;

const IdentifyPowersOutputSchema = z.object({
  powers: z.array(IdentifiedPowerSchema).describe('Uma lista de todos os poderes únicos identificados nas imagens.'),
});
export type IdentifyPowersOutput = z.infer<typeof IdentifyPowersOutputSchema>;


export async function identifyPowersFromImage(input: IdentifyPowersInput): Promise<IdentifyPowersOutput> {
  return identifyPowersFlow(input);
}


const prompt = ai.definePrompt({
  name: 'identifyPowersPrompt',
  input: { schema: IdentifyPowersInputSchema },
  output: { schema: IdentifyPowersOutputSchema },
  prompt: `Você é um especialista em análise de imagem para o jogo Anime Eternal. Sua tarefa é analisar um ou mais screenshots da tela de "Poderes" do jogador e identificar cada poder, sua raridade e de qual mundo ele vem.

**MANUAL TÉCNICO DE IDENTIFICAÇÃO DE RARIDADE:**

Analise a composição de cores da borda de cada poder. Ignore a posição exata dos brilhos, pois eles giram, mas preste atenção na combinação de cores.

*   **Supreme:** Borda com um gradiente de arco-íris (várias cores como laranja, rosa, amarelo, azul).
*   **Phantom:** Borda com base roxa escura e um brilho fúcsia/magenta vibrante.
*   **Mythic:** Borda com base vermelha e um brilho laranja/vermelho claro.
*   **Legendary:** Borda com base amarela/dourada e um brilho branco/amarelo claro.
*   **Epic:** Borda com base magenta/lilás e um brilho rosa claro.
*   **Rare:** Borda com base ciano/azul claro e um brilho azul mais claro.
*   **Uncommon:** Borda com base verde-limão e um brilho verde mais claro.
*   **Common:** Borda cinza com uma textura pontilhada.

**PROCESSO:**

1.  Para cada poder na imagem, identifique o nome do poder.
2.  Analise a borda e compare sua composição de cores com o **MANUAL TÉCNICO** acima para determinar a raridade.
3.  Use o **CONHECIMENTO DE PODERES** abaixo para encontrar a qual mundo cada poder pertence. Se um poder não estiver na lista de conhecimento, marque o mundo como "Desconhecido".
4.  Retorne uma lista JSON de objetos, onde cada objeto representa um poder identificado. Não inclua duplicatas na lista final.

---
INÍCIO DO CONHECIMENTO DE PODERES
${powerKnowledgeContext}
---
FIM DO CONHECIMENTO DE PODERES

Agora, analise as seguintes imagens:
{{#each images}}
{{media url=this}}
{{/each}}
`,
});


const identifyPowersFlow = ai.defineFlow(
  {
    name: 'identifyPowersFlow',
    inputSchema: IdentifyPowersInputSchema,
    outputSchema: IdentifyPowersOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output || !output.powers) {
        return { powers: [] };
      }
      // Simples filtro de duplicatas para garantir
      const uniquePowers = output.powers.filter(
        (power, index, self) => index === self.findIndex((p) => p.name === power.name)
      );
      return { powers: uniquePowers };
    } catch (error) {
      console.error("Erro no fluxo de identificação de poderes:", error);
      return { powers: [] };
    }
  }
);
