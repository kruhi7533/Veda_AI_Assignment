'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  GraduationCap,
  HelpCircle,
  Sparkles,
  Trophy,
  Users,
  Wrench,
  Library,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { DashboardStats } from '@/types';
import { StatCard } from './StatCard';
import { DifficultyBar } from './DifficultyBar';
import { StatusDonut } from './StatusDonut';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .dashboardStats()
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-3 grid place-items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto text-veda-subtle animate-spin" />
          <p className="text-sm text-veda-subtle mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div className="p-3 space-y-4">
      {/* Hero */}
      <section className="bg-gradient-to-br from-veda-ink to-zinc-800 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,138,61,0.4),transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-orange-300 font-medium">
              Good day, Ruhi
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              Welcome back to VedaAI
            </h1>
            <p className="text-white/70 text-sm mt-2 max-w-lg">
              Generate exam papers, plan lessons, build rubrics — all powered
              by AI. Start by creating a new assignment or explore the toolkit.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/assignments/new" className="veda-btn-accent">
              <Sparkles className="w-4 h-4" />
              Create Assignment
            </Link>
            <Link
              href="/toolkit"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-5 py-2.5 rounded-full transition"
            >
              <Wrench className="w-4 h-4" /> Open Toolkit
            </Link>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          label="Assignments"
          value={stats.counts.assignments}
          accent="orange"
        />
        <StatCard
          icon={HelpCircle}
          label="Questions Generated"
          value={stats.counts.totalQuestions}
          accent="blue"
        />
        <StatCard
          icon={Trophy}
          label="Total Marks Created"
          value={stats.counts.totalMarks}
          accent="violet"
        />
        <StatCard
          icon={Users}
          label="Class Groups"
          value={stats.counts.groups}
          accent="emerald"
        />
      </section>

      {/* Charts + Recent */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-veda-border p-5">
          <h3 className="text-sm font-semibold mb-4">Assignment Status</h3>
          <StatusDonut
            completed={stats.counts.completed}
            inProgress={stats.counts.queuedOrProcessing}
            failed={stats.counts.failed}
          />
        </div>

        <div className="bg-white rounded-2xl border border-veda-border p-5 lg:col-span-2">
          <DifficultyBar
            easy={stats.difficulty.easy}
            moderate={stats.difficulty.moderate}
            challenging={stats.difficulty.challenging}
          />
          {stats.subjectBreakdown.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-3">By Subject</h3>
              <div className="space-y-2">
                {stats.subjectBreakdown.slice(0, 5).map((s) => {
                  const max = stats.subjectBreakdown[0].count || 1;
                  return (
                    <div key={s.subject} className="flex items-center gap-3">
                      <span className="text-xs w-28 truncate text-veda-ink/80">
                        {s.subject}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-veda-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-veda-accent to-veda-accent2"
                          style={{ width: `${(s.count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-veda-subtle w-6 text-right">
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent + quick links */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-veda-border p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent Assignments</h3>
            <Link
              href="/assignments"
              className="text-xs text-veda-accent hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-veda-subtle">
              No assignments yet. Create your first one.
            </div>
          ) : (
            <ul className="divide-y divide-veda-border/60">
              {stats.recent.map((a) => (
                <li key={a._id}>
                  <Link
                    href={`/assignments/${a._id}`}
                    className="flex items-center gap-3 py-3 hover:bg-veda-muted/50 rounded-lg px-2 -mx-2 transition"
                  >
                    <div className="w-9 h-9 rounded-lg bg-veda-muted grid place-items-center">
                      <FileText className="w-4 h-4 text-veda-ink/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-[11px] text-veda-subtle">
                        {a.subject} · Class {a.className} ·{' '}
                        {a.totalQuestions} Qs · {a.totalMarks} marks
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={a.status} />
                      <div className="text-[11px] text-veda-subtle mt-1">
                        {formatDate(a.createdAt)}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gradient-to-br from-veda-accent to-veda-accent2 text-white rounded-2xl p-5">
          <Sparkles className="w-7 h-7" />
          <h3 className="text-base font-semibold mt-3">Explore the AI Toolkit</h3>
          <p className="text-sm text-white/80 mt-1">
            Concept explainers, lesson plans, and grading rubrics — generated
            on demand by Gemini.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <QuickLink href="/toolkit" icon={Wrench} label="Open Toolkit" />
            <QuickLink href="/my-groups" icon={GraduationCap} label="Manage Groups" />
            <QuickLink href="/library" icon={Library} label="My Library" />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: DashboardStats['recent'][number]['status'] }) {
  const map: Record<typeof status, string> = {
    pending: 'bg-zinc-100 text-zinc-700',
    queued: 'bg-amber-100 text-amber-700',
    processing: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${map[status]}`}>
      {status}
    </span>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Wrench;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 bg-white/15 hover:bg-white/25 backdrop-blur rounded-xl px-3 py-2 text-sm font-medium transition"
    >
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
