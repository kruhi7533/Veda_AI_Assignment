interface Props {
  completed: number;
  inProgress: number;
  failed: number;
}

export function StatusDonut({ completed, inProgress, failed }: Props) {
  const total = completed + inProgress + failed;
  const items = [
    { value: completed, color: '#10B981', label: 'Completed' },
    { value: inProgress, color: '#F59E0B', label: 'In Progress' },
    { value: failed, color: '#EF4444', label: 'Failed' },
  ];

  const radius = 56;
  const circ = 2 * Math.PI * radius;

  let offset = 0;
  const segments = items.map((item) => {
    const frac = total === 0 ? 0 : item.value / total;
    const dash = circ * frac;
    const seg = (
      <circle
        key={item.label}
        cx="64"
        cy="64"
        r={radius}
        fill="none"
        stroke={item.color}
        strokeWidth="14"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        transform="rotate(-90 64 64)"
        strokeLinecap="butt"
      />
    );
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#F0F0F0" strokeWidth="14" />
          {total > 0 && segments}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xl font-bold">{total}</div>
            <div className="text-[10px] text-veda-subtle">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 text-sm">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: it.color }} />
            <span className="text-veda-ink/80">{it.label}</span>
            <span className="ml-auto font-semibold">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
