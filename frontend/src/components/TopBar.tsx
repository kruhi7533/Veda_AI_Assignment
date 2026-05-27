'use client';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  title?: string;
  showBack?: boolean;
  trailing?: React.ReactNode;
}

export function TopBar({ title = 'Assignment', showBack = true, trailing }: Props) {
  const router = useRouter();
  return (
    <header className="bg-white/75 backdrop-blur border border-veda-border rounded-2xl px-3 py-2 flex items-center gap-3 mx-3 mt-3">
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-9 h-9 grid place-items-center rounded-xl hover:bg-veda-muted transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-2 text-sm font-medium text-veda-ink/80">
        <LayoutGrid className="w-4 h-4" />
        {title}
      </div>
      <div className="flex-1" />
      {trailing}
      <button
        aria-label="Notifications"
        className="w-9 h-9 grid place-items-center rounded-xl hover:bg-veda-muted transition relative"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-veda-accent" />
      </button>
      <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-veda-muted transition">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 grid place-items-center text-white text-xs font-bold">
          R
        </div>
        <span className="text-sm">Ruhi</span>
        <ChevronDown className="w-3.5 h-3.5 text-veda-subtle" />
      </button>
    </header>
  );
}
