import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-veda-accent to-veda-accent2 grid place-items-center text-white text-sm font-bold">
        v
      </div>
      <span className="text-[17px] font-semibold tracking-tight text-veda-ink">
        VedaAI
      </span>
    </div>
  );
}
