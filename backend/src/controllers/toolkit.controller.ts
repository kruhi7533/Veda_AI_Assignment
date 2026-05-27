import { Request, Response } from 'express';
import { z } from 'zod';
import {
  buildRubric,
  explainConcept,
  generateLessonPlan,
} from '../services/toolkitService';
import { log } from '../utils/logger';

const explainSchema = z.object({
  concept: z.string().min(2).max(200),
  className: z.string().min(1).max(40),
});

const lessonPlanSchema = z.object({
  topic: z.string().min(2).max(200),
  subject: z.string().min(1).max(60),
  className: z.string().min(1).max(40),
  durationMinutes: z.number().int().min(15).max(240),
});

const rubricSchema = z.object({
  assignmentDescription: z.string().min(10).max(1000),
  totalPoints: z.number().int().min(10).max(200),
});

export async function postExplain(req: Request, res: Response): Promise<void> {
  const p = explainSchema.safeParse(req.body);
  if (!p.success) {
    res.status(400).json({ error: 'Validation failed', details: p.error.flatten() });
    return;
  }
  try {
    log.step('toolkit', `explain → "${p.data.concept}" for class ${p.data.className}`);
    const result = await explainConcept(p.data);
    res.json(result);
  } catch (e) {
    log.err('toolkit', (e as Error).message);
    res.status(500).json({ error: (e as Error).message });
  }
}

export async function postLessonPlan(req: Request, res: Response): Promise<void> {
  const p = lessonPlanSchema.safeParse(req.body);
  if (!p.success) {
    res.status(400).json({ error: 'Validation failed', details: p.error.flatten() });
    return;
  }
  try {
    log.step('toolkit', `lesson plan → "${p.data.topic}" (${p.data.durationMinutes} min)`);
    const result = await generateLessonPlan(p.data);
    res.json(result);
  } catch (e) {
    log.err('toolkit', (e as Error).message);
    res.status(500).json({ error: (e as Error).message });
  }
}

export async function postRubric(req: Request, res: Response): Promise<void> {
  const p = rubricSchema.safeParse(req.body);
  if (!p.success) {
    res.status(400).json({ error: 'Validation failed', details: p.error.flatten() });
    return;
  }
  try {
    log.step('toolkit', `rubric → ${p.data.totalPoints} pts`);
    const result = await buildRubric(p.data);
    res.json(result);
  } catch (e) {
    log.err('toolkit', (e as Error).message);
    res.status(500).json({ error: (e as Error).message });
  }
}
