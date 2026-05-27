'use client';
import Link from 'next/link';
import { Plus, FileX2 } from 'lucide-react';

export function EmptyAssignments() {
  return (
    <div className="bg-gradient-to-b from-white to-veda-muted/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="relative w-44 h-44 mb-6">
        <div className="absolute inset-0 rounded-full bg-veda-muted/70 blur-xl" />
        <div className="relative w-full h-full grid place-items-center">
          <div className="w-32 h-40 bg-white rounded-2xl border border-veda-border shadow-soft relative -rotate-3">
            <div className="absolute top-4 left-4 right-12 h-2 rounded bg-veda-muted" />
            <div className="absolute top-9 left-4 right-16 h-2 rounded bg-veda-muted" />
            <FileX2 className="absolute -bottom-6 -right-6 w-14 h-14 text-rose-500 bg-white rounded-full p-2 shadow-soft" strokeWidth={1.5} />
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">No assignments yet</h2>
      <p className="text-veda-subtle text-sm max-w-md mb-6">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link href="/assignments/new" className="veda-btn-primary">
        <Plus className="w-4 h-4" />
        Create Your First Assignment
      </Link>
    </div>
  );
}
