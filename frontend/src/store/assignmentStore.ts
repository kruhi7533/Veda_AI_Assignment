import { create } from 'zustand';
import type { Assignment, QuestionTypeSpec } from '@/types';
import { api } from '@/lib/api';

interface DraftState {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  additionalInstructions: string;
  file: File | null;
}

interface State {
  assignments: Assignment[];
  current: Assignment | null;
  loadingList: boolean;
  loadingCurrent: boolean;
  generationProgress: { progress: number; message?: string } | null;

  draft: DraftState;

  // List
  fetchList: () => Promise<void>;
  setAssignments: (a: Assignment[]) => void;
  upsertAssignment: (a: Assignment) => void;
  removeAssignment: (id: string) => void;

  // Current
  fetchOne: (id: string) => Promise<void>;
  setCurrent: (a: Assignment | null) => void;
  setGenerationProgress: (
    p: { progress: number; message?: string } | null
  ) => void;

  // Draft
  setDraft: (patch: Partial<DraftState>) => void;
  resetDraft: () => void;
  upsertQuestionType: (q: QuestionTypeSpec, index?: number) => void;
  removeQuestionType: (index: number) => void;
}

const emptyDraft: DraftState = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: [
    { type: 'multiple_choice', count: 4, marksPerQuestion: 1 },
    { type: 'short_answer', count: 3, marksPerQuestion: 2 },
  ],
  additionalInstructions: '',
  file: null,
};

export const useAssignmentStore = create<State>((set, get) => ({
  assignments: [],
  current: null,
  loadingList: false,
  loadingCurrent: false,
  generationProgress: null,
  draft: { ...emptyDraft },

  fetchList: async () => {
    set({ loadingList: true });
    try {
      const items = await api.listAssignments();
      set({ assignments: items });
    } finally {
      set({ loadingList: false });
    }
  },

  setAssignments: (a) => set({ assignments: a }),

  upsertAssignment: (a) =>
    set((s) => {
      const i = s.assignments.findIndex((x) => x._id === a._id);
      if (i === -1) return { assignments: [a, ...s.assignments] };
      const next = [...s.assignments];
      next[i] = a;
      return { assignments: next };
    }),

  removeAssignment: (id) =>
    set((s) => ({ assignments: s.assignments.filter((x) => x._id !== id) })),

  fetchOne: async (id) => {
    set({ loadingCurrent: true });
    try {
      const a = await api.getAssignment(id);
      set({ current: a });
    } finally {
      set({ loadingCurrent: false });
    }
  },

  setCurrent: (a) => set({ current: a }),

  setGenerationProgress: (p) => set({ generationProgress: p }),

  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

  resetDraft: () => set({ draft: { ...emptyDraft } }),

  upsertQuestionType: (q, index) =>
    set((s) => {
      const list = [...s.draft.questionTypes];
      if (index === undefined) {
        list.push(q);
      } else {
        list[index] = q;
      }
      return { draft: { ...s.draft, questionTypes: list } };
    }),

  removeQuestionType: (index) =>
    set((s) => {
      const list = s.draft.questionTypes.filter((_, i) => i !== index);
      return { draft: { ...s.draft, questionTypes: list } };
    }),
}));
