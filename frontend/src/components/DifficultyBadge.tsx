import { cn, difficultyClasses, difficultyLabel } from '@/lib/utils';

interface Props {
  difficulty: 'easy' | 'moderate' | 'challenging';
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: Props) {
  return (
    <span className={cn('veda-chip', difficultyClasses(difficulty), className)}>
      {difficultyLabel(difficulty)}
    </span>
  );
}
