import mongoose from 'mongoose';
import { env } from './env';
import { log } from '../utils/logger';

function maskUri(uri: string): string {
  // Hide credentials: mongodb+srv://user:pass@host/db → mongodb+srv://***@host/db
  try {
    const u = new URL(uri);
    const host = u.host;
    const db = u.pathname.replace(/^\//, '') || '(default)';
    return `${u.protocol}//***@${host}/${db}`;
  } catch {
    return uri.replace(/\/\/[^/]+@/, '//***@');
  }
}

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  log.step('mongo', `connecting to ${maskUri(env.MONGODB_URI)} ...`);
  try {
    await mongoose.connect(env.MONGODB_URI);
    const host = mongoose.connection.host;
    const name = mongoose.connection.name;
    log.ok('mongo', `connected (host=${host}, db=${name})`);
  } catch (e) {
    log.err('mongo', `connection failed: ${(e as Error).message}`);
    throw e;
  }

  mongoose.connection.on('disconnected', () =>
    log.warn('mongo', 'disconnected')
  );
  mongoose.connection.on('reconnected', () => log.ok('mongo', 'reconnected'));
  mongoose.connection.on('error', (err) =>
    log.err('mongo', `error: ${err.message}`)
  );
}
