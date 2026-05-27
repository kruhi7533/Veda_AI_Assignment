'use client';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { Assignment } from '@/types';

type WsEvent =
  | { type: 'queued'; assignmentId: string }
  | { type: 'processing'; assignmentId: string; progress?: number }
  | { type: 'progress'; assignmentId: string; progress: number; message?: string }
  | { type: 'completed'; assignmentId: string; assignment: Assignment }
  | { type: 'failed'; assignmentId: string; error: string };

/**
 * Subscribes to assignment-level events. If `assignmentId` is provided, it joins
 * that room and updates the `current` assignment + progress. It also listens to
 * the global `assignment:any` channel for list-page updates.
 */
export function useAssignmentSocket(assignmentId?: string): void {
  const upsert = useAssignmentStore((s) => s.upsertAssignment);
  const setCurrent = useAssignmentStore((s) => s.setCurrent);
  const setProgress = useAssignmentStore((s) => s.setGenerationProgress);
  const current = useAssignmentStore((s) => s.current);

  useEffect(() => {
    const socket = getSocket();

    const onScoped = (ev: WsEvent) => {
      if (assignmentId && ev.assignmentId !== assignmentId) return;
      switch (ev.type) {
        case 'queued':
          setProgress({ progress: 5, message: 'Job queued...' });
          break;
        case 'processing':
          setProgress({ progress: ev.progress ?? 10, message: 'Generating...' });
          break;
        case 'progress':
          setProgress({ progress: ev.progress, message: ev.message });
          break;
        case 'completed':
          setProgress({ progress: 100, message: 'Done' });
          setCurrent(ev.assignment);
          setTimeout(() => setProgress(null), 600);
          break;
        case 'failed':
          setProgress(null);
          if (current && current._id === ev.assignmentId) {
            setCurrent({ ...current, status: 'failed', error: ev.error });
          }
          break;
      }
    };

    const onAny = (ev: WsEvent) => {
      if (ev.type === 'completed') {
        upsert(ev.assignment);
      } else if (ev.type === 'queued' || ev.type === 'processing') {
        // Status updates only - no full assignment in payload
      }
    };

    socket.on('assignment:update', onScoped);
    socket.on('assignment:any', onAny);

    if (assignmentId) {
      socket.emit('subscribe', assignmentId);
    }

    return () => {
      socket.off('assignment:update', onScoped);
      socket.off('assignment:any', onAny);
      if (assignmentId) {
        socket.emit('unsubscribe', assignmentId);
      }
    };
  }, [assignmentId, upsert, setCurrent, setProgress, current]);
}
