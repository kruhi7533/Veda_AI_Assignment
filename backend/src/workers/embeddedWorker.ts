/**
 * Embeddable BullMQ worker. Used by the standalone worker process
 * (workers/generator.worker.ts) AND optionally by the API process
 * (when RUN_WORKER_IN_API=true) for single-process deployments like
 * Render's free tier (which doesn't offer free background workers).
 */
import { Worker, Job } from 'bullmq';
import { GENERATION_QUEUE, GenerationJobData, getBullConnection } from '../queue';
import { Assignment } from '../models/Assignment';
import { buildPrompt } from '../services/promptBuilder';
import { getLlmClient } from '../services/llmClient';
import { parseLlmResponse } from '../services/responseParser';
import {
  promptHash,
  getCachedPaper,
  setCachedPaper,
} from '../services/cache';
import { initSocketClient, emitFromWorker } from './socketBridge';
import { log, colors as C } from '../utils/logger';

export async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId, force } = job.data;
  log.step('worker', `▶ job=${job.id} assignment=${assignmentId} force=${!!force}`);

  const a = await Assignment.findById(assignmentId);
  if (!a) throw new Error(`Assignment ${assignmentId} not found`);

  a.status = 'processing';
  await a.save();
  await job.updateProgress(10);
  await emitFromWorker({ type: 'processing', assignmentId, progress: 10 });
  log.info('worker', `  status → processing`);

  const prompt = buildPrompt(a);
  const hash = promptHash(prompt);
  log.info('worker', `  prompt hash=${hash.slice(0, 12)}...`);

  let paper = force ? null : await getCachedPaper(hash);
  if (paper) {
    log.ok('cache', `  HIT  → reusing cached paper (skip LLM)`);
    await job.updateProgress(90);
    await emitFromWorker({
      type: 'progress',
      assignmentId,
      progress: 90,
      message: 'Loaded from cache',
    });
  } else {
    log.info('cache', `  MISS → calling LLM`);
    await job.updateProgress(30);
    await emitFromWorker({
      type: 'progress',
      assignmentId,
      progress: 30,
      message: 'Calling AI model...',
    });

    const llm = getLlmClient();
    const t0 = Date.now();
    const raw = await llm.generate(prompt);
    const dt = Date.now() - t0;
    log.ok('llm', `  response received in ${dt}ms (${raw.length} chars)`);

    await job.updateProgress(70);
    await emitFromWorker({
      type: 'progress',
      assignmentId,
      progress: 70,
      message: 'Parsing AI response...',
    });

    paper = parseLlmResponse(raw);
    log.ok(
      'worker',
      `  parsed: ${paper.sections.length} section(s), ${paper.sections.reduce((s, sec) => s + sec.questions.length, 0)} question(s)`
    );
    await setCachedPaper(hash, paper);
    log.info('cache', `  stored under paper:${hash.slice(0, 12)}... (TTL 7 days)`);
  }

  a.generatedPaper = paper;
  a.status = 'completed';
  await a.save();

  await job.updateProgress(100);
  await emitFromWorker({
    type: 'completed',
    assignmentId,
    assignment: a.toObject() as any,
  });

  log.ok(
    'worker',
    `${C.green}✓ done${C.reset} job=${job.id} assignment=${assignmentId}`
  );
}

/**
 * Boot a BullMQ worker. Safe to call from either the standalone worker process
 * or from inside the API process. Returns the Worker instance for shutdown.
 */
export async function startWorker(
  options: { concurrency?: number; embedded?: boolean } = {}
): Promise<Worker<GenerationJobData>> {
  const { concurrency = 2, embedded = false } = options;

  await initSocketClient();

  const worker = new Worker<GenerationJobData>(GENERATION_QUEUE, processJob, {
    connection: getBullConnection(),
    concurrency,
  });

  worker.on('ready', () =>
    log.ok('worker', `BullMQ worker ready${embedded ? ' (embedded in API)' : ''}`)
  );
  worker.on('active', (job) => log.info('worker', `→ active job ${job.id}`));
  worker.on('completed', (job) =>
    log.ok('worker', `completed job ${job.id}`)
  );
  worker.on('failed', async (job, err) => {
    log.err('worker', `failed job ${job?.id}: ${err?.message ?? 'unknown'}`);
    if (job?.data?.assignmentId) {
      try {
        await Assignment.findByIdAndUpdate(job.data.assignmentId, {
          status: 'failed',
          error: err?.message ?? 'Unknown error',
        });
        await emitFromWorker({
          type: 'failed',
          assignmentId: job.data.assignmentId,
          error: err?.message ?? 'Unknown error',
        });
      } catch (e) {
        log.err('worker', `failed to record failure: ${(e as Error).message}`);
      }
    }
  });

  return worker;
}
