'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Loader2 } from 'lucide-react';
import type { Assignment } from '@/types';
import { formatDate } from '@/lib/utils';

interface Props {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

export function AssignmentCard({ assignment, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const inProgress =
    assignment.status === 'queued' || assignment.status === 'processing';

  return (
    <div className="bg-white rounded-2xl border border-veda-border p-5 hover:shadow-soft transition relative">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/assignments/${assignment._id}`}
          className="flex-1 min-w-0"
        >
          <h3 className="text-[15px] font-semibold text-veda-ink underline-offset-4 hover:underline truncate">
            {assignment.title}
          </h3>
        </Link>
        <div ref={ref} className="relative">
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="w-7 h-7 grid place-items-center rounded-md hover:bg-veda-muted transition"
          >
            <MoreVertical className="w-4 h-4 text-veda-subtle" />
          </button>
          {open && (
            <div className="absolute right-0 top-8 z-10 w-44 bg-white border border-veda-border rounded-xl shadow-card p-1">
              <Link
                href={`/assignments/${assignment._id}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-veda-muted"
                onClick={() => setOpen(false)}
              >
                View Assignment
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  if (confirm('Delete this assignment?')) onDelete(assignment._id);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-rose-50 text-rose-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between text-[12px] text-veda-subtle">
        <span>
          <span className="font-semibold text-veda-ink/70">Assigned on</span>{' '}
          : {formatDate(assignment.createdAt)}
        </span>
        <span>
          <span className="font-semibold text-veda-ink/70">Due</span> :{' '}
          {formatDate(assignment.dueDate)}
        </span>
      </div>

      {inProgress && (
        <div className="mt-3 flex items-center gap-2 text-xs text-veda-accent">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {assignment.status === 'queued' ? 'Queued' : 'Generating...'}
        </div>
      )}
      {assignment.status === 'failed' && (
        <div className="mt-3 text-xs text-rose-500">
          Failed: {assignment.error ?? 'Unknown error'}
        </div>
      )}
    </div>
  );
}
