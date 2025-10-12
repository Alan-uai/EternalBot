'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSolutionStream } from '@/ai/flows/generate-solution';
import { Bot, User, Send, Bookmark, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-provider';
import type { Message } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { micromark } from 'micromark';
import { Card, CardContent } from './ui/card';

const chatSchema = z.object({
  prompt: z.string().min(1, 'A mensagem não pode estar vazia.'),
});

function AssistantMessage({ content }: { content: string }) {
  const htmlContent = useMemo(() => micromark(content), [content]);

  return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
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

const suggestedPrompts = [
    'Qual o melhor poder para o Mundo 4?',
    'Como derroto o chefe de Windmill Island?',
    'Qual a ordem de prioridade das gamepasses?',
    'Quanto de DPS preciso para o Mundo 10?',
];


export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const { toggleSaveAnswer, isAnswerSaved, wikiArticles, isWikiLoading } = useApp();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { prompt: '' },
  });
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (item) {
        setMessages(JSON.parse(item));
      }
    } catch (error) {
      console.error("Falha ao carregar histórico do chat do armazenamento local", error);
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

  async function onSubmit(values: z.infer<typeof chatSchema>) {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: values.prompt,
    };
  
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setIsLoading(true);
    form.reset();
  
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  
    try {
      const wikiContext = wikiArticles.map(article => `Title: ${article.title}\nContent: ${article.content}\nTables: ${JSON.stringify(article.tables)}`).join('\n\n---\n\n');
      const historyForAI = currentMessages.slice(0, -1).map(({ id, ...rest }) => rest);
  
      generateSolutionStream({
        problemDescription: values.prompt,
        wikiContext,
        history: historyForAI,
      }).then(async (stream) => {
        if (!stream) {
          throw new Error('A resposta da IA está vazia.');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        const processText = async () => {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
                )
              );
              setIsLoading(false);
              break;
            }
            accumulatedContent += decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
              )
            );
          }
        };
        await processText();

      }).catch(error => {
        // This catch block will handle errors from the generateSolutionStream promise itself (e.g., network issues)
        console.error('Erro ao iniciar o stream da solução:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar com a IA. Por favor, verifique sua conexão e tente novamente.',
        });
        setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
        setIsLoading(false);
      });
  
    } catch (error) {
      // This catch block handles synchronous errors before the promise starts
      console.error('Erro ao gerar solução:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao obter uma resposta da IA. Por favor, tente novamente.',
      });
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
      setIsLoading(false);
    }
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
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
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
                    'max-w-xl rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  )}
                >
                  {message.isStreaming && !message.content ? (
                    <TypingIndicator />
                  ) : message.role === 'assistant' ? (
                    <AssistantMessage content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {message.role === 'assistant' && !message.isStreaming && message.content && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className="mt-2 h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => toggleSaveAnswer(message)}
                      >
                        <Bookmark className={cn('h-4 w-4', isAnswerSaved(message.id) && 'fill-primary text-primary')} />
                      </Button>
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
