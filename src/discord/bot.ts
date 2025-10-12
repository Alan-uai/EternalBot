
import { Client, GatewayIntentBits, Message } from 'discord.js';
import 'dotenv/config';
import { generateSolution } from '@/ai/flows/generate-solution';
import { initializeFirebaseServer } from '@/firebase/server';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import type { WikiArticle } from '@/lib/types';
import { KNOWLEDGE_BASE_STATIC_CONTEXT } from '@/lib/knowledge-base';

// --- In-Memory Cache para o "Livro de Contexto" ---
let formattedKnowledgeBaseContext: string = '';
let isContextReady = false;

// Função para inicializar e manter o "Livro de Contexto" atualizado
async function initializeKnowledgeBase() {
    try {
        const { firestore } = initializeFirebaseServer();
        const articlesQuery = query(collection(firestore, 'wikiContent'));

        console.log("Discord Bot: Conectando ao Firestore para construir a base de conhecimento...");

        onSnapshot(articlesQuery, (snapshot) => {
            const articles: WikiArticle[] = [];
            snapshot.forEach(doc => {
                articles.push(doc.data() as WikiArticle);
            });

            // Gera o "livro" formatado a partir dos artigos do Firestore
            const articlesContext = articles.map(article => `
--- INÍCIO DO ARTIGO: ${article.title} ---
ID: ${article.id}
Resumo: ${article.summary}
Conteúdo:
${article.content}
Tags: ${Array.isArray(article.tags) ? article.tags.join(', ') : ''}
${article.tables ? `Tabelas de Dados:\n${JSON.stringify(article.tables, null, 2)}` : ''}
--- FIM DO ARTIGO: ${article.title} ---
`).join('\n\n');

            // Combina com os dados estáticos para criar o livro final
            formattedKnowledgeBaseContext = `${articlesContext}\n\n${KNOWLEDGE_BASE_STATIC_CONTEXT}`;
            
            if (!isContextReady) {
                isContextReady = true;
                console.log(`Discord Bot: Base de conhecimento pronta com ${articles.length} artigos.`);
            } else {
                console.log(`Discord Bot: Base de conhecimento atualizada em tempo real. Total de artigos: ${articles.length}.`);
            }
        }, (error) => {
            console.error("Discord Bot: Erro ao observar a coleção da Wiki:", error);
            // Em caso de erro, podemos usar o contexto estático como fallback
            if (!isContextReady) {
                formattedKnowledgeBaseContext = KNOWLEDGE_BASE_STATIC_CONTEXT;
                isContextReady = true; // Permite que o bot funcione com conhecimento limitado
                 console.log("Discord Bot: Usando base de conhecimento estática como fallback.");
            }
        });

    } catch (error) {
        console.error("Discord Bot: Falha ao inicializar a base de conhecimento:", error);
    }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log('EternalBot is online!');
  // Inicializa a base de conhecimento quando o bot fica pronto
  initializeKnowledgeBase();
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user.id)) {
    const problemDescription = message.content.replace(/<@!?(\d+)>/g, '').trim();

    if (!problemDescription) {
      message.reply('Por favor, me faça uma pergunta para que eu possa ajudar.');
      return;
    }

    if (!isContextReady) {
        message.reply('Ainda estou sincronizando meu conhecimento com a Wiki. Por favor, aguarde um momento e tente novamente.');
        return;
    }

    try {
        await message.channel.sendTyping();
        
      // Usa o "livro de contexto" pré-compilado e sempre atualizado
      const result = await generateSolution({
        problemDescription,
        history: [], 
        knowledgeBase: formattedKnowledgeBaseContext
      });
      
      const fullResponse = result.potentialSolution;

      if (fullResponse) {
        const chunks = fullResponse.match(/[\s\S]{1,2000}/g) || [];
        for (const chunk of chunks) {
            await message.reply(chunk);
        }
      } else {
        message.reply('Não consegui encontrar uma solução para o seu problema.');
      }

    } catch (error) {
      console.error('Error calling generateSolution:', error);
      message.reply('Ocorreu um erro ao tentar encontrar uma solução. Por favor, tente novamente mais tarde.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
