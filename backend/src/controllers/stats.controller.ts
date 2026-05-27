import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { Group } from '../models/Group';

interface Difficulty {
  easy: number;
  moderate: number;
  challenging: number;
}

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  const [assignments, groupCount] = await Promise.all([
    Assignment.find().lean(),
    Group.countDocuments(),
  ]);

  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const queuedOrProcessing = assignments.filter(
    (a) => a.status === 'queued' || a.status === 'processing'
  ).length;
  const failed = assignments.filter((a) => a.status === 'failed').length;

  const totalQuestions = assignments.reduce(
    (s, a) => s + (a.totalQuestions || 0),
    0
  );
  const totalMarks = assignments.reduce((s, a) => s + (a.totalMarks || 0), 0);

  const difficulty: Difficulty = { easy: 0, moderate: 0, challenging: 0 };
  const subjectMap = new Map<string, number>();

  for (const a of assignments) {
    if (a.subject) {
      subjectMap.set(a.subject, (subjectMap.get(a.subject) || 0) + 1);
    }
    if (a.generatedPaper) {
      for (const section of a.generatedPaper.sections) {
        for (const q of section.questions) {
          if (q.difficulty in difficulty) {
            difficulty[q.difficulty as keyof Difficulty]++;
          }
        }
      }
    }
  }

  const subjectBreakdown = [...subjectMap.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  const recent = assignments
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((a) => ({
      _id: a._id,
      title: a.title,
      subject: a.subject,
      className: a.className,
      status: a.status,
      totalQuestions: a.totalQuestions,
      totalMarks: a.totalMarks,
      createdAt: a.createdAt,
    }));

  res.json({
    counts: {
      assignments: total,
      completed,
      queuedOrProcessing,
      failed,
      groups: groupCount,
      totalQuestions,
      totalMarks,
    },
    difficulty,
    subjectBreakdown,
    recent,
  });
}
