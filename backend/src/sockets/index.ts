import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { log } from '../utils/logger';
import type { AssignmentDoc } from '../models/Assignment';

let _io: SocketServer | null = null;
let _connectedClients = 0;

export function initSocket(httpServer: HttpServer): SocketServer {
  _io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  _io.on('connection', (socket) => {
    _connectedClients++;
    log.ok('ws', `client connected ${socket.id} (total=${_connectedClients})`);

    socket.on('subscribe', (assignmentId: string) => {
      if (typeof assignmentId === 'string' && assignmentId.length) {
        socket.join(`assignment:${assignmentId}`);
        log.info('ws', `${socket.id} subscribed → assignment:${assignmentId}`);
      }
    });

    socket.on('unsubscribe', (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
      log.info('ws', `${socket.id} unsubscribed ← assignment:${assignmentId}`);
    });

    socket.on('disconnect', (reason) => {
      _connectedClients--;
      log.warn(
        'ws',
        `client disconnected ${socket.id} (${reason}) (total=${_connectedClients})`
      );
    });
  });

  log.ok('ws', `Socket.IO server initialized (CORS origin: ${env.CLIENT_ORIGIN})`);
  return _io;
}

export function getIo(): SocketServer {
  if (!_io) throw new Error('Socket.IO not initialized');
  return _io;
}

export type AssignmentEvent =
  | { type: 'queued'; assignmentId: string }
  | { type: 'processing'; assignmentId: string; progress?: number }
  | { type: 'progress'; assignmentId: string; progress: number; message?: string }
  | { type: 'completed'; assignmentId: string; assignment: AssignmentDoc }
  | { type: 'failed'; assignmentId: string; error: string };

export function emitAssignmentEvent(ev: AssignmentEvent): void {
  if (!_io) return;
  _io.to(`assignment:${ev.assignmentId}`).emit('assignment:update', ev);
  _io.emit('assignment:any', ev);
  const detail =
    ev.type === 'progress'
      ? `${ev.progress}% ${ev.message ?? ''}`
      : ev.type === 'failed'
        ? ev.error
        : '';
  log.step('ws', `emit ${ev.type} → assignment:${ev.assignmentId} ${detail}`);
}
