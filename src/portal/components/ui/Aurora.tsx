import { type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
}

export function Aurora({
  colorStops = ['rgba(25, 166, 0, 0.18)', 'rgba(6, 74, 152, 0.22)', 'rgba(16, 185, 129, 0.12)'],
  className,
}: AuroraProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden select-none',
        className,
      )}
    >
      <div
        className="absolute -inset-[40%] opacity-60 blur-[80px] animate-pulse-soft will-change-transform"
        style={
          {
            background: `radial-gradient(ellipse at 30% 30%, ${colorStops[0]}, transparent 60%),
                         radial-gradient(ellipse at 70% 60%, ${colorStops[1]}, transparent 60%),
                         radial-gradient(ellipse at 50% 80%, ${colorStops[2]}, transparent 50%)`,
          } as CSSProperties
        }
      />
      <div
        className="absolute -inset-[20%] opacity-40 blur-[100px] animate-float will-change-transform"
        style={
          {
            background: `radial-gradient(circle at 60% 40%, ${colorStops[1]}, transparent 55%),
                         radial-gradient(circle at 40% 70%, ${colorStops[0]}, transparent 55%)`,
          } as CSSProperties
        }
      />
    </div>
  );
}

export default Aurora;
