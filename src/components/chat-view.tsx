
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSolutionStream } from '@/ai/flows/generate-solution';
import { Bot, User, Send, Bookmark, Trash2, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-provider';
import type { Message, WikiArticle } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { micromark } from 'micromark';
import { Card, CardContent } from './ui/card';
import { nanoid } from 'nanoid';
import { useUser, useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { analyzeNegativeFeedback } from '@/ai/flows/analyze-negative-feedback-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const chatSchema = z.object({
  prompt: z.string().min(1, 'A pergunta não pode estar vazia.'),
});

interface ParsedSection {
  marcador: string;
  titulo: string;
  conteudo: string;
}

const extractContentFromString = (str: string): string => {
  try {
    const titleRegex = /"titulo"\s*:\s*"((?:\\"|[^"])*)"/g;
    const contentRegex = /"conteudo"\s*:\s*"((?:\\"|[^"])*)"/g;
    
    const titles = [...str.matchAll(titleRegex)].map(match => match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    const contents = [...str.matchAll(contentRegex)].map(match => match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    
    let result = '';
    const maxLength = Math.max(titles.length, contents.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (titles[i]) {
        result += `**${titles[i]}**\n\n`;
      }
      if (contents[i]) {
        result += `${contents[i]}\n\n`;
      }
    }
    
    if (result.trim()) {
      return result;
    }

    // Fallback for very incomplete JSON strings
    return str.replace(/^\[{"marcador":.*"conteudo":\s*"/, '').replace(/"}\]/, '');
  } catch {
    // If regex fails for any reason, return the raw string
    return str;
  }
};


function AssistantMessage({ content, fromCache }: { content: string; fromCache?: boolean }) {
    let parsedContent: ParsedSection[] | null = null;
    let isJson = false;

    // Tenta analisar o conteúdo como um JSON completo
    try {
        if (typeof content === 'string' && content.trim().startsWith('[')) {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                parsedContent = parsed;
                isJson = true;
            }
        }
    } catch (e) {
        // O JSON está incompleto, o que é esperado durante o streaming.
        // `isJson` permanecerá `false`.
    }

    // Se o JSON for válido e completo, renderiza a estrutura de acordeão.
    if (isJson && parsedContent) {
        const introSection = parsedContent.find((s) => s.marcador === 'texto_introdutorio');
        const accordionSections = parsedContent.filter((s) => s.marcador === 'meio' || s.marcador === 'fim');
        const defaultAccordionItem = accordionSections.length > 0 ? 'item-0' : undefined;

        return (
            <div className='relative'>
                 {fromCache && (
                    <span className="absolute top-0 right-0 text-xs text-muted-foreground/70 flex items-center gap-1 z-10">
                    <Zap className='h-3 w-3' /> Instantâneo
                    </span>
                )}
                {introSection && (
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: micromark(introSection.conteudo) }}
                    />
                )}
                {accordionSections.length > 0 && (
                    <Accordion type="multiple" defaultValue={defaultAccordionItem ? [defaultAccordionItem] : []} className="w-full mt-4 border-t pt-4">
                        {accordionSections.map((section, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-sm font-semibold hover:no-underline text-left">
                                    {section.titulo}
                                </AccordionTrigger>
                                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-6 pb-4">
                                    <div dangerouslySetInnerHTML={{ __html: micromark(section.conteudo) }} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        );
    }

    // Se o JSON estiver incompleto ou não for JSON, renderiza o texto extraído de forma inteligente.
    const streamingText = extractContentFromString(content);
    return (
        <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: micromark(streamingText) }}
        />
    );
}


const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-2">
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot-1"></div>
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot-2"></div>
      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce-dot-3"></div>
    </div>
);

const CHAT_STORAGE_KEY = 'eternal-guide-chat-history';
const CACHE_STORAGE_KEY = 'eternal-guide-question-cache';

interface CachedItem {
  message: Message;
  feedback: 'positive' | 'negative' | null;
  dataVersion: string; // Track the game data version
}


const suggestedPrompts = [
    'Qual o melhor poder para o Mundo 4?',
    'Como derroto o chefe de Windmill Island?',
    'Qual a ordem de prioridade das gamepasses?',
    'Quanto de DPS preciso para o Mundo 10?',
];

function findRelevantArticles(prompt: string, articles: WikiArticle[]): string {
    if (!prompt || !articles || articles.length === 0) {
        return '';
    }

    const lowerCasePrompt = prompt.toLowerCase();
    const promptWords = new Set(lowerCasePrompt.split(' ').filter(word => word.length > 2));

    const scoredArticles = articles.map(article => {
        let score = 0;
        const lowerCaseTitle = article.title.toLowerCase();
        const tagsString = Array.isArray(article.tags) ? article.tags.join(' ').toLowerCase() : '';
        const summaryString = article.summary.toLowerCase();

        // High score for exact or near-exact title matches
        if (lowerCaseTitle.includes(lowerCasePrompt)) {
            score += 100;
        }

        promptWords.forEach(word => {
            if (lowerCaseTitle.includes(word)) score += 20;
            if (tagsString.includes(word)) score += 15;
            if (summaryString.includes(word)) score += 5;
        });

        // Boost for specific terms
        if (/tier list|prioridade|melhor|pior/.test(lowerCasePrompt) && (tagsString.includes('tier list') || lowerCaseTitle.includes('tier list'))) {
            score += 50;
        }
        if (/gamepass|passes/.test(lowerCasePrompt) && (tagsString.includes('gamepass') || lowerCaseTitle.includes('gamepass'))) {
            score += 50;
        }

        return { article, score };
    })
    .filter(item => item.score > 10) // Increase threshold to filter out weak matches
    .sort((a, b) => b.score - a.score);

    // Take the top 3 most relevant articles
    const topArticles = scoredArticles.slice(0, 3);
    
    if (topArticles.length === 0) {
        // Fallback to "getting-started" if no relevant articles are found
        const gettingStarted = articles.find(a => a.id === 'getting-started');
        return gettingStarted ? `Title: ${gettingStarted.title}\nSummary: ${gettingStarted.summary}\nContent: ${gettingStarted.content}\nTables: ${JSON.stringify(gettingStarted.tables || {})}}` : '';
    }

    return topArticles
        .map(({ article }) => `Title: ${article.title}\nSummary: ${article.summary}\nContent: ${article.content}\nTables: ${JSON.stringify(article.tables || {})}}`)
        .join('\n\n---\n\n');
}


export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [questionCache, setQuestionCache] = useState<Record<string, CachedItem>>({});
  const [feedback, setFeedback] = useState<Record<string, 'positive' | 'negative' | null>>({});

  const { toast } = useToast();
  const { toggleSaveAnswer, isAnswerSaved, wikiArticles, isWikiLoading, gameDataVersion } = useApp();
  const { user } = useUser();
  const { firestore } = useFirebase();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { prompt: '' },
  });
  
  useEffect(() => {
    try {
      const chatHistory = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (chatHistory) {
        setMessages(JSON.parse(chatHistory));
      }

      const cachedQuestions = window.localStorage.getItem(CACHE_STORAGE_KEY);
       if (cachedQuestions) {
        const parsedCache: Record<string, CachedItem> = JSON.parse(cachedQuestions);
        setQuestionCache(parsedCache);
        
        const initialFeedback: Record<string, 'positive' | 'negative' | null> = {};
        Object.values(parsedCache).forEach((item: CachedItem) => {
            if (item?.message?.id) {
                initialFeedback[item.message.id] = item.feedback;
            }
        });
        setFeedback(initialFeedback);
       }
    } catch (error) {
      console.error("Falha ao carregar dados do armazenamento local", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Falha ao salvar o histórico do chat no armazenamento local", error);
      }
    }
  }, [messages, isMounted]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleFeedback = async (messageId: string, prompt: string, response: string, newFeedback: 'positive' | 'negative') => {
    const currentFeedback = feedback[messageId];
    const updatedFeedback = currentFeedback === newFeedback ? null : newFeedback;
    
    setFeedback(prev => ({ ...prev, [messageId]: updatedFeedback }));

    const normalizedPrompt = prompt.trim().toLowerCase();
    const updatedCache = { ...questionCache };

    if (updatedCache[normalizedPrompt]) {
        updatedCache[normalizedPrompt].feedback = updatedFeedback;

        // Invalidate cache if feedback is negative
        if (updatedFeedback === 'negative') {
            delete updatedCache[normalizedPrompt];
            toast({ title: "Feedback enviado", description: "Obrigado! A resposta anterior foi removida e uma nova será gerada." });
        }

        setQuestionCache(updatedCache);
        window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updatedCache));
    }

    if (updatedFeedback === 'negative') {
        // 1. Submit for review in the background
        if (firestore && user) {
             try {
                const analysisResult = await analyzeNegativeFeedback({ question: prompt, negativeResponse: response });
                
                const feedbackId = nanoid();
                
                const feedbackData = {
                    id: feedbackId,
                    userId: user.uid,
                    userEmail: user.email,
                    question: prompt,
                    negativeResponse: response,
                    aiSuggestion: analysisResult.suggestion,
                    reputationPointsAwarded: analysisResult.reputationPointsAwarded,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                };

                await setDoc(doc(firestore, 'negativeFeedback', feedbackId), feedbackData);
                await setDoc(doc(firestore, 'users', user.uid, 'negativeFeedback', feedbackId), {
                    question: prompt,
                    status: 'pending',
                    createdAt: feedbackData.createdAt,
                });

            } catch (error) {
                console.error("Erro ao salvar feedback negativo:", error);
            }
        }

        // 2. Remove the bad answer from the current chat view and trigger regeneration
        const userMessageIndex = messages.findIndex(msg => msg.role === 'assistant' && msg.id === messageId) - 1;
        const userMessageContent = messages[userMessageIndex]?.content;

        if(userMessageContent){
            const historyWithoutBadAnswer = messages.slice(0, userMessageIndex + 1);
            setMessages(historyWithoutBadAnswer);
            callAI(userMessageContent, historyWithoutBadAnswer);
        }
    }
  };


  const callAI = async (prompt: string, history: Message[]) => {
    setIsLoading(true);
    const assistantMessageId = nanoid();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      question: prompt,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setFeedback(prev => ({...prev, [assistantMessageId]: null}));

    try {
      const relevantWikiContext = findRelevantArticles(prompt, wikiArticles);
      const historyForAI = history.map(({ id, fromCache, isStreaming, question, ...rest }) => rest);

      const stream = await generateSolutionStream({
        problemDescription: prompt,
        wikiContext: relevantWikiContext,
        history: historyForAI,
      });

      if (!stream) {
        throw new Error('A resposta da IA está vazia.');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, isStreaming: false, content: accumulatedContent } : msg
            )
          );
          setIsLoading(false);
          
          const finalMessage: Message = { id: assistantMessageId, role: 'assistant', content: accumulatedContent, question: prompt };
          const newCacheItem: CachedItem = { message: finalMessage, feedback: null, dataVersion: gameDataVersion };
          const normalizedPrompt = prompt.trim().toLowerCase();
          const newCache = { ...questionCache, [normalizedPrompt]: newCacheItem };
          setQuestionCache(newCache);
          window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(newCache));

          break;
        }
        accumulatedContent += decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
          )
        );
      }
    } catch (error) {
      console.error('Erro ao gerar solução:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao obter uma resposta da IA. Por favor, tente novamente.',
      });
      setMessages((prev) => prev.filter(msg => msg.id !== assistantMessageId));
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: values.prompt,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    form.reset();
  
    const normalizedPrompt = values.prompt.trim().toLowerCase();
    const cachedItem = questionCache[normalizedPrompt];

    // If cache exists and is valid, serve it.
    if (cachedItem && cachedItem.message && cachedItem.feedback !== 'negative' && cachedItem.dataVersion === gameDataVersion) {
        const cachedAnswerWithId = {
            ...cachedItem.message,
            id: cachedItem.message.id || nanoid(),
            fromCache: true,
            question: values.prompt,
        };
        setMessages((prev) => [...prev, cachedAnswerWithId]);
        if(cachedAnswerWithId.id) {
            setFeedback(prev => ({...prev, [cachedAnswerWithId.id]: cachedItem.feedback }));
        }
        return;
    }
  
    // Otherwise (no cache, stale cache, or negative feedback), call the AI.
    const historyForAI = newMessages;
    callAI(values.prompt, historyForAI);
  }

  const handleClearChat = () => {
    setMessages([]);
    toast({
        title: "Chat Limpo",
        description: "Você pode começar uma nova conversa."
    });
  }

  const handleSuggestedPrompt = (prompt: string) => {
    form.setValue('prompt', prompt);
    form.handleSubmit(onSubmit)();
  };


  const isSendDisabled = isLoading || isWikiLoading;

  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="flex-grow relative">
        <ScrollArea className="absolute inset-0" viewportRef={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground pt-10 md:pt-16">
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-2xl font-semibold">Bem-vindo ao Guia Eterno</h2>
                <p className="mt-2">Pergunte-me qualquer coisa sobre o Anime Eternal!</p>
                {isWikiLoading && 
                  <div className="mt-2 text-sm flex items-center justify-center gap-2">
                    <TypingIndicator /> Carregando a wiki...
                  </div>
                }
                
                {!isWikiLoading && (
                    <Card className='mt-8 max-w-2xl mx-auto bg-card/50'>
                        <CardContent className='p-4'>
                            <p className="text-sm mb-4">Ou tente uma dessas perguntas:</p>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                {suggestedPrompts.map(prompt => (
                                    <Button key={prompt} variant='outline' size='sm' className='h-auto py-2' onClick={() => handleSuggestedPrompt(prompt)}>
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-4',
                  message.role === 'user' && 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-xl w-full rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  {message.isStreaming && !message.content ? (
                    <TypingIndicator />
                  ) : message.role === 'assistant' ? (
                    <AssistantMessage content={message.content} fromCache={message.fromCache} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.role === 'assistant' && !message.isStreaming && message.content && (
                     <div className="flex items-center gap-1 mt-2 -ml-2">
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleFeedback(message.id, message.question || '', message.content, 'positive')}
                          >
                            <ThumbsUp className={cn('h-4 w-4', feedback[message.id] === 'positive' && 'fill-primary text-primary')} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleFeedback(message.id, message.question || '', message.content, 'negative')}
                          >
                            <ThumbsDown className={cn('h-4 w-4', feedback[message.id] === 'negative' && 'fill-destructive text-destructive')} />
                          </Button>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => toggleSaveAnswer(message)}
                          >
                            <Bookmark className={cn('h-4 w-4', isAnswerSaved(message.id) && 'fill-primary text-primary')} />
                          </Button>
                     </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        {messages.length > 0 && (
            <div className="absolute top-4 right-4">
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    title="Limpar conversa"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        )}
      </div>

      <div className="border-t p-4 bg-background">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={isWikiLoading ? "Por favor espere, aprendendo com a wiki..." : "ex: Como eu derroto o Titã Sombrio?"}
                      className="resize-none"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isSendDisabled) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      disabled={isSendDisabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isSendDisabled} className="bg-primary hover:bg-primary/90">
              <Send className="h-5 w-5" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
