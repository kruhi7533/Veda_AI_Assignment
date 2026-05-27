import type { AssignmentDoc } from '../models/Assignment';

const HUMAN_LABEL: Record<string, string> = {
  multiple_choice: 'Multiple Choice Questions',
  short_answer: 'Short Answer Questions',
  long_answer: 'Long Answer Questions',
  true_false: 'True / False',
  fill_in_the_blank: 'Fill in the Blanks',
  diagram_based: 'Diagram / Graph-Based Questions',
  numerical: 'Numerical Problems',
};

export function buildPrompt(a: AssignmentDoc): string {
  const due = a.dueDate.toISOString().slice(0, 10);
  const lines = a.questionTypes
    .map(
      (q) =>
        `- ${HUMAN_LABEL[q.type] ?? q.type}: ${q.count} questions, ${q.marksPerQuestion} marks each`
    )
    .join('\n');

  const totalTime = Math.max(
    30,
    Math.round(a.totalQuestions * 2 + a.totalMarks * 1.5)
  );

  return `You are an expert teacher creating a high-quality exam question paper.

# Assignment Brief
- Title: ${a.title}
- School: ${a.schoolName}
- Subject: ${a.subject}
- Class: ${a.className}
- Due Date: ${due}
- Total Questions: ${a.totalQuestions}
- Total Marks: ${a.totalMarks}
- Recommended Time Allowed: ${totalTime} minutes

# Question Distribution
${lines}

# Additional Instructions From Teacher
${a.additionalInstructions || '(none)'}

${
  a.uploadedFile?.extractedText
    ? `# Reference Material (use this content to ground the questions)\n${a.uploadedFile.extractedText.slice(0, 8000)}\n`
    : ''
}

# Task
Generate a complete question paper. Group questions into sections (Section A, Section B, ...). Each section should contain questions of a similar type. Assign a difficulty to every question: one of "easy", "moderate", or "challenging". Provide an answer key.

Respond with ONLY a single valid JSON object (no markdown, no commentary, no \`\`\` fences) matching exactly this TypeScript shape:

{
  "intro": string,                // a warm intro sentence addressed to the teacher
  "schoolName": string,
  "subject": string,
  "className": string,
  "timeAllowed": string,          // e.g. "45 minutes"
  "maximumMarks": number,
  "generalInstructions": string,  // e.g. "All questions are compulsory unless stated otherwise."
  "sections": [
    {
      "id": string,               // e.g. "section-a"
      "title": string,            // e.g. "Section A"
      "instruction": string,      // e.g. "Attempt all questions. Each question carries 2 marks."
      "questions": [
        {
          "id": string,           // e.g. "q1"
          "text": string,
          "difficulty": "easy" | "moderate" | "challenging",
          "marks": number,
          "options": string[] | null,  // for MCQ only, else null
          "answer": string             // short answer or correct option text
        }
      ]
    }
  ],
  "answerKey": [
    { "questionId": string, "answer": string }
  ]
}

Important:
- Output strictly valid JSON. No trailing commas. No comments.
- Total questions across all sections MUST equal ${a.totalQuestions}.
- Sum of marks across all questions MUST equal ${a.totalMarks}.
- Use clear, exam-ready language appropriate for ${a.className}.
`;
}
