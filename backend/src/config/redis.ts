import IORedis, { Redis } from 'ioredis';
import { env } from './env';
import { log } from '../utils/logger';

let client: Redis | null = null;

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

export function getRedis(): Redis {
  if (!client) {
    log.step('redis', `connecting to ${maskUrl(env.REDIS_URL)} ...`);
    client = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    client.on('connect', () => log.ok('redis', 'TCP connection established'));
    client.on('ready', () => log.ok('redis', 'ready (commands accepted)'));
    client.on('reconnecting', () => log.warn('redis', 'reconnecting...'));
    client.on('end', () => log.warn('redis', 'connection closed'));
    client.on('error', (e) => log.err('redis', `error: ${e.message}`));
  }
  return client;
}
