import dotenv from 'dotenv';
dotenv.config();

const required = (name: string, fallback?: string): string => {
  const val = process.env[name] ?? fallback;
  if (!val) {
    console.warn(`[env] Missing env var: ${name}`);
    return '';
  }
  return val;
};

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  CLIENT_ORIGIN: required('CLIENT_ORIGIN', 'http://localhost:3000'),
  MONGODB_URI: required('MONGODB_URI', 'mongodb://localhost:27017/vedaai'),
  REDIS_URL: process.env.REDIS_URL ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  USE_MOCK_LLM: process.env.USE_MOCK_LLM === 'true' || !process.env.GEMINI_API_KEY,
  PDF_TMP_DIR: process.env.PDF_TMP_DIR ?? './tmp',
};
