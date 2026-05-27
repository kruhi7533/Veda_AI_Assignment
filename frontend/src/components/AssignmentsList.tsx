'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';
import { useAssignmentSocket } from '@/hooks/useAssignmentSocket';
import { AssignmentCard } from './AssignmentCard';
import { EmptyAssignments } from './EmptyAssignments';

export function AssignmentsList() {
  const {
    assignments,
    loadingList,
    fetchList,
    removeAssignment,
  } = useAssignmentStore();
  const [query, setQuery] = useState('');

  useAssignmentSocket(); // subscribe to global updates

  useEffect(() => {
    fetchList().catch((e) => toast.error(e.message));
  }, [fetchList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.className.toLowerCase().includes(q)
    );
  }, [assignments, query]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      removeAssignment(id);
      toast.success('Assignment deleted');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (loadingList && assignments.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <SectionHeader />
          <EmptyAssignments />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="bg-white rounded-2xl shadow-card p-6 relative">
        <SectionHeader />

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button className="veda-btn-ghost h-9 !py-1.5 !px-3 text-xs">
            <Filter className="w-3.5 h-3.5" />
            Filter By
          </button>
          <div className="flex-1 min-w-[200px]" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-veda-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Assignment"
              className="veda-input pl-9 h-9 !py-1.5 w-72"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {filtered.map((a) => (
            <AssignmentCard
              key={a._id}
              assignment={a}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Link href="/assignments/new" className="veda-btn-primary">
            <Plus className="w-4 h-4" />
            Create Assignment
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      <div>
        <h1 className="text-lg font-semibold leading-tight">Assignments</h1>
        <p className="text-[12px] text-veda-subtle">
          Manage and create assignments for your classes.
        </p>
      </div>
    </div>
  );
}
