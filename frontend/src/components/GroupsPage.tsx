'use client';
import { useEffect, useState } from 'react';
import {
  Plus,
  Users,
  BookOpen,
  Trash2,
  Pencil,
  GraduationCap,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Group } from '@/types';
import { cn } from '@/lib/utils';

const COLORS = [
  { key: 'orange', cls: 'from-orange-400 to-orange-500' },
  { key: 'rose', cls: 'from-rose-400 to-rose-500' },
  { key: 'amber', cls: 'from-amber-400 to-amber-500' },
  { key: 'emerald', cls: 'from-emerald-400 to-emerald-500' },
  { key: 'sky', cls: 'from-sky-400 to-sky-500' },
  { key: 'violet', cls: 'from-violet-400 to-violet-500' },
  { key: 'pink', cls: 'from-pink-400 to-pink-500' },
  { key: 'indigo', cls: 'from-indigo-400 to-indigo-500' },
] as const;

function colorClasses(key: string): string {
  return COLORS.find((c) => c.key === key)?.cls ?? COLORS[0].cls;
}

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Group | null>(null);

  const fetchGroups = () =>
    api
      .listGroups()
      .then(setGroups)
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    fetchGroups().finally(() => setLoading(false));
  }, []);

  const handleDelete = async (g: Group) => {
    if (!confirm(`Delete group "${g.name}"?`)) return;
    try {
      await api.deleteGroup(g._id);
      toast.success('Group deleted');
      fetchGroups();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="p-3">
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div>
              <h1 className="text-lg font-semibold leading-tight">My Groups</h1>
              <p className="text-[12px] text-veda-subtle">
                Organize your classes & subjects in one place.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="veda-btn-accent"
          >
            <Plus className="w-4 h-4" /> New Group
          </button>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-veda-muted animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-10 text-center">
            <div className="inline-block bg-veda-muted/70 rounded-full p-6 mb-4">
              <GraduationCap className="w-10 h-10 text-veda-subtle" />
            </div>
            <h3 className="text-base font-semibold">No groups yet</h3>
            <p className="text-sm text-veda-subtle mt-1">
              Create your first class group to organize assignments by subject and grade.
            </p>
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="veda-btn-primary mt-5"
            >
              <Plus className="w-4 h-4" /> Create First Group
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div
                key={g._id}
                className="bg-white rounded-2xl border border-veda-border p-5 hover:shadow-soft transition relative group"
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl grid place-items-center text-white text-lg font-bold bg-gradient-to-br',
                    colorClasses(g.color)
                  )}
                >
                  {g.name.slice(0, 1).toUpperCase()}
                </div>
                <h3 className="mt-4 text-base font-semibold truncate">{g.name}</h3>
                <p className="text-xs text-veda-subtle mt-0.5">
                  {g.subject} · Class {g.className}
                </p>
                {g.description && (
                  <p className="text-xs text-veda-ink/70 mt-2 line-clamp-2">
                    {g.description}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-veda-border flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-veda-ink/80">
                    <Users className="w-3.5 h-3.5" /> {g.studentCount} students
                  </span>
                  <span className="inline-flex items-center gap-1 text-veda-ink/80">
                    <BookOpen className="w-3.5 h-3.5" /> {g.assignmentCount ?? 0} assignments
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(g);
                      setModalOpen(true);
                    }}
                    className="w-7 h-7 grid place-items-center rounded-md bg-white border border-veda-border hover:bg-veda-muted"
                    aria-label="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5 text-veda-ink/70" />
                  </button>
                  <button
                    onClick={() => handleDelete(g)}
                    className="w-7 h-7 grid place-items-center rounded-md bg-white border border-veda-border hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <GroupModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}

function GroupModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Group | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [subject, setSubject] = useState(initial?.subject ?? '');
  const [className, setClassName] = useState(initial?.className ?? '');
  const [studentCount, setStudentCount] = useState(initial?.studentCount ?? 0);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState<string>(initial?.color ?? 'orange');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !subject.trim() || !className.trim()) {
      toast.error('Name, subject and class are required');
      return;
    }
    if (studentCount < 0) {
      toast.error('Student count cannot be negative');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        subject: subject.trim(),
        className: className.trim(),
        studentCount,
        description: description.trim(),
        color,
      };
      if (initial) {
        await api.updateGroup(initial._id, payload);
        toast.success('Group updated');
      } else {
        await api.createGroup(payload);
        toast.success('Group created');
      }
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">
            {initial ? 'Edit Group' : 'New Group'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center rounded-md hover:bg-veda-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Group Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Class 7A Science" className="veda-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Science" className="veda-input" />
            </Field>
            <Field label="Class">
              <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="7th" className="veda-input" />
            </Field>
          </div>
          <Field label="Number of Students">
            <input
              type="number"
              min={0}
              value={studentCount}
              onChange={(e) => setStudentCount(Math.max(0, Number(e.target.value) || 0))}
              className="veda-input"
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="veda-input resize-none"
              placeholder="A short note about this group..."
            />
          </Field>
          <Field label="Color Tag">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  className={cn(
                    'w-8 h-8 rounded-full bg-gradient-to-br ring-2 ring-offset-2 transition',
                    c.cls,
                    color === c.key ? 'ring-veda-ink' : 'ring-transparent'
                  )}
                  aria-label={c.key}
                />
              ))}
            </div>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-veda-border">
          <button onClick={onClose} className="veda-btn-ghost">Cancel</button>
          <button onClick={submit} disabled={saving} className="veda-btn-primary">
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
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
