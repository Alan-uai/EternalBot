'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { Message, SavedAnswer, WikiArticle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FirebaseClientProvider, useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { Loader2 } from 'lucide-react';
import { KNOWLEDGE_BASE_STATIC_CONTEXT } from '@/lib/knowledge-base';


interface AppContextType {
  savedAnswers: SavedAnswer[];
  toggleSaveAnswer: (answer: Message) => void;
  isAnswerSaved: (answerId: string) => boolean;
  wikiArticles: WikiArticle[];
  isWikiLoading: boolean;
  isAuthDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
  knowledgeBaseContext: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WIKI_CACHE_STORAGE_KEY = 'eternal-guide-wiki-cache';
const LAST_VISITED_ROUTE_KEY = 'eternal-guide-last-route';

function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [knowledgeBaseContext, setKnowledgeBaseContext] = useState<string>('');
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
  
  const [isInitialAppLoad, setIsInitialAppLoad] = useState(true);

  useEffect(() => {
    if (pathname) {
      localStorage.setItem(LAST_VISITED_ROUTE_KEY, pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isAdminLoading && isInitialAppLoad) {
      const lastRoute = localStorage.getItem(LAST_VISITED_ROUTE_KEY);
      
      if (lastRoute && pathname !== lastRoute) {
        router.replace(lastRoute);
      }
      
      setIsInitialAppLoad(false);
    }
  }, [isAdmin, isAdminLoading, isInitialAppLoad, router, pathname]);


  const wikiCollectionRef = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'wikiContent') : null;
  }, [firestore]);

  const savedAnswersCollectionRef = useMemoFirebase(() => {
    return firestore && user && !user.isAnonymous ? collection(firestore, `users/${user.uid}/savedAnswers`) : null;
  }, [firestore, user]);

  const { data: firestoreWikiArticles, isLoading: isFirestoreWikiLoading } = useCollection<WikiArticle>(wikiCollectionRef as any);
  const { data: savedAnswers, isLoading: areSavedAnswersLoading } = useCollection<SavedAnswer>(savedAnswersCollectionRef as any);

  useEffect(() => {
    try {
      const wikiCacheItem = window.localStorage.getItem(WIKI_CACHE_STORAGE_KEY);
      if (wikiCacheItem) {
        const cachedArticles = JSON.parse(wikiCacheItem);
        setWikiArticles(cachedArticles);
      }
    } catch (error) {
      console.error("Falha ao carregar wiki do armazenamento local", error);
    }
  }, []);
  
  useEffect(() => {
    if (firestoreWikiArticles) {
      // Generate the context book whenever articles change
      const articlesContext = firestoreWikiArticles.map(article => `
--- INÍCIO DO ARTIGO: ${article.title} ---
ID: ${article.id}
Resumo: ${article.summary}
Conteúdo:
${article.content}
Tags: ${Array.isArray(article.tags) ? article.tags.join(', ') : ''}
${article.tables ? `Tabelas de Dados:\n${JSON.stringify(article.tables, null, 2)}` : ''}
--- FIM DO ARTIGO: ${article.title} ---
      `).join('\n\n');
      
      const fullContext = `${articlesContext}\n\n${KNOWLEDGE_BASE_STATIC_CONTEXT}`;
      setKnowledgeBaseContext(fullContext);

      // Also update the local state and localStorage for quick UI rendering
      const hasChanged = JSON.stringify(firestoreWikiArticles) !== JSON.stringify(wikiArticles);
      if (hasChanged) {
        setWikiArticles(firestoreWikiArticles);
        try {
          window.localStorage.setItem(WIKI_CACHE_STORAGE_KEY, JSON.stringify(firestoreWikiArticles));
        } catch(error) {
          console.error("Falha ao salvar wiki no armazenamento local", error);
        }
      }
    }
  }, [firestoreWikiArticles, wikiArticles]); // Dependency on firestoreWikiArticles will trigger regeneration

  const isAnswerSaved = useCallback((answerId: string) => {
    return !!savedAnswers && savedAnswers.some((saved) => saved.id === answerId);
  }, [savedAnswers]);

  const toggleSaveAnswer = useCallback(async (answer: Message) => {
    if (!user || user.isAnonymous) {
      toast({
        variant: 'destructive',
        title: 'Ação necessária',
        description: 'Você precisa estar logado para salvar respostas.',
      });
      setAuthDialogOpen(true);
      return;
    }
    if (!firestore) return;

    const answerRef = doc(firestore, `users/${user.uid}/savedAnswers`, answer.id);

    if (isAnswerSaved(answer.id)) {
      await deleteDoc(answerRef);
      toast({
        variant: 'default',
        title: "Resposta Removida",
        description: "A resposta foi removida da sua lista salva.",
      });
    } else {
      await setDoc(answerRef, {
        id: answer.id,
        userId: user.uid,
        question: '',
        answer: answer.content,
        createdAt: serverTimestamp(),
      });
      toast({
        variant: 'default',
        title: "Resposta Salva!",
        description: "Encontre-a na seção 'Respostas Salvas'.",
      });
    }
  }, [user, firestore, isAnswerSaved, toast]);
  
  const value = { 
    savedAnswers: savedAnswers || [], 
    toggleSaveAnswer, 
    isAnswerSaved,
    wikiArticles: wikiArticles || [],
    isWikiLoading: (isFirestoreWikiLoading && !knowledgeBaseContext), // Loading is true until the context is first generated
    isAuthDialogOpen,
    setAuthDialogOpen,
    knowledgeBaseContext
  };
  
  if (isInitialAppLoad || isAdminLoading) {
      return (
          <div className="flex h-screen w-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </FirebaseClientProvider>
  )
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
