'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, useFirebase } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, Sparkles } from 'lucide-react';
import { extractStatsFromImage } from '@/ai/flows/extract-stats-from-image-flow';
import { useGlobalBonuses } from '@/hooks/use-global-bonuses';
import { allGameData } from '@/lib/game-data-context';
import { energyGainPerRank } from '@/lib/energy-gain-data';

const MAX_RANK = Math.max(...Object.keys(energyGainPerRank).map(Number));
const MAX_WORLD = allGameData.length;

const parseUserEnergy = (energyStr: string): number => {
    if (!energyStr || typeof energyStr !== 'string') return 0;
    const lowerStr = energyStr.toLowerCase().trim();
    const suffixes: { [key: string]: number } = {
        k: 1e3, m: 1e6, b: 1e9, t: 1e12, qd: 1e15, qn: 1e18, sx: 1e21, sp: 1e24,
        o: 1e27, n: 1e30, de: 1e33, ud: 1e36, dd: 1e39, td: 1e42, qdd: 1e45, qnd: 1e48,
        sxd: 1e51, spd: 1e54, ocd: 1e57, nvd: 1e60, vgn: 1e63, uvg: 1e66, dvg: 1e69,
        tvg: 1e72, qtv: 1e75, qnv: 1e78, sev: 1e81, spg: 1e84, ovg: 1e87, nvg: 1e90,
        tgn: 1e93, utg: 1e96, dtg: 1e99, tstg: 1e102, qtg: 1e105, qntg: 1e108, sstg: 1e111,
        sptg: 1e114, octg: 1e117, notg: 1e120, qdr: 1e123, uqdr: 1e126, dqdr: 1e129,
        tqdr: 1e132
    };

    const suffixKey = Object.keys(suffixes).reverse().find(s => lowerStr.endsWith(s));
    if (suffixKey) {
        const numberPart = parseFloat(lowerStr.replace(suffixKey, ''));
        if (isNaN(numberPart)) return 0;
        return numberPart * suffixes[suffixKey];
    }
    
    const numberValue = parseFloat(lowerStr);
    return isNaN(numberValue) ? 0 : numberValue;
};


const formatNumber = (num: number): string => {
    if (num < 1e3) return num.toFixed(2);
    const suffixes = ["", "k", "M", "B", "T", "qd", "Qn", "sx", "Sp", "O", "N", "de", "Ud", "dD", "tD", "qdD", "QnD", "sxD", "SpD", "OcD", "NvD", "Vgn", "UVg", "DVg", "TVg", "qtV", "QnV", "SeV", "SPG", "OVG", "NVG", "TGN", "UTG", "DTG", "tsTG", "qTG", "QnTG", "ssTG", "SpTG", "OcTG", "NoTG", "QDR", "uQDR", "dQDR", "tQDR"];
    const i = Math.floor(Math.log10(num) / 3);
    if (i < suffixes.length) {
        const value = (num / Math.pow(1000, i));
        return `${value.toFixed(2)}${suffixes[i]}`;
    }
    return num.toExponential(2);
};

const createStatsSchema = (maxEnergyGain: number) => z.object({
    currentWorld: z.string()
        .min(1, 'O mundo atual é obrigatório.')
        .refine(val => !isNaN(parseInt(val, 10)), { message: 'Deve ser um número.' })
        .refine(val => parseInt(val, 10) <= MAX_WORLD, { message: `O mundo máximo é ${MAX_WORLD}.` }),
    rank: z.string()
        .min(1, 'O rank é obrigatório.')
        .refine(val => !isNaN(parseInt(val, 10)), { message: 'Deve ser um número.' })
        .refine(val => parseInt(val, 10) <= MAX_RANK, { message: `O rank máximo é ${MAX_RANK}.` }),
    energyGain: z.string()
        .min(1, 'O ganho de energia é obrigatório.')
        .refine(val => parseUserEnergy(val) <= maxEnergyGain, { message: `O ganho de energia máximo é ${formatNumber(maxEnergyGain)}.` }),
    totalDamage: z.string().min(1, 'O dano total é obrigatório.'),
    currentEnergy: z.string().min(1, 'A energia acumulada é obrigatória.'),
});


type StatsFormData = z.infer<ReturnType<typeof createStatsSchema>>;

export function WelcomePopover() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const { bonuses: maxBonuses, isLoading: areBonusesLoading } = useGlobalBonuses("0", true);

    const statsSchema = useMemo(() => {
        return createStatsSchema(maxBonuses.energyGain);
    }, [maxBonuses]);

    const form = useForm<StatsFormData>({
        resolver: zodResolver(statsSchema),
        defaultValues: {
            currentWorld: '',
            rank: '',
            energyGain: '',
            totalDamage: '',
            currentEnergy: '',
        },
    });

    useEffect(() => {
        if (searchParams.get('new-user') === 'true') {
            setIsOpen(true);
        }
    }, [searchParams]);

    const handleClose = () => {
        setIsOpen(false);
        router.replace('/profile', { scroll: false });
    };

    const handleCalculateMaxStats = () => {
        form.setValue('currentWorld', String(MAX_WORLD));
        form.setValue('rank', String(MAX_RANK));
        form.setValue('energyGain', formatNumber(maxBonuses.energyGain));
        form.setValue('totalDamage', formatNumber(maxBonuses.damage));

        toast({
            title: "Valores Máximos Calculados!",
            description: "Os campos foram preenchidos com os stats máximos teóricos."
        });
    };

    const onSubmit = async (values: StatsFormData) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Usuário não autenticado.' });
            return;
        }
        setIsSaving(true);
        try {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                currentWorld: values.currentWorld,
                rank: parseInt(values.rank, 10),
            });
            
            const energyRef = doc(firestore, 'users', user.uid, 'rank', 'current');
            await setDoc(energyRef, { value: parseInt(values.rank, 10) }, { merge: true });

            if (values.currentEnergy) {
              localStorage.setItem('eternal-guide-current-energy', values.currentEnergy);
            }

            toast({ title: 'Perfil Atualizado!', description: 'Suas informações foram salvas.' });
            handleClose();

        } catch (error: any) {
            console.error('Error saving initial stats:', error);
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar suas informações.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        toast({ title: 'Analisando Imagem...', description: 'A IA está lendo suas estatísticas.' });

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fileDataUri = reader.result as string;
                const result = await extractStatsFromImage({ image: fileDataUri });
                
                const foundFields: string[] = [];
                const missingFields: string[] = [];

                if (result.currentWorld) {
                    form.setValue('currentWorld', result.currentWorld.replace(/\D/g, ''));
                    foundFields.push('Mundo');
                } else {
                    missingFields.push('Mundo');
                }
                if (result.rank) {
                    form.setValue('rank', result.rank);
                    foundFields.push('Rank');
                } else {
                    missingFields.push('Rank');
                }
                if (result.totalDamage) {
                    form.setValue('totalDamage', result.totalDamage);
                    foundFields.push('Dano Total');
                } else {
                    missingFields.push('Dano Total');
                }
                if (result.energyGain) {
                    form.setValue('energyGain', result.energyGain);
                    foundFields.push('Ganho de Energia');
                } else {
                    missingFields.push('Ganho de Energia');
                }

                if (foundFields.length > 0) {
                    toast({ title: 'Campos Preenchidos!', description: `A IA encontrou: ${foundFields.join(', ')}.` });
                }
                if (missingFields.length > 0) {
                     toast({ variant: 'destructive', title: 'Campos Faltando', description: `Não foi possível encontrar: ${missingFields.join(', ')}. Por favor, preencha manualmente.` });
                }
            };
        } catch (error) {
            console.error('Error analyzing image:', error);
            toast({ variant: 'destructive', title: 'Erro na Análise', description: 'Não foi possível extrair dados da imagem.' });
        } finally {
            setIsAnalyzing(false);
            if(imageInputRef.current) imageInputRef.current.value = '';
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Bem-vindo ao Guia Eterno!</DialogTitle>
                    <DialogDescription>
                        Para começar, preencha suas estatísticas, envie um screenshot do jogo ou calcule os stats máximos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2 py-2">
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                    <Button variant="outline" className='w-full' onClick={() => imageInputRef.current?.click()} disabled={isAnalyzing}>
                         {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        {isAnalyzing ? 'Analisando...' : 'Enviar Imagem'}
                    </Button>
                     <Button variant="outline" className='w-full' onClick={handleCalculateMaxStats} disabled={areBonusesLoading}>
                         {areBonusesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                         Calcular Máximo
                    </Button>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Ou Preencha Manualmente
                    </span>
                  </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentWorld"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mundo Atual</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: 23" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="rank"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seu Rank</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="ex: 115" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalDamage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dano Total (DPS)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: 1.5sx" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="currentEnergy"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Energia Atual (Acumulada)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: 1.5sx" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="energyGain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ganho de Energia (por clique)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex: 87.04O" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter className='pt-4'>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar e Continuar
                            </Button>
                         </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
