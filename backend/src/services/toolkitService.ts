import { z } from 'zod';
import { getLlmClient } from './llmClient';
import { log } from '../utils/logger';

function stripFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) s = s.slice(first, last + 1);
  return s.trim();
}

function parseJson<T>(raw: string, schema: z.ZodSchema<T>, label: string): T {
  let json: unknown;
  try {
    json = JSON.parse(stripFences(raw));
  } catch (e) {
    throw new Error(`${label}: invalid JSON from LLM (${(e as Error).message})`);
  }
  const r = schema.safeParse(json);
  if (!r.success) {
    throw new Error(`${label}: schema mismatch — ${r.error.message}`);
  }
  return r.data;
}

// ────────────────────────────────────────────────────────────
// 1) Concept Explainer
// ────────────────────────────────────────────────────────────
const ExplainSchema = z.object({
  title: z.string(),
  simpleExplanation: z.string(),
  detailedExplanation: z.string(),
  realWorldExamples: z.array(z.string()).min(1),
  keyTerms: z.array(z.object({ term: z.string(), meaning: z.string() })),
  funFact: z.string().optional(),
});
export type ExplainResult = z.infer<typeof ExplainSchema>;

export async function explainConcept(input: {
  concept: string;
  className: string;
}): Promise<ExplainResult> {
  const prompt = `You are an enthusiastic teacher explaining a concept to a Class ${input.className} student.

Concept: "${input.concept}"

Return ONLY a single valid JSON object (no markdown fences, no commentary):
{
  "title": string,
  "simpleExplanation": string,         // 2-3 sentences a child can understand
  "detailedExplanation": string,       // 1 paragraph for advanced students
  "realWorldExamples": string[],       // 3 examples
  "keyTerms": [{ "term": string, "meaning": string }],  // 3-5 terms
  "funFact": string                    // optional but encouraged
}`;
  const raw = await getLlmClient().generate(prompt);
  log.ok('toolkit', `explainer: response received (${raw.length} chars)`);
  return parseJson(raw, ExplainSchema, 'Concept Explainer');
}

// ────────────────────────────────────────────────────────────
// 2) Lesson Plan Generator
// ────────────────────────────────────────────────────────────
const LessonPlanSchema = z.object({
  title: z.string(),
  subject: z.string(),
  className: z.string(),
  duration: z.string(),
  learningObjectives: z.array(z.string()).min(2),
  materialsNeeded: z.array(z.string()),
  phases: z
    .array(
      z.object({
        name: z.string(), // e.g. "Introduction", "Main Activity"
        timeMinutes: z.number(),
        description: z.string(),
        activities: z.array(z.string()),
      })
    )
    .min(3),
  homework: z.string(),
  assessment: z.string(),
});
export type LessonPlanResult = z.infer<typeof LessonPlanSchema>;

export async function generateLessonPlan(input: {
  topic: string;
  subject: string;
  className: string;
  durationMinutes: number;
}): Promise<LessonPlanResult> {
  const prompt = `Create a detailed lesson plan for the following:

Topic: "${input.topic}"
Subject: ${input.subject}
Class: ${input.className}
Total Duration: ${input.durationMinutes} minutes

Return ONLY a single valid JSON object matching this shape:
{
  "title": string,
  "subject": string,
  "className": string,
  "duration": string,                   // e.g. "45 minutes"
  "learningObjectives": string[],        // at least 3
  "materialsNeeded": string[],
  "phases": [                            // at least 3 phases (intro, main, conclusion)
    {
      "name": string,
      "timeMinutes": number,
      "description": string,
      "activities": string[]
    }
  ],
  "homework": string,
  "assessment": string                   // how the teacher will check understanding
}

Sum of phase timeMinutes MUST equal ${input.durationMinutes}.`;
  const raw = await getLlmClient().generate(prompt);
  log.ok('toolkit', `lesson plan: response received (${raw.length} chars)`);
  return parseJson(raw, LessonPlanSchema, 'Lesson Plan');
}

// ────────────────────────────────────────────────────────────
// 3) Rubric Builder
// ────────────────────────────────────────────────────────────
const RubricSchema = z.object({
  title: z.string(),
  description: z.string(),
  totalPoints: z.number(),
  criteria: z
    .array(
      z.object({
        name: z.string(),
        weight: z.number(),
        levels: z
          .array(
            z.object({
              label: z.string(), // "Excellent", "Good", "Needs Improvement"
              points: z.number(),
              description: z.string(),
            })
          )
          .min(3),
      })
    )
    .min(2),
});
export type RubricResult = z.infer<typeof RubricSchema>;

export async function buildRubric(input: {
  assignmentDescription: string;
  totalPoints: number;
}): Promise<RubricResult> {
  const prompt = `You are a teacher creating a grading rubric.

Assignment Description: "${input.assignmentDescription}"
Total Points: ${input.totalPoints}

Return ONLY a single valid JSON object matching this shape:
{
  "title": string,
  "description": string,
  "totalPoints": number,                // MUST equal ${input.totalPoints}
  "criteria": [                          // 3-5 criteria
    {
      "name": string,                   // e.g. "Content Knowledge"
      "weight": number,                 // points allocated to this criterion
      "levels": [                       // 3-4 performance levels
        { "label": string, "points": number, "description": string }
      ]
    }
  ]
}

The sum of criterion weights MUST equal ${input.totalPoints}.`;
  const raw = await getLlmClient().generate(prompt);
  log.ok('toolkit', `rubric: response received (${raw.length} chars)`);
  return parseJson(raw, RubricSchema, 'Rubric Builder');
}
