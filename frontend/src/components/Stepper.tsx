'use client';
import { cn } from '@/lib/utils';

interface Props {
  step: number; // 1 or 2
  total?: number;
}

export function Stepper({ step, total = 2 }: Props) {
  return (
    <div className="flex items-center gap-2 w-full">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const active = idx <= step;
        return (
          <div
            key={i}
            className={cn(
              'flex-1 h-1.5 rounded-full transition-all',
              active ? 'bg-veda-ink' : 'bg-veda-border'
            )}
          />
        );
      })}
    </div>
  );
}
