'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, Library, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/toolkit', label: 'AI Toolkit', icon: Wrench },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-2 left-2 right-2 z-40 bg-white/75 backdrop-blur-md border border-veda-border rounded-2xl shadow-soft px-2 py-2 flex items-stretch justify-between">
      {items.map((it) => {
        const Icon = it.icon;
        const active = it.href === '/'
          ? pathname === '/'
          : pathname?.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition',
              active ? 'bg-veda-muted text-veda-ink' : 'text-veda-ink/60'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
