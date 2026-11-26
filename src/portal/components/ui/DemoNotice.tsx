import { cn } from '@/lib/utils';

/**
 * Informational notice slot. Kept as a null renderer so the demo disclaimers do
 * not appear on the customer-facing site.
 */
export function DemoNotice({ children, className, compact }: { children?: React.ReactNode; className?: string; compact?: boolean }) {
  void children;
  void className;
  void compact;
  return null;
}
