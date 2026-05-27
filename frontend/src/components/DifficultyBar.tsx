interface Props {
  easy: number;
  moderate: number;
  challenging: number;
}

export function DifficultyBar({ easy, moderate, challenging }: Props) {
  const total = Math.max(1, easy + moderate + challenging);
  const pct = (n: number) => Math.round((n / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Difficulty Distribution</h3>
          <p className="text-[11px] text-veda-subtle">
            Across all generated questions
          </p>
        </div>
        <span className="text-xs text-veda-subtle">{total} questions</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-veda-muted">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${pct(easy)}%` }}
          title={`Easy: ${easy}`}
        />
        <div
          className="bg-amber-500 transition-all"
          style={{ width: `${pct(moderate)}%` }}
          title={`Moderate: ${moderate}`}
        />
        <div
          className="bg-rose-500 transition-all"
          style={{ width: `${pct(challenging)}%` }}
          title={`Challenging: ${challenging}`}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
        <Legend color="bg-emerald-500" label="Easy" n={easy} pct={pct(easy)} />
        <Legend color="bg-amber-500" label="Moderate" n={moderate} pct={pct(moderate)} />
        <Legend color="bg-rose-500" label="Challenging" n={challenging} pct={pct(challenging)} />
      </div>
    </div>
  );
}

function Legend({ color, label, n, pct }: { color: string; label: string; n: number; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-veda-ink/80">{label}</span>
      <span className="ml-auto text-veda-subtle">{n} · {pct}%</span>
    </div>
  );
}
