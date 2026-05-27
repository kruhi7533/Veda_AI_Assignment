/**
 * The worker runs in its own process, so it cannot directly hold the Socket.IO
 * server. Instead it publishes events to a Redis pub/sub channel that the API
 * server subscribes to and re-broadcasts to the connected clients.
 */
import IORedis from 'ioredis';
import { env } from '../config/env';
import { log } from '../utils/logger';
import type { AssignmentEvent } from '../sockets';

export const WORKER_EVENTS_CHANNEL = 'assignment:events';

let _pub: IORedis | null = null;

export async function initSocketClient(): Promise<void> {
  if (!env.REDIS_URL) {
    log.warn('worker', 'REDIS_URL not set; worker event publishing disabled');
    return;
  }
  _pub = new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  _pub.on('connect', () =>
    log.ok('worker', `pub/sub publisher connected (channel "${WORKER_EVENTS_CHANNEL}")`)
  );
  _pub.on('error', (e) =>
    log.err('worker', `pub/sub error: ${e.message}`)
  );
}

export async function emitFromWorker(ev: AssignmentEvent): Promise<void> {
  if (!env.REDIS_URL) return;
  if (!_pub) {
    _pub = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  try {
    await _pub.publish(WORKER_EVENTS_CHANNEL, JSON.stringify(ev));
  } catch (e) {
    log.warn('worker', `publish failed: ${(e as Error).message}`);
  }
}
