'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, PlusCircle, Power } from 'lucide-react';
import Head from 'next/head';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { GeneralItemUploader } from '@/components/profile/GeneralItemUploader';
import { ReputationSection } from '@/components/profile/ReputationSection';
import { UserFeedbackSection } from '@/components/profile/UserFeedbackSection';
import { CharacterInventory } from '@/components/profile/CharacterInventory';
import { GlobalBonusDisplay } from '@/components/profile/GlobalBonusDisplay';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WelcomePopover } from '@/components/profile/WelcomePopover';

const ENERGY_STORAGE_KEY = 'eternal-guide-current-energy';

export default function ProfilePage() {
    const auth = useAuth();
    const { isUserLoading } = useUser();
    const { toast } = useToast();
    const [currentEnergy, setCurrentEnergy] = useState('');

    useEffect(() => {
        const savedEnergy = localStorage.getItem(ENERGY_STORAGE_KEY);
        if (savedEnergy) {
            setCurrentEnergy(savedEnergy);
        }
    }, []);

    const handleEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentEnergy(value);
        localStorage.setItem(ENERGY_STORAGE_KEY, value);
    };

    const handleSignOut = async () => {
        if (auth) {
            try {
                await signOut(auth);
                toast({ title: 'Logout efetuado com sucesso.'});
            } catch (error) {
                console.error("Logout error", error);
                toast({ variant: 'destructive', title: 'Erro ao fazer logout.'});
            }
        }
    };
    
    if (isUserLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
  
    return (
        <>
            <WelcomePopover />
            <Head>
                <title>Meu Perfil - Guia Eterno</title>
            </Head>
            <div className="space-y-8">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className='flex items-center gap-4'>
                         <User className="h-8 w-8 text-primary"/>
                         <div>
                            <h1 className="text-3xl font-bold tracking-tight font-headline">Meu Perfil</h1>
                            <p className="text-muted-foreground">Gerencie seus dados do jogo, reputação e configurações.</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <GeneralItemUploader />
                        <Button variant="outline" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </header>

                 <Card>
                    <CardHeader>
                        <CardTitle>Bônus Totais</CardTitle>
                        <CardDescription>Resumo de todos os bônus combinados de suas categorias. Insira sua energia acumulada para ver o cálculo de dano.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-w-xs">
                            <Label htmlFor="current-energy" className="text-xs text-muted-foreground">Sua Energia Atual (Acumulada)</Label>
                            <div className='relative'>
                                 <Power className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                 <Input
                                    id="current-energy"
                                    placeholder="ex: 1.5sx"
                                    value={currentEnergy}
                                    onChange={handleEnergyChange}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                       <GlobalBonusDisplay currentEnergy={currentEnergy} />
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ReputationSection />
                    <UserFeedbackSection />
                </div>

                <CharacterInventory />
            </div>
        </>
    );
}
