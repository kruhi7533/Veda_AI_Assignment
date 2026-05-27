'use client';
import { useState } from 'react';
import {
  Brain,
  ClipboardList,
  Sparkles,
  Lightbulb,
  Loader2,
  ArrowRight,
  X,
  Clock,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  ExplainResult,
  LessonPlanResult,
  RubricResult,
} from '@/types';

type Tool = 'explain' | 'lesson' | 'rubric' | null;

export function ToolkitPage() {
  const [active, setActive] = useState<Tool>(null);

  return (
    <div className="p-3 space-y-4">
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              AI Teacher&apos;s Toolkit
            </h1>
            <p className="text-[12px] text-veda-subtle">
              Tiny AI helpers for everyday teaching — powered by Gemini.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToolCard
            icon={Lightbulb}
            title="Concept Explainer"
            description="Turn any concept into a kid-friendly explanation with examples and key terms."
            color="from-amber-400 to-orange-500"
            onClick={() => setActive('explain')}
          />
          <ToolCard
            icon={ClipboardList}
            title="Lesson Plan Generator"
            description="Get a fully-structured lesson plan in seconds — objectives, phases, homework, assessment."
            color="from-sky-400 to-blue-500"
            onClick={() => setActive('lesson')}
          />
          <ToolCard
            icon={Award}
            title="Rubric Builder"
            description="Build a complete grading rubric with criteria, weights, and performance levels."
            color="from-violet-400 to-purple-500"
            onClick={() => setActive('rubric')}
          />
        </div>
      </div>

      {active === 'explain' && (
        <ExplainTool onClose={() => setActive(null)} />
      )}
      {active === 'lesson' && (
        <LessonPlanTool onClose={() => setActive(null)} />
      )}
      {active === 'rubric' && (
        <RubricTool onClose={() => setActive(null)} />
      )}
    </div>
  );
}

function ToolCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: typeof Brain;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl border border-veda-border p-5 hover:shadow-soft hover:border-veda-accent/40 transition group"
    >
      <div
        className={`w-12 h-12 rounded-xl grid place-items-center text-white bg-gradient-to-br ${color}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="text-xs text-veda-subtle mt-1.5 leading-relaxed">{description}</p>
      <div className="mt-4 text-xs text-veda-accent font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
        Open tool <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}

// ───── Concept Explainer ─────
function ExplainTool({ onClose }: { onClose: () => void }) {
  const [concept, setConcept] = useState('');
  const [className, setClassName] = useState('7th');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const submit = async () => {
    if (!concept.trim()) return toast.error('Enter a concept');
    setLoading(true);
    setResult(null);
    try {
      const r = await api.toolkitExplain({
        concept: concept.trim(),
        className: className.trim() || '7th',
      });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel title="Concept Explainer" icon={Lightbulb} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3 mb-5">
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder='e.g. "Photosynthesis"'
          className="veda-input"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class"
          className="veda-input"
        />
        <button onClick={submit} disabled={loading} className="veda-btn-accent">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? 'Thinking...' : 'Explain'}
        </button>
      </div>

      {loading && <SkeletonBlock />}
      {result && (
        <div className="space-y-5">
          <h3 className="text-lg font-semibold">{result.title}</h3>

          <Section title="Simple Explanation" tone="emerald">
            <p className="text-sm leading-relaxed">{result.simpleExplanation}</p>
          </Section>

          <Section title="Detailed Explanation" tone="blue">
            <p className="text-sm leading-relaxed">{result.detailedExplanation}</p>
          </Section>

          <Section title="Real-World Examples" tone="orange">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {result.realWorldExamples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </Section>

          <Section title="Key Terms" tone="violet">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.keyTerms.map((kt, i) => (
                <div key={i} className="bg-veda-muted/60 rounded-lg p-3">
                  <dt className="font-semibold text-sm">{kt.term}</dt>
                  <dd className="text-xs text-veda-ink/80 mt-1">{kt.meaning}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {result.funFact && (
            <Section title="Fun Fact 🎉" tone="rose">
              <p className="text-sm italic">{result.funFact}</p>
            </Section>
          )}
        </div>
      )}
    </ToolPanel>
  );
}

// ───── Lesson Plan ─────
function LessonPlanTool({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Science');
  const [className, setClassName] = useState('7th');
  const [duration, setDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LessonPlanResult | null>(null);

  const submit = async () => {
    if (!topic.trim()) return toast.error('Enter a topic');
    setLoading(true);
    setResult(null);
    try {
      const r = await api.toolkitLessonPlan({
        topic: topic.trim(),
        subject: subject.trim(),
        className: className.trim(),
        durationMinutes: duration,
      });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel title="Lesson Plan Generator" icon={ClipboardList} onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_120px_auto] gap-3 mb-5">
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder='Topic e.g. "Force and Motion"' className="veda-input" />
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="veda-input" />
        <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class" className="veda-input" />
        <input type="number" min={15} max={240} value={duration} onChange={(e) => setDuration(Math.max(15, Math.min(240, Number(e.target.value) || 45)))} className="veda-input" />
        <button onClick={submit} disabled={loading} className="veda-btn-accent">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Planning...' : 'Generate'}
        </button>
      </div>

      {loading && <SkeletonBlock />}
      {result && (
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold">{result.title}</h3>
            <p className="text-xs text-veda-subtle mt-1">
              {result.subject} · Class {result.className} · {result.duration}
            </p>
          </div>

          <Section title="Learning Objectives" tone="emerald">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {result.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </Section>

          <Section title="Materials Needed" tone="violet">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {result.materialsNeeded.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </Section>

          <div>
            <h4 className="text-sm font-semibold mb-2">Lesson Phases</h4>
            <ol className="space-y-3">
              {result.phases.map((p, i) => (
                <li key={i} className="bg-white border border-veda-border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-sm">
                      {i + 1}. {p.name}
                    </h5>
                    <span className="inline-flex items-center gap-1 text-[11px] text-veda-subtle">
                      <Clock className="w-3 h-3" /> {p.timeMinutes} min
                    </span>
                  </div>
                  <p className="text-xs text-veda-ink/80 mt-2">{p.description}</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                    {p.activities.map((act, j) => <li key={j}>{act}</li>)}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <Section title="Homework" tone="amber">
            <p className="text-sm">{result.homework}</p>
          </Section>
          <Section title="Assessment" tone="blue">
            <p className="text-sm">{result.assessment}</p>
          </Section>
        </div>
      )}
    </ToolPanel>
  );
}

// ───── Rubric ─────
function RubricTool({ onClose }: { onClose: () => void }) {
  const [desc, setDesc] = useState('');
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RubricResult | null>(null);

  const submit = async () => {
    if (desc.trim().length < 10) return toast.error('Describe the assignment in detail');
    setLoading(true);
    setResult(null);
    try {
      const r = await api.toolkitRubric({
        assignmentDescription: desc.trim(),
        totalPoints: points,
      });
      setResult(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPanel title="Rubric Builder" icon={Award} onClose={onClose}>
      <div className="grid grid-cols-1 gap-3 mb-5">
        <textarea
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe the assignment in detail — purpose, format, what students must demonstrate..."
          className="veda-input resize-none"
        />
        <div className="grid grid-cols-[120px_auto] gap-3">
          <input
            type="number"
            min={10}
            max={200}
            value={points}
            onChange={(e) => setPoints(Math.max(10, Math.min(200, Number(e.target.value) || 100)))}
            className="veda-input"
            placeholder="Total points"
          />
          <button onClick={submit} disabled={loading} className="veda-btn-accent">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Building...' : 'Build Rubric'}
          </button>
        </div>
      </div>

      {loading && <SkeletonBlock />}
      {result && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{result.title}</h3>
            <p className="text-xs text-veda-subtle mt-1">
              Total: {result.totalPoints} points
            </p>
            <p className="text-sm mt-3">{result.description}</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-veda-border">
            <table className="w-full text-sm">
              <thead className="bg-veda-muted text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">Criterion</th>
                  <th className="px-3 py-2 font-semibold w-20 text-right">Weight</th>
                  <th className="px-3 py-2 font-semibold">Levels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-veda-border">
                {result.criteria.map((c, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3 align-top font-medium">{c.name}</td>
                    <td className="px-3 py-3 align-top text-right">{c.weight}</td>
                    <td className="px-3 py-3">
                      <ul className="space-y-1.5">
                        {c.levels.map((l, j) => (
                          <li key={j} className="text-xs">
                            <span className="font-semibold">
                              {l.label} ({l.points}):
                            </span>{' '}
                            <span className="text-veda-ink/80">{l.description}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolPanel>
  );
}

// ───── Shared helpers ─────
function ToolPanel({
  title,
  icon: Icon,
  onClose,
  children,
}: {
  title: string;
  icon: typeof Brain;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold inline-flex items-center gap-2">
          <Icon className="w-4 h-4 text-veda-accent" />
          {title}
        </h2>
        <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-md hover:bg-veda-muted">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </section>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: 'emerald' | 'blue' | 'orange' | 'violet' | 'rose' | 'amber';
  children: React.ReactNode;
}) {
  const dot: Record<typeof tone, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-sky-500',
    orange: 'bg-orange-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 inline-flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot[tone]}`} /> {title}
      </h4>
      {children}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 bg-veda-muted rounded w-2/3" />
      <div className="h-3 bg-veda-muted rounded w-3/4" />
      <div className="h-3 bg-veda-muted rounded w-1/2" />
      <div className="h-3 bg-veda-muted rounded w-5/6" />
    </div>
  );
}
