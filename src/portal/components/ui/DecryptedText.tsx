import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DecryptedTextProps {
  text: string;
  speed?: number; // ms per frame
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: 'view' | 'hover';
}

export function DecryptedText({
  text,
  speed = 40,
  maxIterations = 8,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?/',
  className = '',
  encryptedClassName = 'text-rose/80 font-mono opacity-80',
  parentClassName = '',
  animateOn = 'view',
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const getAvailableChars = () => {
    if (useOriginalCharsOnly) {
      return Array.from(new Set(text.split(''))).filter((char) => char !== ' ');
    }
    return characters.split('');
  };

  const startAnimation = () => {
    setIsScrambling(true);
    setRevealedIndices(new Set());

    const availableChars = getAvailableChars();
    const length = text.length;
    let iteration = 0;

    const interval = setInterval(() => {
      setRevealedIndices((prev) => {
        const next = new Set(prev);

        if (sequential) {
          if (revealDirection === 'start') {
            next.add(next.size);
          } else if (revealDirection === 'end') {
            next.add(length - 1 - next.size);
          } else {
            // center
            const center = Math.floor(length / 2);
            const offset = Math.floor(next.size / 2);
            if (next.size % 2 === 0) {
              next.add(center + offset);
            } else {
              next.add(center - offset);
            }
          }
        } else {
          // random revelation
          const unrevealed = Array.from({ length }, (_, i) => i).filter((i) => !next.has(i));
          if (unrevealed.length > 0) {
            const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            next.add(randomIndex);
          }
        }

        return next;
      });

      iteration++;

      if (iteration > length + maxIterations) {
        clearInterval(interval);
        setIsScrambling(false);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    if (animateOn === 'view' && isInView) {
      const cleanup = startAnimation();
      return cleanup;
    }
  }, [isInView, text]);

  const availableChars = getAvailableChars();

  return (
    <span
      ref={containerRef}
      onMouseEnter={animateOn === 'hover' && !isScrambling ? startAnimation : undefined}
      className={cn('inline-block whitespace-pre-wrap', parentClassName)}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={className}>
        {text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          const isRevealed = !isScrambling || revealedIndices.has(index);

          if (isRevealed) {
            return (
              <span key={index} className="inline-block transition-colors duration-150">
                {char}
              </span>
            );
          }

          const randomChar =
            availableChars[Math.floor(Math.random() * availableChars.length)] || char;

          return (
            <span key={index} className={cn('inline-block', encryptedClassName)}>
              {randomChar}
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default DecryptedText;
