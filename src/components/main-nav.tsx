'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BotMessageSquare, Bookmark, Lightbulb, ClipboardList, BrainCircuit, Calculator, HeartPulse, Database } from 'lucide-react';
import { useAdmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/', icon: BotMessageSquare, label: 'Chat IA' },
  { href: '/tips', icon: HeartPulse, label: 'Dicas' },
  { href: '/calculator', icon: Calculator, label: 'Calculadora' },
  { href: '/saved', icon: Bookmark, label: 'Salvas' },
  { href: '/suggest', icon: Lightbulb, label: 'Sugerir' },
];

const adminNavItems = [
    { href: '/suggestions', icon: ClipboardList, label: 'Sugestões' },
    { href: '/admin/manage-content', icon: Database, label: 'Gerenciar' },
    { href: '/admin-chat', icon: BrainCircuit, label: 'Canal IA' },
];

export function MainNav() {
  const pathname = usePathname();
  const { isAdmin } = useAdmin();

  return (
    <TooltipProvider>
      <nav className="flex items-center space-x-2">
        {navItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                  pathname === item.href && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.label}</TooltipContent>
          </Tooltip>
        ))}
        {isAdmin && adminNavItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                   pathname.startsWith(item.href) && 'bg-accent text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}
