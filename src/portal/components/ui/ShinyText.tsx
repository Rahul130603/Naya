import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ShinyTextProps {
  children?: ReactNode;
  text?: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  shimmerColor?: string;
}

export function ShinyText({
  children,
  text,
  disabled = false,
  speed = 3,
  className,
  shimmerColor = 'rgba(255, 255, 255, 0.9)',
}: ShinyTextProps) {
  const content = text ?? children;

  if (disabled) {
    return <span className={className}>{content}</span>;
  }

  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent animate-shimmer select-none',
        className,
      )}
      style={
        {
          backgroundImage: `linear-gradient(110deg, currentColor 35%, ${shimmerColor} 50%, currentColor 65%)`,
          backgroundSize: '250% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animationDuration: `${speed}s`,
        } as CSSProperties
      }
    >
      {content}
    </span>
  );
}

export default ShinyText;
