import { z } from 'zod';
import type { GeneratedPaper } from '../types/assignment';

const QuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  difficulty: z.enum(['easy', 'moderate', 'challenging']),
  marks: z.number().int().positive(),
  options: z.array(z.string()).nullable().optional(),
  answer: z.string().optional().default(''),
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

const PaperSchema = z.object({
  intro: z.string().optional(),
  schoolName: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maximumMarks: z.number(),
  generalInstructions: z.string(),
  sections: z.array(SectionSchema).min(1),
  answerKey: z
    .array(z.object({ questionId: z.string(), answer: z.string() }))
    .optional()
    .default([]),
});

function stripFences(raw: string): string {
  let s = raw.trim();
  // Strip ```json ... ``` fences if model returns them anyway
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  // Extract the first JSON object if surrounded by stray text
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s.trim();
}

export function parseLlmResponse(raw: string): GeneratedPaper {
  const cleaned = stripFences(raw);
  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('LLM returned invalid JSON: ' + (e as Error).message);
  }
  const parsed = PaperSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('LLM JSON schema mismatch: ' + parsed.error.message);
  }
  const paper = parsed.data;
  // Normalize: nullify empty options arrays
  paper.sections.forEach((s) => {
    s.questions.forEach((q) => {
      if (q.options && q.options.length === 0) q.options = null;
    });
  });
  return paper as GeneratedPaper;
}
