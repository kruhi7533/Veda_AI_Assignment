import crypto from 'crypto';
import { getRedis } from '../config/redis';
import type { GeneratedPaper } from '../types/assignment';

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function promptHash(prompt: string): string {
  return crypto.createHash('sha256').update(prompt).digest('hex');
}

export async function getCachedPaper(
  hash: string
): Promise<GeneratedPaper | null> {
  try {
    if (!process.env.REDIS_URL) return null;
    const r = getRedis();
    const data = await r.get(`paper:${hash}`);
    if (!data) return null;
    return JSON.parse(data) as GeneratedPaper;
  } catch (e) {
    console.warn('[cache] get failed', (e as Error).message);
    return null;
  }
}

export async function setCachedPaper(
  hash: string,
  paper: GeneratedPaper
): Promise<void> {
  try {
    if (!process.env.REDIS_URL) return;
    const r = getRedis();
    await r.setex(`paper:${hash}`, TTL_SECONDS, JSON.stringify(paper));
  } catch (e) {
    console.warn('[cache] set failed', (e as Error).message);
  }
}

export async function invalidatePaper(hash: string): Promise<void> {
  try {
    if (!process.env.REDIS_URL) return;
    await getRedis().del(`paper:${hash}`);
  } catch {
    /* swallow */
  }
}
