import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  accent?: 'orange' | 'emerald' | 'blue' | 'rose' | 'violet';
}

const ACCENTS: Record<NonNullable<Props['accent']>, string> = {
  orange: 'from-orange-100 to-orange-50 text-orange-600',
  emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
  blue: 'from-sky-100 to-sky-50 text-sky-600',
  rose: 'from-rose-100 to-rose-50 text-rose-600',
  violet: 'from-violet-100 to-violet-50 text-violet-600',
};

export function StatCard({ icon: Icon, label, value, hint, accent = 'orange' }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-veda-border p-5 hover:shadow-soft transition">
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br', ACCENTS[accent])}>
          <Icon className="w-5 h-5" />
        </div>
        {hint && <span className="text-[11px] text-veda-subtle">{hint}</span>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-xs text-veda-subtle mt-1">{label}</div>
      </div>
    </div>
  );
}
