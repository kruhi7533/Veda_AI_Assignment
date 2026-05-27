import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import { env } from './config/env';
import { connectMongo } from './config/db';
import { initSocket } from './sockets';
import { startWorkerEventSubscriber } from './sockets/redisBridge';
import assignmentRoutes from './routes/assignment.routes';
import groupRoutes from './routes/group.routes';
import toolkitRoutes from './routes/toolkit.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { log, colors as C } from './utils/logger';

function httpAccessLog(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color =
      status >= 500 ? C.red : status >= 400 ? C.yellow : C.green;
    log.info(
      'http',
      `${req.method.padEnd(6)} ${req.originalUrl}  ${color}${status}${C.reset}  ${ms}ms`
    );
  });
  next();
}

async function main(): Promise<void> {
  log.banner([
    `${C.bold}${C.cyan}VedaAI Assessment Creator — API server${C.reset}`,
    `${C.gray}Node ${process.version}  |  env=${env.NODE_ENV}  |  port=${env.PORT}${C.reset}`,
    `${C.gray}LLM: ${env.USE_MOCK_LLM ? 'mock (dev)' : `Gemini ${env.GEMINI_MODEL}`}${C.reset}`,
  ]);

  await connectMongo();

  const app = express();
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(httpAccessLog);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.use('/api/assignments', assignmentRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/toolkit', toolkitRoutes);
  app.use('/api/stats', statsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const httpServer = http.createServer(app);
  initSocket(httpServer);
  await startWorkerEventSubscriber();

  httpServer.listen(env.PORT, () => {
    log.ok('api', `listening on ${C.bold}http://localhost:${env.PORT}${C.reset}`);
    log.info('api', `CORS origin allowed: ${env.CLIENT_ORIGIN}`);
    if (env.USE_MOCK_LLM) {
      log.warn(
        'llm',
        'running in MOCK mode (set GEMINI_API_KEY and USE_MOCK_LLM=false in .env to use real LLM)'
      );
    }
    log.banner([
      `${C.green}${C.bold}✓ Ready${C.reset}`,
      `${C.gray}Open frontend: ${C.reset}${C.cyan}http://localhost:3000${C.reset}`,
      `${C.gray}Don't forget: run the worker in another terminal:${C.reset} ${C.bold}npm run worker${C.reset}`,
    ]);
  });
}

main().catch((e) => {
  log.err('api', `fatal: ${(e as Error).message}`);
  console.error(e);
  process.exit(1);
});
