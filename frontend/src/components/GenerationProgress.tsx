'use client';
import { Sparkles, Loader2 } from 'lucide-react';

interface Props {
  progress: number;
  message?: string;
}

export function GenerationProgress({ progress, message }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-veda-border p-10 flex flex-col items-center text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-veda-accent to-veda-accent2 grid place-items-center text-white">
          <Sparkles className="w-7 h-7" />
        </div>
        <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-veda-ink animate-spin bg-white rounded-full p-1" />
      </div>
      <h3 className="mt-5 text-lg font-semibold">Generating your question paper</h3>
      <p className="mt-1 text-sm text-veda-subtle">
        {message ?? 'Our AI is crafting questions...'}
      </p>
      <div className="mt-5 w-full max-w-sm h-2 rounded-full bg-veda-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-veda-accent to-veda-accent2 transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-veda-subtle">{progress}%</div>
    </div>
  );
}
