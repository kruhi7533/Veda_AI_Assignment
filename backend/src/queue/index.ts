import { Queue, QueueEvents, ConnectionOptions } from 'bullmq';
import { env } from '../config/env';

export const GENERATION_QUEUE = 'assignment-generation';

// BullMQ ships its own copy of ioredis; pass connection options (URL) rather
// than a shared client to avoid type-incompatibility between the two copies.
export function getBullConnection(): ConnectionOptions {
  // Parse the redis:// URL into host/port/password for portability across
  // ioredis versions used by BullMQ.
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

let _queue: Queue | null = null;
let _events: QueueEvents | null = null;

export function getGenerationQueue(): Queue {
  if (!_queue) {
    _queue = new Queue(GENERATION_QUEUE, {
      connection: getBullConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 60 * 60 * 24 },
        removeOnFail: { age: 60 * 60 * 24 * 3 },
      },
    });
  }
  return _queue;
}

export function getQueueEvents(): QueueEvents {
  if (!_events) {
    _events = new QueueEvents(GENERATION_QUEUE, {
      connection: getBullConnection(),
    });
  }
  return _events;
}

export interface GenerationJobData {
  assignmentId: string;
  force?: boolean;
}
