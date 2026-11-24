import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/ui/Reveal';

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden />}
            {item.to ? (
              <Link
                to={item.to}
                className="font-body text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-body text-[11px] font-semibold text-rose">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
  visual,
  backgroundImage,
  breadcrumbs,
  align = 'left',
  className,
  art = 'rings',
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  visual?: ReactNode;
  backgroundImage?: { src: string; width: number; height: number };
  breadcrumbs?: { label: string; to?: string }[];
  align?: 'left' | 'center';
  className?: string;
  art?: 'rings' | 'arch' | 'veil' | 'none';
}) {
  return (
    <section
      className={cn(
        'page-hero relative flex items-center overflow-hidden bg-white pb-14 pt-28 sm:pb-16 sm:pt-36 lg:pb-20 lg:pt-40 border-b border-slate-200/80',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(25,166,0,0.08),transparent_50%),radial-gradient(ellipse_at_10%_80%,rgba(6,74,152,0.05),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] [background-size:60px_60px]" />

      {art !== 'none' && (
        <div
          className="pointer-events-none absolute right-[-5%] top-1/2 hidden h-[480px] w-[480px] -translate-y-1/2 opacity-70 lg:block"
          aria-hidden
        >
          {art === 'rings' && (
            <>
              <span className="absolute inset-0 rounded-full border border-emerald-500/20" />
              <span className="absolute inset-[14%] rounded-full border border-emerald-500/15" />
              <span className="absolute inset-[28%] rounded-full border border-emerald-500/10" />
              <span className="absolute inset-[40%] rounded-full bg-gradient-to-br from-emerald-100/60 to-emerald-50/20 blur-2xl" />
            </>
          )}
          {art === 'arch' && (
            <>
              <span className="absolute bottom-0 left-1/2 h-[78%] w-[62%] -translate-x-1/2 rounded-t-full border border-emerald-500/20" />
              <span className="absolute bottom-0 left-1/2 h-[58%] w-[44%] -translate-x-1/2 rounded-t-full border border-emerald-500/15 bg-gradient-to-t from-emerald-50 to-transparent" />
            </>
          )}
          {art === 'veil' && (
            <>
              <span className="absolute inset-[15%] rotate-12 rounded-[38%] bg-gradient-to-br from-emerald-100/40 via-emerald-50/20 to-transparent blur-3xl" />
              <span className="absolute inset-[25%] -rotate-12 rounded-[42%] border border-emerald-500/15" />
            </>
          )}
        </div>
      )}

      <div className={cn('container-naya relative z-10', align === 'center' && 'text-center')}>
        {breadcrumbs && (
          <div className={cn(align === 'center' && 'flex justify-center')}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className={visual ? 'grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12' : undefined}>
          <Reveal>
            {eyebrow && <p className={cn('eyebrow mb-5 text-rose', align === 'center' && 'justify-center')}>{eyebrow}</p>}
            <h1
              className={cn(
                'display max-w-5xl text-[clamp(2.6rem,5.5vw,5rem)] text-slate-900',
                align === 'center' && 'mx-auto',
              )}
            >
              {title}
              {accent && <span className="display-soft text-rose font-normal italic"> {accent}</span>}
            </h1>
            {description && (
              <p
                className={cn(
                  'body-copy mt-6 max-w-2xl text-slate-600',
                  align === 'center' && 'mx-auto',
                )}
              >
                {description}
              </p>
            )}
            {children && <div className="mt-8">{children}</div>}
          </Reveal>
          {visual && <Reveal delay={0.12}>{visual}</Reveal>}
        </div>
      </div>
    </section>
  );
}
