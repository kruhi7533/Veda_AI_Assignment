'use client';
import { ChevronDown, X } from 'lucide-react';
import { QUESTION_TYPE_LABELS, type QuestionTypeKey, type QuestionTypeSpec } from '@/types';
import { Stepper2Counter } from './Stepper2Counter';

interface Props {
  value: QuestionTypeSpec;
  onChange: (q: QuestionTypeSpec) => void;
  onRemove: () => void;
  usedTypes: QuestionTypeKey[];
}

const ALL_TYPES: QuestionTypeKey[] = [
  'multiple_choice',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_in_the_blank',
  'diagram_based',
  'numerical',
];

export function QuestionTypeRow({ value, onChange, onRemove, usedTypes }: Props) {
  const available = ALL_TYPES.filter(
    (t) => t === value.type || !usedTypes.includes(t)
  );

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2">
      <div className="relative">
        <select
          value={value.type}
          onChange={(e) =>
            onChange({ ...value, type: e.target.value as QuestionTypeKey })
          }
          className="veda-input pr-9 appearance-none cursor-pointer"
        >
          {available.map((t) => (
            <option key={t} value={t}>
              {QUESTION_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-veda-subtle pointer-events-none" />
      </div>

      <button
        type="button"
        aria-label="Remove type"
        onClick={onRemove}
        className="w-8 h-8 grid place-items-center rounded-md hover:bg-veda-muted text-veda-subtle"
      >
        <X className="w-4 h-4" />
      </button>

      <Stepper2Counter
        value={value.count}
        onChange={(n) => onChange({ ...value, count: n })}
        min={1}
        max={50}
      />
      <Stepper2Counter
        value={value.marksPerQuestion}
        onChange={(n) => onChange({ ...value, marksPerQuestion: n })}
        min={1}
        max={50}
      />
    </div>
  );
}
