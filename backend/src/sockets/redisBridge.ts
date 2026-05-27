import IORedis from 'ioredis';
import { env } from '../config/env';
import { emitAssignmentEvent } from './index';
import { WORKER_EVENTS_CHANNEL } from '../workers/socketBridge';
import { log } from '../utils/logger';
import type { AssignmentEvent } from './index';

export async function startWorkerEventSubscriber(): Promise<void> {
  if (!env.REDIS_URL) {
    log.warn('ws', 'REDIS_URL not set; skipping worker event subscriber');
    return;
  }
  const sub = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  await sub.subscribe(WORKER_EVENTS_CHANNEL);
  sub.on('message', (channel, message) => {
    if (channel !== WORKER_EVENTS_CHANNEL) return;
    try {
      const ev = JSON.parse(message) as AssignmentEvent;
      emitAssignmentEvent(ev);
    } catch (e) {
      log.warn('ws', `bad worker message: ${(e as Error).message}`);
    }
  });
  log.ok('ws', `subscribed to worker events on "${WORKER_EVENTS_CHANNEL}"`);
}
