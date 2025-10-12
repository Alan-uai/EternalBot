import { Client, GatewayIntentBits, Message } from 'discord.js';
import 'dotenv/config';
import { generateSolutionStream } from '@/ai/flows/generate-solution';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log('EternalBot is online!');
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  // Check if the bot was mentioned
  if (message.mentions.has(client.user.id)) {
    // Extract the question by removing the bot mention
    const problemDescription = message.content.replace(/<@!?(\d+)>/g, '').trim();

    if (!problemDescription) {
      message.reply('Por favor, me faça uma pergunta para que eu possa ajudar.');
      return;
    }

    try {
      // Call the generateSolutionStream flow.
      // The flow now gets its context from the pre-compiled knowledge base.
      const stream = await generateSolutionStream({
        problemDescription,
        history: [], // History can be implemented later
      });

      let fullResponse = '';
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      // Stream the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      // Send the final response. Discord has a 2000 character limit.
      if (fullResponse) {
        // Split the message if it's too long
        const chunks = fullResponse.match(/[\s\S]{1,2000}/g) || [];
        for (const chunk of chunks) {
            await message.reply(chunk);
        }
      } else {
        message.reply('Não consegui encontrar uma solução para o seu problema.');
      }

    } catch (error) {
      console.error('Error calling generateSolutionStream:', error);
      message.reply('Ocorreu um erro ao tentar encontrar uma solução. Por favor, tente novamente mais tarde.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
