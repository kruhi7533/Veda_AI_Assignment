'use client';
import { Minus, Plus } from 'lucide-react';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

export function Stepper2Counter({ value, onChange, min = 1, max = 50 }: Props) {
  const safe = Number.isFinite(value) ? value : min;
  return (
    <div className="inline-flex items-center bg-white border border-veda-border rounded-full overflow-hidden">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, safe - 1))}
        className="w-8 h-8 grid place-items-center hover:bg-veda-muted transition disabled:opacity-40"
        disabled={safe <= min}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <input
        type="number"
        value={safe}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) {
            onChange(Math.min(max, Math.max(min, Math.round(n))));
          }
        }}
        className="w-10 text-center text-sm font-medium bg-transparent outline-none"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, safe + 1))}
        className="w-8 h-8 grid place-items-center hover:bg-veda-muted transition disabled:opacity-40"
        disabled={safe >= max}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
