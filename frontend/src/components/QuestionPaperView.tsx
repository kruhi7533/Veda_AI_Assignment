'use client';
import { useState } from 'react';
import { Download, RefreshCw, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Assignment } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { api } from '@/lib/api';

interface Props {
  assignment: Assignment;
  onRegenerate: () => void;
  regenerating: boolean;
}

export function QuestionPaperView({
  assignment,
  onRegenerate,
  regenerating,
}: Props) {
  const paper = assignment.generatedPaper!;
  const [favorite, setFavorite] = useState<boolean>(!!assignment.isFavorite);
  const [favoriting, setFavoriting] = useState(false);

  const handleFavorite = async () => {
    setFavoriting(true);
    try {
      const r = await api.toggleFavorite(assignment._id);
      setFavorite(r.isFavorite);
      toast.success(r.isFavorite ? 'Saved to Library' : 'Removed from Library');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFavoriting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="bg-veda-ink text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 no-print">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Sparkles className="w-5 h-5 text-veda-accent2 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">
            {paper.intro ??
              `Here is your customized Question Paper for ${paper.subject} (Class ${paper.className}).`}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:flex-shrink-0 flex-wrap">
          <button
            onClick={handleFavorite}
            disabled={favoriting}
            className={`inline-flex items-center gap-2 disabled:opacity-50 text-sm px-4 py-2 rounded-full transition ${
              favorite
                ? 'bg-veda-accent text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={favorite ? 'Saved to Library' : 'Save to Library'}
          >
            <Star className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            {favorite ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-full transition"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <a
            href={api.pdfUrl(assignment._id)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-veda-ink text-sm px-4 py-2 rounded-full hover:opacity-90 transition"
          >
            <Download className="w-4 h-4" />
            Download as PDF
          </a>
        </div>
      </div>

      {/* Paper - styled like a real exam paper */}
      <article className="bg-white rounded-2xl border border-veda-border p-8 lg:p-12 font-serif text-veda-ink">
        <header className="text-center">
          <h1 className="text-2xl font-bold">{paper.schoolName}</h1>
          <p className="mt-1 text-base">Subject: {paper.subject}</p>
          <p className="text-base">Class: {paper.className}</p>
        </header>

        <div className="mt-6 flex flex-col sm:flex-row justify-between text-sm gap-1">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.maximumMarks}</span>
        </div>

        <p className="mt-3 text-sm">{paper.generalInstructions}</p>

        <section className="mt-6 space-y-1.5 text-sm font-sans">
          <p>
            Name: <span className="inline-block min-w-[280px] border-b border-dotted border-veda-ink/60" />
          </p>
          <p>
            Roll Number:{' '}
            <span className="inline-block min-w-[220px] border-b border-dotted border-veda-ink/60" />
          </p>
          <p>
            Class: {paper.className} &nbsp;&nbsp; Section:{' '}
            <span className="inline-block min-w-[140px] border-b border-dotted border-veda-ink/60" />
          </p>
        </section>

        {paper.sections.map((section) => (
          <section key={section.id} className="mt-10">
            <h2 className="text-lg font-bold text-center">{section.title}</h2>
            <p className="text-center italic text-sm mt-1 text-veda-ink/80">
              {section.instruction}
            </p>

            <ol className="mt-5 space-y-3 list-decimal pl-6">
              {section.questions.map((q) => (
                <li key={q.id} className="text-[15px] leading-relaxed">
                  <div className="flex flex-wrap items-start gap-2">
                    <DifficultyBadge difficulty={q.difficulty} className="font-sans" />
                    <span className="flex-1 min-w-[200px]">{q.text}</span>
                    <span className="font-sans text-sm font-medium text-veda-ink/70 whitespace-nowrap">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <ol className="mt-2 pl-4 space-y-1 list-[lower-alpha] text-sm">
                      {q.options.map((opt, i) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}

        <p className="text-center font-bold mt-12">End of Question Paper</p>

        {paper.answerKey && paper.answerKey.length > 0 && (
          <section className="mt-10 pt-6 border-t border-veda-border">
            <h2 className="text-lg font-bold mb-3">Answer Key</h2>
            <ol className="space-y-1.5 list-decimal pl-6 text-sm">
              {paper.answerKey.map((a) => (
                <li key={a.questionId}>{a.answer}</li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  );
}
