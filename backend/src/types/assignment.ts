export type QuestionTypeKey =
  | 'multiple_choice'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_in_the_blank'
  | 'diagram_based'
  | 'numerical';

export interface QuestionTypeSpec {
  type: QuestionTypeKey;
  count: number;
  marksPerQuestion: number;
}

export type AssignmentStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type Difficulty = 'easy' | 'moderate' | 'challenging';

export interface GeneratedQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // for MCQs
  answer?: string;
}

export interface GeneratedSection {
  id: string;
  title: string; // e.g. "Section A"
  instruction: string; // e.g. "Attempt all questions. Each question carries 2 marks."
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string;
  intro?: string;
  sections: GeneratedSection[];
  answerKey?: { questionId: string; answer: string }[];
}
