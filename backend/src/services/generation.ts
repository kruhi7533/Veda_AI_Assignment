import type { AssignmentDoc } from '../models/Assignment';
import { buildPrompt } from './promptBuilder';
import { getLlmClient } from './llmClient';
import { parseLlmResponse } from './responseParser';
import {
  promptHash,
  getCachedPaper,
  setCachedPaper,
} from './cache';

export async function generatePaperForAssignment(
  assignment: AssignmentDoc,
  force = false
): Promise<{ paper: ReturnType<typeof parseLlmResponse>; fromCache: boolean }> {
  const prompt = buildPrompt(assignment);
  const hash = promptHash(prompt);

  let paper = force ? null : await getCachedPaper(hash);
  if (paper) {
    return { paper, fromCache: true };
  }

  const llm = getLlmClient();
  const raw = await llm.generate(prompt);
  paper = parseLlmResponse(raw);
  await setCachedPaper(hash, paper);
  return { paper, fromCache: false };
}