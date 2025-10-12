
import { Client, GatewayIntentBits, Message } from 'discord.js';
import 'dotenv/config';
import { generateSolution } from '@/ai/flows/generate-solution';
import { initializeFirebaseServer } from '@/firebase/server';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import type { WikiArticle } from '@/lib/types';
import { KNOWLEDGE_BASE_CONTEXT } from '@/lib/knowledge-base';

// --- In-Memory Cache para os Artigos da Wiki ---
let wikiArticlesCache: WikiArticle[] = [];
let isCacheReady = false;

// Função para inicializar o cache e o listener do Firestore
async function initializeWikiCache() {
    try {
        const { firestore } = initializeFirebaseServer();
        const articlesQuery = query(collection(firestore, 'wikiContent'));

        console.log("Discord Bot: Conectando ao Firestore para cache da Wiki...");

        onSnapshot(articlesQuery, (snapshot) => {
            const articles: WikiArticle[] = [];
            snapshot.forEach(doc => {
                articles.push(doc.data() as WikiArticle);
            });
            wikiArticlesCache = articles;
            if (!isCacheReady) {
                isCacheReady = true;
                console.log(`Discord Bot: Cache da Wiki inicializado com ${articles.length} artigos.`);
            } else {
                console.log(`Discord Bot: Cache da Wiki atualizado em tempo real. Total de artigos: ${articles.length}.`);
            }
        }, (error) => {
            console.error("Discord Bot: Erro no listener da Wiki:", error);
        });

    } catch (error) {
        console.error("Discord Bot: Falha ao inicializar o cache da Wiki:", error);
    }
}

// Função para formatar os artigos do cache para a IA
function getFormattedWikiContextFromCache(): string {
    if (!wikiArticlesCache || wikiArticlesCache.length === 0) {
        return "Nenhum artigo da wiki encontrado no cache.";
    }
    return wikiArticlesCache.map(article => `
--- INÍCIO DO ARTIGO: ${article.title} ---
ID: ${article.id}
Resumo: ${article.summary}
Conteúdo:
${article.content}
Tags: ${Array.isArray(article.tags) ? article.tags.join(', ') : ''}
${article.tables ? `Tabelas de Dados:\n${JSON.stringify(article.tables, null, 2)}` : ''}
--- FIM DO ARTIGO: ${article.title} ---
`).join('\n\n');
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
  // Inicializa o cache quando o bot fica pronto
  initializeWikiCache();
});

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user.id)) {
    const problemDescription = message.content.replace(/<@!?(\d+)>/g, '').trim();

    if (!problemDescription) {
      message.reply('Por favor, me faça uma pergunta para que eu possa ajudar.');
      return;
    }

    if (!isCacheReady) {
        message.reply('Ainda estou sincronizando meu conhecimento com a Wiki. Por favor, aguarde um momento e tente novamente.');
        return;
    }

    try {
        const typingIndicator = await message.channel.sendTyping();

        // O KNOWLEDGE_BASE_CONTEXT agora contém apenas os dados estáticos (mundos, etc).
        // Vamos combiná-lo com o contexto dinâmico da Wiki vindo do nosso cache.
        const dynamicWikiContext = getFormattedWikiContextFromCache();
        const fullContextForAI = `${dynamicWikiContext}\n\n${KNOWLEDGE_BASE_CONTEXT}`;


      // Passamos o contexto completo e atualizado para a IA
      const result = await generateSolution({
        problemDescription,
        history: [], // O histórico pode ser implementado posteriormente
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
