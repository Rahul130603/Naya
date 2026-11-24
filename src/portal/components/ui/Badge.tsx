import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'lavender',
  className,
  dot,
}: {
  children: ReactNode;
  tone?: 'lavender' | 'rose' | 'burgundy' | 'muted' | 'outline';
  className?: string;
  dot?: boolean;
}) {
  const tones = {
    lavender: 'border-lavender/30 bg-lavender/10 text-lavender',
    rose: 'border-rose/30 bg-rose/10 text-rose',
    burgundy: 'border-royal/30 bg-royal/10 text-royal',
    muted: 'border-slate-200 bg-slate-100 text-slate-600',
    outline: 'border-slate-300 bg-transparent text-slate-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
