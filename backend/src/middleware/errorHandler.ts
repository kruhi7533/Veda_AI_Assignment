import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { log } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  log.err('http', err?.message ?? 'unknown error');
  if (err?.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  const status = err.status ?? 500;
  res.status(status).json({
    error: err.message ?? 'Internal Server Error',
  });
};

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not Found' });
}
