'use client';
import { useEffect, useState } from 'react';
import {
  User,
  School,
  Bell,
  Sliders,
  Server,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';

const LS_KEY = 'vedaai_settings_v1';

interface SettingsState {
  teacherName: string;
  teacherEmail: string;
  schoolName: string;
  schoolLocation: string;
  defaultClass: string;
  defaultSubject: string;
  difficultyEasyPct: number;
  difficultyModeratePct: number;
  difficultyChallengingPct: number;
  notifyOnComplete: boolean;
  notifyOnFail: boolean;
}

const DEFAULTS: SettingsState = {
  teacherName: 'Ruhi',
  teacherEmail: 'ruhi@example.com',
  schoolName: 'St. Xaviers High School',
  schoolLocation: 'Lucknow',
  defaultClass: '7th',
  defaultSubject: 'Science',
  difficultyEasyPct: 40,
  difficultyModeratePct: 40,
  difficultyChallengingPct: 20,
  notifyOnComplete: true,
  notifyOnFail: true,
};

function loadSettings(): SettingsState {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsPage() {
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const [health, setHealth] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    setS(loadSettings());
    fetch(`${API_URL}/health`)
      .then((r) => (r.ok ? setHealth('ok') : setHealth('fail')))
      .catch(() => setHealth('fail'));
  }, []);

  const save = () => {
    const sum =
      s.difficultyEasyPct + s.difficultyModeratePct + s.difficultyChallengingPct;
    if (sum !== 100) {
      toast.error(`Difficulty percentages must sum to 100 (currently ${sum})`);
      return;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    toast.success('Settings saved');
  };

  const reset = () => {
    if (!confirm('Reset all settings to defaults?')) return;
    setS(DEFAULTS);
    localStorage.removeItem(LS_KEY);
    toast.success('Settings reset');
  };

  return (
    <div className="p-3 space-y-4">
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">Settings</h1>
            <p className="text-[12px] text-veda-subtle">
              Customize your VedaAI experience.
            </p>
          </div>
        </div>
      </div>

      <Card icon={User} title="Profile">
        <Grid2>
          <Field label="Full Name">
            <input className="veda-input" value={s.teacherName} onChange={(e) => setS({ ...s, teacherName: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="veda-input" value={s.teacherEmail} onChange={(e) => setS({ ...s, teacherEmail: e.target.value })} />
          </Field>
        </Grid2>
      </Card>

      <Card icon={School} title="School">
        <Grid2>
          <Field label="School Name">
            <input className="veda-input" value={s.schoolName} onChange={(e) => setS({ ...s, schoolName: e.target.value })} />
          </Field>
          <Field label="Location">
            <input className="veda-input" value={s.schoolLocation} onChange={(e) => setS({ ...s, schoolLocation: e.target.value })} />
          </Field>
        </Grid2>
      </Card>

      <Card icon={Sliders} title="Generation Preferences">
        <Grid2>
          <Field label="Default Class">
            <input className="veda-input" value={s.defaultClass} onChange={(e) => setS({ ...s, defaultClass: e.target.value })} />
          </Field>
          <Field label="Default Subject">
            <input className="veda-input" value={s.defaultSubject} onChange={(e) => setS({ ...s, defaultSubject: e.target.value })} />
          </Field>
        </Grid2>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Difficulty Mix</label>
            <span className="text-xs text-veda-subtle">
              Total: {s.difficultyEasyPct + s.difficultyModeratePct + s.difficultyChallengingPct}%
            </span>
          </div>
          <Grid3>
            <PctInput label="Easy" color="bg-emerald-500" value={s.difficultyEasyPct} onChange={(n) => setS({ ...s, difficultyEasyPct: n })} />
            <PctInput label="Moderate" color="bg-amber-500" value={s.difficultyModeratePct} onChange={(n) => setS({ ...s, difficultyModeratePct: n })} />
            <PctInput label="Challenging" color="bg-rose-500" value={s.difficultyChallengingPct} onChange={(n) => setS({ ...s, difficultyChallengingPct: n })} />
          </Grid3>
        </div>
      </Card>

      <Card icon={Bell} title="Notifications">
        <Toggle
          label="Notify me when an assignment finishes generating"
          checked={s.notifyOnComplete}
          onChange={(v) => setS({ ...s, notifyOnComplete: v })}
        />
        <Toggle
          label="Notify me on generation failures"
          checked={s.notifyOnFail}
          onChange={(v) => setS({ ...s, notifyOnFail: v })}
        />
      </Card>

      <Card icon={Server} title="System Status">
        <div className="space-y-2">
          <StatusRow label="API server" url={API_URL} state={health} />
          <p className="text-[11px] text-veda-subtle mt-3">
            Backend health endpoint is hit live every time you open this page.
            MongoDB, Redis, and the BullMQ worker should all be up — check your
            VS Code terminals if anything looks red.
          </p>
        </div>
      </Card>

      <div className="bg-white rounded-2xl shadow-card p-5 flex items-center justify-between flex-wrap gap-3">
        <button onClick={reset} className="veda-btn-ghost">Reset to defaults</button>
        <button onClick={save} className="veda-btn-primary">
          <Check className="w-4 h-4" /> Save changes
        </button>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="text-base font-semibold inline-flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-veda-accent" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-veda-ink/70 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{children}</div>;
}

function PctInput({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <label className="text-xs font-medium text-veda-ink/80">{label}</label>
      </div>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
          className="veda-input pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-veda-subtle">%</span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition ${checked ? 'bg-veda-accent' : 'bg-veda-border'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </button>
    </label>
  );
}

function StatusRow({
  label,
  url,
  state,
}: {
  label: string;
  url: string;
  state: 'checking' | 'ok' | 'fail';
}) {
  const styles = {
    checking: { icon: Loader2, color: 'text-veda-subtle', text: 'Checking...', spin: true },
    ok: { icon: Check, color: 'text-emerald-600', text: 'Connected', spin: false },
    fail: { icon: AlertCircle, color: 'text-rose-600', text: 'Unreachable', spin: false },
  }[state];
  const Icon = styles.icon;
  return (
    <div className="flex items-center justify-between py-2 border-b border-veda-border/60 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-veda-subtle">{url}</div>
      </div>
      <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${styles.color}`}>
        <Icon className={`w-4 h-4 ${styles.spin ? 'animate-spin' : ''}`} />
        {styles.text}
      </div>
    </div>
  );
}
