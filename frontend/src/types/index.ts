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
  options?: string[] | null;
  answer?: string;
}

export interface GeneratedSection {
  id: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  intro?: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string;
  sections: GeneratedSection[];
  answerKey?: { questionId: string; answer: string }[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  questionTypes: QuestionTypeSpec[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  uploadedFile?: { filename: string; mimetype: string };
  status: AssignmentStatus;
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  error?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  subject: string;
  className: string;
  studentCount: number;
  color: string;
  description?: string;
  assignmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  counts: {
    assignments: number;
    completed: number;
    queuedOrProcessing: number;
    failed: number;
    groups: number;
    totalQuestions: number;
    totalMarks: number;
  };
  difficulty: { easy: number; moderate: number; challenging: number };
  subjectBreakdown: { subject: string; count: number }[];
  recent: {
    _id: string;
    title: string;
    subject: string;
    className: string;
    status: AssignmentStatus;
    totalQuestions: number;
    totalMarks: number;
    createdAt: string;
  }[];
}

export interface ExplainResult {
  title: string;
  simpleExplanation: string;
  detailedExplanation: string;
  realWorldExamples: string[];
  keyTerms: { term: string; meaning: string }[];
  funFact?: string;
}

export interface LessonPlanResult {
  title: string;
  subject: string;
  className: string;
  duration: string;
  learningObjectives: string[];
  materialsNeeded: string[];
  phases: {
    name: string;
    timeMinutes: number;
    description: string;
    activities: string[];
  }[];
  homework: string;
  assessment: string;
}

export interface RubricResult {
  title: string;
  description: string;
  totalPoints: number;
  criteria: {
    name: string;
    weight: number;
    levels: { label: string; points: number; description: string }[];
  }[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionTypeKey, string> = {
  multiple_choice: 'Multiple Choice Questions',
  short_answer: 'Short Questions',
  long_answer: 'Long Answer Questions',
  true_false: 'True / False',
  fill_in_the_blank: 'Fill in the Blanks',
  diagram_based: 'Diagram/Graph-Based Questions',
  numerical: 'Numerical Problems',
};
