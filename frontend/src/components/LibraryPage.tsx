'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  BookmarkCheck,
  FileText,
  Star,
  Wand2,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Assignment } from '@/types';
import { useAssignmentStore } from '@/store/assignmentStore';

interface Template {
  id: string;
  title: string;
  subject: string;
  className: string;
  description: string;
  questionTypes: { type: any; count: number; marksPerQuestion: number }[];
}

const TEMPLATES: Template[] = [
  {
    id: 'mcq-quick-quiz',
    title: 'Quick MCQ Quiz',
    subject: 'Science',
    className: '7th',
    description: '10 MCQs · 1 mark each · 10 marks total. Great for daily revision.',
    questionTypes: [
      { type: 'multiple_choice', count: 10, marksPerQuestion: 1 },
    ],
  },
  {
    id: 'unit-test',
    title: 'Standard Unit Test',
    subject: 'Mathematics',
    className: '8th',
    description: '20 mixed questions · 40 marks. Balanced unit assessment.',
    questionTypes: [
      { type: 'multiple_choice', count: 8, marksPerQuestion: 1 },
      { type: 'short_answer', count: 8, marksPerQuestion: 2 },
      { type: 'long_answer', count: 4, marksPerQuestion: 4 },
    ],
  },
  {
    id: 'final-exam',
    title: 'Final Exam — Comprehensive',
    subject: 'English',
    className: '9th',
    description: '25 questions · 80 marks · 3 hour exam.',
    questionTypes: [
      { type: 'multiple_choice', count: 10, marksPerQuestion: 1 },
      { type: 'short_answer', count: 8, marksPerQuestion: 3 },
      { type: 'long_answer', count: 5, marksPerQuestion: 6 },
      { type: 'fill_in_the_blank', count: 2, marksPerQuestion: 8 },
    ],
  },
  {
    id: 'concept-check',
    title: 'Concept Check',
    subject: 'Social Studies',
    className: '6th',
    description: '5 short + 5 true/false. Light 15-min check-in.',
    questionTypes: [
      { type: 'short_answer', count: 5, marksPerQuestion: 2 },
      { type: 'true_false', count: 5, marksPerQuestion: 1 },
    ],
  },
];

export function LibraryPage() {
  const router = useRouter();
  const setDraft = useAssignmentStore((s) => s.setDraft);
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listAssignments()
      .then(setItems)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const favorites = useMemo(
    () => items.filter((a) => a.isFavorite),
    [items]
  );

  const handleUseTemplate = (t: Template) => {
    setDraft({
      title: t.title,
      subject: t.subject,
      className: t.className,
      questionTypes: t.questionTypes,
      additionalInstructions: '',
      file: null,
    });
    toast.success(`Template "${t.title}" loaded`);
    router.push('/assignments/new');
  };

  const handleUnfavorite = async (id: string) => {
    try {
      const r = await api.toggleFavorite(id);
      setItems((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isFavorite: r.isFavorite } : a))
      );
      toast.success('Removed from library');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">My Library</h1>
            <p className="text-[12px] text-veda-subtle">
              Your favourite assignments and ready-to-use templates.
            </p>
          </div>
        </div>
      </div>

      {/* Favorites */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold inline-flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-veda-accent" />
            Saved Assignments
            <span className="text-xs text-veda-subtle font-normal ml-1">
              ({favorites.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-veda-muted animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-10">
            <Bookmark className="w-10 h-10 text-veda-subtle mx-auto" strokeWidth={1.5} />
            <h3 className="mt-3 text-base font-semibold">Nothing saved yet</h3>
            <p className="text-sm text-veda-subtle mt-1 max-w-md mx-auto">
              Open any completed assignment and click the bookmark icon to add it here for quick access later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favorites.map((a) => (
              <div
                key={a._id}
                className="bg-white border border-veda-border rounded-xl p-4 hover:shadow-soft transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/assignments/${a._id}`} className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate hover:underline">
                      {a.title}
                    </h3>
                    <p className="text-[11px] text-veda-subtle mt-0.5">
                      {a.subject} · Class {a.className} · {a.totalQuestions} Qs · {a.totalMarks} marks
                    </p>
                  </Link>
                  <button
                    onClick={() => handleUnfavorite(a._id)}
                    className="w-7 h-7 grid place-items-center rounded-md text-veda-accent hover:bg-orange-50"
                    aria-label="Remove from library"
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <div className="mt-3 text-[11px] text-veda-subtle">
                  Saved on {formatDate(a.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold inline-flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-veda-accent" />
            Quick-Start Templates
          </h2>
          <span className="text-xs text-veda-subtle">
            One-click setup, then customise
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEMPLATES.map((t) => {
            const totalQ = t.questionTypes.reduce((s, q) => s + q.count, 0);
            const totalM = t.questionTypes.reduce(
              (s, q) => s + q.count * q.marksPerQuestion,
              0
            );
            return (
              <button
                key={t.id}
                onClick={() => handleUseTemplate(t)}
                className="text-left bg-veda-muted/40 hover:bg-veda-muted border border-veda-border rounded-xl p-4 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-veda-border grid place-items-center">
                    <FileText className="w-4 h-4 text-veda-ink/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{t.title}</h3>
                    <p className="text-[11px] text-veda-subtle mt-0.5">
                      {t.subject} · Class {t.className} · {totalQ} Qs · {totalM} marks
                    </p>
                    <p className="text-xs text-veda-ink/70 mt-2">{t.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-veda-subtle group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
