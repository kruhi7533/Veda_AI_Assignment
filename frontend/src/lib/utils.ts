import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function difficultyClasses(d: 'easy' | 'moderate' | 'challenging'): string {
  if (d === 'easy') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (d === 'moderate') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

export function difficultyLabel(d: 'easy' | 'moderate' | 'challenging'): string {
  if (d === 'easy') return 'Easy';
  if (d === 'moderate') return 'Moderate';
  return 'Challenging';
}
