// src/ai/flows/generate-birthday-wish.js
import { ai } from '../genkit.js';
import { z } from 'zod';

const GenerateWishInputSchema = z.object({
  userName: z.string().describe('O nome do usuário que está fazendo aniversário.'),
});

const GenerateWishOutputSchema = z.object({
  message: z.string().describe('Uma mensagem de aniversário curta, inspiradora e motivacional em Português-BR. A mensagem deve ser única e criativa.'),
});

export async function generateBirthdayWish(input) {
  return generateBirthdayWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBirthdayWishPrompt',
  input: { schema: GenerateWishInputSchema },
  output: { schema: GenerateWishOutputSchema },
  prompt: `Você é um gerador de mensagens de feliz aniversário. Crie uma mensagem curta, inspiradora e motivacional para o usuário chamado {{{userName}}}. A mensagem deve ser em Português-BR e soar genuína e positiva. Evite clichês e seja criativo. A mensagem não deve ser maior que 2-3 frases.`,
});

const generateBirthdayWishFlow = ai.defineFlow(
  {
    name: 'generateBirthdayWishFlow',
    inputSchema: GenerateWishInputSchema,
    outputSchema: GenerateWishOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);
