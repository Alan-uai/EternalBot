'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, Inbox, Download, User, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Head from 'next/head';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface Suggestion {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  content: string;
  attachmentURLs?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

function AdminSuggestionsPage() {
  const firestore = useFirestore();
  
  const suggestionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contentSuggestions'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: suggestions, isLoading } = useCollection<Suggestion>(suggestionsQuery as any);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4">Carregando sugestões...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Revisão de Sugestões - Guia Eterno</title>
      </Head>
      <div className="space-y-6">
        <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Revisão de Sugestões</h1>
            <p className="text-muted-foreground">Analise e gerencie o conteúdo sugerido pela comunidade.</p>
        </header>

        {suggestions && suggestions.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pr-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 bg-card/50 border-b">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs mt-1">
                        <User className="h-3 w-3" /> 
                        Enviado por {suggestion.userEmail || 'Usuário Anônimo'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                       <Badge variant={suggestion.status === 'pending' ? 'secondary' : 'default'}>
                         {suggestion.status}
                       </Badge>
                       <p className="text-xs text-muted-foreground mt-1">
                         {suggestion.createdAt ? formatDistanceToNow(new Date(suggestion.createdAt.seconds * 1000), { addSuffix: true, locale: ptBR }) : '...'}
                       </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{suggestion.content}</p>
                  </CardContent>
                  {suggestion.attachmentURLs && suggestion.attachmentURLs.length > 0 && (
                    <>
                      <Separator />
                      <CardFooter className="p-4 bg-card/30">
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Anexos</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestion.attachmentURLs.map((url, index) => {
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                                    if (isImage) {
                                        return (
                                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="relative h-20 w-20 rounded-md overflow-hidden border">
                                                <Image src={url} alt={`Anexo ${index + 1}`} layout="fill" objectFit="cover" />
                                            </a>
                                        );
                                    }
                                    return (
                                        <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-2 h-4 w-4" />
                                                Anexo {index + 1}
                                            </Button>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 h-96">
            <Inbox className="h-16 w-16 mb-4" />
            <h2 className="text-2xl font-semibold">Nenhuma Sugestão Encontrada</h2>
            <p className="mt-2">Quando os usuários enviarem sugestões, elas aparecerão aqui.</p>
          </div>
        )}
      </div>
    </>
  );
}


export default function SuggestionsPage() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="h-16 w-16 mb-4 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return <AdminSuggestionsPage />;
}
