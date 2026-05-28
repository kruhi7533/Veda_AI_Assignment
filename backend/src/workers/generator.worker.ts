import { connectMongo } from '../config/db';
import { GENERATION_QUEUE } from '../queue';
import { startWorker } from './embeddedWorker';
import { log, colors as C } from '../utils/logger';
import { env } from '../config/env';

async function main(): Promise<void> {
  log.banner([
    `${C.bold}${C.magenta}VedaAI Worker — BullMQ generation worker${C.reset}`,
    `${C.gray}queue: ${GENERATION_QUEUE}  |  LLM: ${env.USE_MOCK_LLM ? 'mock' : env.GEMINI_MODEL}${C.reset}`,
  ]);

  await connectMongo();
  await startWorker({ concurrency: 2, embedded: false });

  log.banner([
    `${C.green}${C.bold}✓ Worker Ready${C.reset}`,
    `${C.gray}Listening on queue:${C.reset} ${C.bold}${GENERATION_QUEUE}${C.reset}`,
    `${C.gray}concurrency=2  |  Press Ctrl+C to stop${C.reset}`,
  ]);
}

main().catch((e) => {
  log.err('worker', `fatal: ${(e as Error).message}`);
  console.error(e);
  process.exit(1);
});
