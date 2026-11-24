import React, { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(25, 166, 0, 0.08)',
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}

export default SpotlightCard;
