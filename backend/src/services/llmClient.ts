import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { log } from '../utils/logger';

export interface LlmClient {
  generate(prompt: string): Promise<string>;
}

class GeminiClient implements LlmClient {
  private model;
  constructor() {
    log.ok('llm', `Gemini client initialized (model=${env.GEMINI_MODEL})`);
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });
  }

  async generate(prompt: string): Promise<string> {
    log.step('llm', `→ Gemini request (prompt ${prompt.length} chars)`);
    const res = await this.model.generateContent(prompt);
    return res.response.text();
  }
}

class MockLlmClient implements LlmClient {
  constructor() {
    log.warn('llm', 'MOCK LLM client active (no real Gemini calls)');
  }

  async generate(prompt: string): Promise<string> {
    const totalQMatch = /Total Questions:\s*(\d+)/.exec(prompt);
    const totalMMatch = /Total Marks:\s*(\d+)/.exec(prompt);
    const subjectMatch = /Subject:\s*([^\n]+)/.exec(prompt);
    const classMatch = /Class:\s*([^\n]+)/.exec(prompt);
    const schoolMatch = /School:\s*([^\n]+)/.exec(prompt);

    const totalQ = Number(totalQMatch?.[1] ?? 10);
    const totalM = Number(totalMMatch?.[1] ?? 20);
    const subject = (subjectMatch?.[1] ?? 'Science').trim();
    const className = (classMatch?.[1] ?? '8th').trim();
    const school = (schoolMatch?.[1] ?? 'St. Xaviers High School, Lucknow').trim();
    const marksPerQ = Math.max(1, Math.round(totalM / totalQ));

    const difficulties: ('easy' | 'moderate' | 'challenging')[] = [
      'easy',
      'moderate',
      'challenging',
    ];

    const sampleQuestions = [
      'Define electroplating. Explain its purpose.',
      'What is the role of a conductor in the process of electrolysis?',
      'Why does a solution of copper sulfate conduct electricity?',
      'Describe one example of the chemical effect of electric current in daily life.',
      'Explain why electric current is said to have chemical effects.',
      'How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.',
      'What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.',
      'Mention the type of current used in electroplating and justify why it is used.',
      'What is the importance of electric current in the field of metallurgy?',
      'Explain with a chemical equation how copper is deposited during the electroplating of an object.',
    ];

    const questions = Array.from({ length: totalQ }, (_, i) => ({
      id: `q${i + 1}`,
      text: sampleQuestions[i % sampleQuestions.length],
      difficulty: difficulties[i % 3],
      marks: marksPerQ,
      options: null,
      answer: 'Sample answer for question ' + (i + 1),
    }));

    const paper = {
      intro: `Certainly, Lakshya! Here are customized Question Paper for your ${subject} classes on the relevant chapters:`,
      schoolName: school,
      subject,
      className,
      timeAllowed: '45 minutes',
      maximumMarks: totalM,
      generalInstructions: 'All questions are compulsory unless stated otherwise.',
      sections: [
        {
          id: 'section-a',
          title: 'Section A',
          instruction: `Attempt all questions. Each question carries ${marksPerQ} marks`,
          questions,
        },
      ],
      answerKey: questions.map((q) => ({
        questionId: q.id,
        answer: q.answer ?? '',
      })),
    };

    await new Promise((r) => setTimeout(r, 1500));
    return JSON.stringify(paper);
  }
}

let _client: LlmClient | null = null;
export function getLlmClient(): LlmClient {
  if (!_client) {
    _client =
      env.USE_MOCK_LLM || !env.GEMINI_API_KEY
        ? new MockLlmClient()
        : new GeminiClient();
  }
  return _client;
}
