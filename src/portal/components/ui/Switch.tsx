import { cn } from '@/lib/utils';

type SwitchProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function Switch({ label, checked, onClick, disabled, compact }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'toggle-switch relative shrink-0 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lavender disabled:opacity-50',
        compact ? 'h-5 w-9' : 'h-6 w-11',
        checked ? 'border-[#16A34A] bg-[#16A34A]' : 'border-slate-300 bg-slate-200',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm motion-safe:transition-transform',
          compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
          checked && (compact ? 'translate-x-4' : 'translate-x-[1.375rem]'),
        )}
      />
    </button>
  );
}
