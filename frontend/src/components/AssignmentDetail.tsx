'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAssignmentSocket } from '@/hooks/useAssignmentSocket';
import { api } from '@/lib/api';
import { GenerationProgress } from './GenerationProgress';
import { QuestionPaperView } from './QuestionPaperView';

interface Props {
  id: string;
}

export function AssignmentDetail({ id }: Props) {
  const router = useRouter();
  const { current, loadingCurrent, generationProgress, fetchOne, setCurrent } =
    useAssignmentStore();
  const [regenerating, setRegenerating] = useState(false);

  useAssignmentSocket(id);

  useEffect(() => {
    fetchOne(id).catch((e) => toast.error(e.message));
    return () => setCurrent(null);
  }, [id, fetchOne, setCurrent]);

  if (loadingCurrent && !current) {
    return (
      <div className="p-6">
        <div className="h-72 bg-white rounded-2xl animate-pulse" />
      </div>
    );
  }
  if (!current) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p>Assignment not found.</p>
          <button onClick={() => router.push('/assignments')} className="veda-btn-primary mt-4">
            Back to list
          </button>
        </div>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await api.regenerateAssignment(id);
      toast.success('Regeneration started');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRegenerating(false);
    }
  };

  const status = current.status;
  const showProgress =
    status === 'queued' || status === 'processing' || generationProgress !== null;

  return (
    <div className="p-3 space-y-4">
      {showProgress && (
        <GenerationProgress
          progress={generationProgress?.progress ?? (status === 'queued' ? 5 : 30)}
          message={
            generationProgress?.message ??
            (status === 'queued' ? 'Job queued...' : 'Generating...')
          }
        />
      )}

      {status === 'failed' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-rose-700">Generation failed</h3>
            <p className="text-sm text-rose-600 mt-1">
              {current.error ?? 'Unknown error. Please try regenerating.'}
            </p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="veda-btn-primary !bg-rose-600"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {status === 'completed' && current.generatedPaper && (
        <QuestionPaperView
          assignment={current}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
        />
      )}
    </div>
  );
}
