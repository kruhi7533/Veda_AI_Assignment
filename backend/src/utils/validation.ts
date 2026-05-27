import { z } from 'zod';

const QUESTION_TYPES = [
  'multiple_choice',
  'short_answer',
  'long_answer',
  'true_false',
  'fill_in_the_blank',
  'diagram_based',
  'numerical',
] as const;

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(80),
  className: z.string().min(1, 'Class is required').max(40),
  schoolName: z.string().max(120).optional(),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Due date must be a valid date'),
  questionTypes: z
    .array(
      z.object({
        type: z.enum(QUESTION_TYPES),
        count: z
          .number({ invalid_type_error: 'count must be a number' })
          .int('count must be an integer')
          .min(1, 'count must be at least 1')
          .max(50, 'count too large'),
        marksPerQuestion: z
          .number({ invalid_type_error: 'marks must be a number' })
          .int('marks must be an integer')
          .min(1, 'marks must be at least 1')
          .max(50, 'marks too large'),
      })
    )
    .min(1, 'At least one question type is required'),
  additionalInstructions: z.string().max(2000).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
