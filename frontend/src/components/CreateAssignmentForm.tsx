'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Mic,
  MicOff,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import {
  QUESTION_TYPE_LABELS,
  type QuestionTypeKey,
  type QuestionTypeSpec,
} from '@/types';
import { Stepper } from './Stepper';
import { FileUpload } from './FileUpload';
import { QuestionTypeRow } from './QuestionTypeRow';
import { useVoiceInput } from '@/hooks/useVoiceInput';

const ALL_TYPES: QuestionTypeKey[] = [
  'multiple_choice',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_in_the_blank',
  'diagram_based',
  'numerical',
];

export function CreateAssignmentForm() {
  const router = useRouter();
  const { draft, setDraft, upsertQuestionType, removeQuestionType, resetDraft } =
    useAssignmentStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Voice-to-text for the Additional Information field
  const baseTextRef = useRef<string>('');
  const voice = useVoiceInput({
    onResult: (text, isFinal) => {
      const base = baseTextRef.current;
      const sep = base && !base.endsWith(' ') ? ' ' : '';
      const next = (base + sep + text).trimStart();
      setDraft({ additionalInstructions: next });
      if (isFinal) {
        baseTextRef.current = next;
      }
    },
  });

  useEffect(() => {
    if (!voice.listening) {
      baseTextRef.current = draft.additionalInstructions;
    }
  }, [voice.listening, draft.additionalInstructions]);

  useEffect(() => {
    if (voice.error) {
      toast.error(`Voice input: ${voice.error}`);
    }
  }, [voice.error]);

  const totalQuestions = useMemo(
    () => draft.questionTypes.reduce((s, q) => s + (q.count || 0), 0),
    [draft.questionTypes]
  );
  const totalMarks = useMemo(
    () =>
      draft.questionTypes.reduce(
        (s, q) => s + (q.count || 0) * (q.marksPerQuestion || 0),
        0
      ),
    [draft.questionTypes]
  );

  const usedTypes = draft.questionTypes.map((q) => q.type);

  const canAddQType = ALL_TYPES.some((t) => !usedTypes.includes(t));

  const validateStep1 = (): string | null => {
    if (!draft.dueDate) return 'Due date is required';
    if (new Date(draft.dueDate) < new Date(new Date().toDateString()))
      return 'Due date cannot be in the past';
    if (draft.questionTypes.length === 0)
      return 'Add at least one question type';
    for (const q of draft.questionTypes) {
      if (!q.count || q.count <= 0) return 'Question count must be > 0';
      if (!q.marksPerQuestion || q.marksPerQuestion <= 0)
        return 'Marks must be > 0';
    }
    return null;
  };

  const validateStep2 = (): string | null => {
    if (!draft.title.trim()) return 'Assignment title is required';
    if (!draft.subject.trim()) return 'Subject is required';
    if (!draft.className.trim()) return 'Class is required';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) return toast.error(err);
    setStep(2);
  };

  const handleSubmit = async () => {
    const e1 = validateStep1();
    if (e1) return toast.error(e1);
    const e2 = validateStep2();
    if (e2) return toast.error(e2);

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', draft.title);
      form.append('subject', draft.subject);
      form.append('className', draft.className);
      form.append('dueDate', new Date(draft.dueDate).toISOString());
      form.append('questionTypes', JSON.stringify(draft.questionTypes));
      if (draft.additionalInstructions) {
        form.append('additionalInstructions', draft.additionalInstructions);
      }
      if (draft.file) form.append('file', draft.file);

      const created = await api.createAssignment(form);
      toast.success('Assignment queued for generation');
      resetDraft();
      router.push(`/assignments/${created._id}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-3">
      <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Create Assignment
            </h1>
            <p className="text-[12px] text-veda-subtle">
              Set up a new assignment for your students
            </p>
          </div>
        </div>

        <div className="mt-5">
          <Stepper step={step} />
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-[15px] font-semibold">Assignment Details</h2>
              <p className="text-xs text-veda-subtle">
                Basic information about your assignment
              </p>
            </div>

            <FileUpload
              value={draft.file}
              onChange={(f) => setDraft({ file: f })}
            />
            <p className="text-center text-[11px] text-veda-subtle -mt-3">
              Upload images of your preferred document/image
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft({ dueDate: e.target.value })}
                  className="veda-input pr-12"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-veda-subtle pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-[1fr_auto_120px_120px] gap-3 text-xs text-veda-subtle font-medium mb-1 px-1">
                <span>Question Type</span>
                <span />
                <span className="text-center">No. of Questions</span>
                <span className="text-center">Marks</span>
              </div>
              <div className="divide-y divide-veda-border/60">
                {draft.questionTypes.map((q, i) => (
                  <QuestionTypeRow
                    key={i}
                    value={q}
                    onChange={(next) => upsertQuestionType(next, i)}
                    onRemove={() => removeQuestionType(i)}
                    usedTypes={usedTypes}
                  />
                ))}
              </div>

              {canAddQType && (
                <button
                  type="button"
                  onClick={() => {
                    const next = ALL_TYPES.find((t) => !usedTypes.includes(t));
                    if (!next) return;
                    upsertQuestionType({
                      type: next,
                      count: 3,
                      marksPerQuestion: 2,
                    });
                  }}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full bg-veda-ink text-white hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Question Type
                </button>
              )}

              <div className="mt-4 flex flex-col items-end text-sm">
                <div>
                  <span className="text-veda-subtle">Total Questions :</span>{' '}
                  <span className="font-semibold">{totalQuestions}</span>
                </div>
                <div>
                  <span className="text-veda-subtle">Total Marks :</span>{' '}
                  <span className="font-semibold">{totalMarks}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Information{' '}
                <span className="text-veda-subtle font-normal">
                  (For better output)
                </span>
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={draft.additionalInstructions}
                  onChange={(e) =>
                    setDraft({ additionalInstructions: e.target.value })
                  }
                  placeholder={
                    voice.listening
                      ? 'Listening... speak now'
                      : 'e.g Generate a question paper for 3 hour exam duration...'
                  }
                  className="veda-input resize-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!voice.supported) {
                      toast.error(
                        'Voice input is not supported in this browser. Use Chrome or Edge.'
                      );
                      return;
                    }
                    voice.toggle();
                  }}
                  aria-label={voice.listening ? 'Stop voice input' : 'Start voice input'}
                  title={
                    !voice.supported
                      ? 'Not supported in this browser'
                      : voice.listening
                        ? 'Click to stop recording'
                        : 'Click to dictate'
                  }
                  className={
                    'absolute right-3 bottom-3 w-8 h-8 rounded-full grid place-items-center transition ' +
                    (voice.listening
                      ? 'bg-rose-500 text-white shadow-glow animate-pulse'
                      : voice.supported
                        ? 'bg-white border border-veda-border text-veda-ink hover:bg-veda-muted'
                        : 'bg-veda-muted text-veda-subtle cursor-not-allowed')
                  }
                >
                  {voice.listening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>
                {voice.listening && (
                  <div className="absolute left-3 bottom-3 flex items-center gap-1.5 text-[11px] text-rose-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Recording...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <h2 className="text-[15px] font-semibold">Final Details</h2>
              <p className="text-xs text-veda-subtle">
                Give your assignment a title and target class
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Assignment Title
              </label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ title: e.target.value })}
                placeholder="e.g. Quiz on Electricity"
                className="veda-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  value={draft.subject}
                  onChange={(e) => setDraft({ subject: e.target.value })}
                  placeholder="e.g. Science"
                  className="veda-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
                <input
                  value={draft.className}
                  onChange={(e) => setDraft({ className: e.target.value })}
                  placeholder="e.g. 8th"
                  className="veda-input"
                />
              </div>
            </div>

            <div className="bg-veda-muted/60 rounded-xl p-4 text-sm">
              <div className="font-medium mb-2">Summary</div>
              <ul className="text-veda-subtle space-y-1">
                <li>
                  <strong className="text-veda-ink">Total Questions:</strong>{' '}
                  {totalQuestions}
                </li>
                <li>
                  <strong className="text-veda-ink">Total Marks:</strong>{' '}
                  {totalMarks}
                </li>
                <li>
                  <strong className="text-veda-ink">Due Date:</strong>{' '}
                  {draft.dueDate || '—'}
                </li>
                <li>
                  <strong className="text-veda-ink">Question Types:</strong>{' '}
                  {draft.questionTypes
                    .map(
                      (q) =>
                        `${QUESTION_TYPE_LABELS[q.type]} (${q.count}×${q.marksPerQuestion})`
                    )
                    .join(', ')}
                </li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-veda-border">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="veda-btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="veda-btn-ghost"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          )}

          {step === 1 ? (
            <button type="button" onClick={handleNext} className="veda-btn-primary">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="veda-btn-accent"
            >
              {submitting ? 'Submitting...' : 'Generate Question Paper'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
