import type {
  Assignment,
  DashboardStats,
  ExplainResult,
  Group,
  LessonPlanResult,
  RubricResult,
} from '@/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.error ?? msg;
      if (data?.details) {
        msg += ': ' + JSON.stringify(data.details);
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async listAssignments(): Promise<Assignment[]> {
    const res = await fetch(`${API_URL}/api/assignments`, {
      cache: 'no-store',
    });
    return handle<Assignment[]>(res);
  },

  async getAssignment(id: string): Promise<Assignment> {
    const res = await fetch(`${API_URL}/api/assignments/${id}`, {
      cache: 'no-store',
    });
    return handle<Assignment>(res);
  },

  async createAssignment(form: FormData): Promise<Assignment> {
    const res = await fetch(`${API_URL}/api/assignments`, {
      method: 'POST',
      body: form,
    });
    return handle<Assignment>(res);
  },

  async deleteAssignment(id: string): Promise<{ ok: true }> {
    const res = await fetch(`${API_URL}/api/assignments/${id}`, {
      method: 'DELETE',
    });
    return handle<{ ok: true }>(res);
  },

  async regenerateAssignment(id: string): Promise<Assignment> {
    const res = await fetch(`${API_URL}/api/assignments/${id}/regenerate`, {
      method: 'POST',
    });
    return handle<Assignment>(res);
  },

  async toggleFavorite(id: string): Promise<{ ok: true; isFavorite: boolean }> {
    const res = await fetch(`${API_URL}/api/assignments/${id}/favorite`, {
      method: 'POST',
    });
    return handle<{ ok: true; isFavorite: boolean }>(res);
  },

  pdfUrl(id: string): string {
    return `${API_URL}/api/assignments/${id}/pdf`;
  },

  // Dashboard stats
  async dashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_URL}/api/stats/dashboard`, {
      cache: 'no-store',
    });
    return handle<DashboardStats>(res);
  },

  // Groups
  async listGroups(): Promise<Group[]> {
    const res = await fetch(`${API_URL}/api/groups`, { cache: 'no-store' });
    return handle<Group[]>(res);
  },
  async createGroup(payload: Partial<Group>): Promise<Group> {
    const res = await fetch(`${API_URL}/api/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handle<Group>(res);
  },
  async updateGroup(id: string, payload: Partial<Group>): Promise<Group> {
    const res = await fetch(`${API_URL}/api/groups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handle<Group>(res);
  },
  async deleteGroup(id: string): Promise<{ ok: true }> {
    const res = await fetch(`${API_URL}/api/groups/${id}`, { method: 'DELETE' });
    return handle<{ ok: true }>(res);
  },

  // Toolkit
  async toolkitExplain(payload: {
    concept: string;
    className: string;
  }): Promise<ExplainResult> {
    const res = await fetch(`${API_URL}/api/toolkit/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handle<ExplainResult>(res);
  },
  async toolkitLessonPlan(payload: {
    topic: string;
    subject: string;
    className: string;
    durationMinutes: number;
  }): Promise<LessonPlanResult> {
    const res = await fetch(`${API_URL}/api/toolkit/lesson-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handle<LessonPlanResult>(res);
  },
  async toolkitRubric(payload: {
    assignmentDescription: string;
    totalPoints: number;
  }): Promise<RubricResult> {
    const res = await fetch(`${API_URL}/api/toolkit/rubric`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handle<RubricResult>(res);
  },
};

export { API_URL };
