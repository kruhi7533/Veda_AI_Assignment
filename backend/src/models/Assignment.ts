import { Schema, model, Document, Types } from 'mongoose';
import type {
  AssignmentStatus,
  GeneratedPaper,
  QuestionTypeSpec,
} from '../types/assignment';

export interface AssignmentDoc extends Document {
  _id: Types.ObjectId;
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: Date;
  questionTypes: QuestionTypeSpec[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  uploadedFile?: {
    filename: string;
    mimetype: string;
    extractedText?: string;
  };
  status: AssignmentStatus;
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  error?: string;
  isFavorite?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const GeneratedQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging'],
      required: true,
    },
    marks: { type: Number, required: true },
    options: { type: [String], default: undefined },
    answer: { type: String },
  },
  { _id: false }
);

const GeneratedSectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [GeneratedQuestionSchema], default: [] },
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema(
  {
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    timeAllowed: { type: String, required: true },
    maximumMarks: { type: Number, required: true },
    generalInstructions: { type: String, required: true },
    intro: { type: String },
    sections: { type: [GeneratedSectionSchema], default: [] },
    answerKey: {
      type: [{ questionId: String, answer: String }],
      default: [],
      _id: false,
    },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<AssignmentDoc>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    schoolName: {
      type: String,
      default: 'St. Xaviers High School, Lucknow',
    },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [QuestionTypeSchema], default: [] },
    totalQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    uploadedFile: {
      filename: { type: String },
      mimetype: { type: String },
      extractedText: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    generatedPaper: { type: GeneratedPaperSchema },
    error: { type: String },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AssignmentSchema.index({ createdAt: -1 });

export const Assignment = model<AssignmentDoc>('Assignment', AssignmentSchema);
