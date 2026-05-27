'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, LayoutGrid, Users, FileText, Wrench, Library, Settings as SettingsIcon } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', label: 'Home', icon: LayoutGrid },
  { href: '/my-groups', label: 'My Groups', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/toolkit', label: "AI Teacher's Toolkit", icon: Wrench },
  { href: '/library', label: 'My Library', icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col bg-white rounded-2xl shadow-card w-[304px] h-[calc(100vh-24px)] sticky top-3 ml-3 my-3 p-6">
      <div className="mb-6">
        <Logo />
      </div>

      <Link
        href="/assignments/new"
        className="veda-btn-accent w-full justify-center mb-8"
      >
        <Sparkles className="w-4 h-4" />
        Create Assignment
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition',
                active
                  ? 'bg-veda-muted text-veda-ink font-medium'
                  : 'text-veda-ink/70 hover:bg-veda-muted/60'
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-veda-ink/70 hover:bg-veda-muted/60 transition"
        >
          <SettingsIcon className="w-[18px] h-[18px]" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-veda-muted">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 grid place-items-center text-white text-sm font-bold">
          S
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight truncate">
            St. Xaviers High School
          </div>
          <div className="text-[11px] text-veda-subtle truncate">
            Lucknow
          </div>
        </div>
      </div>
    </aside>
  );
}
