import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarCheck2, Languages, MapPin, Video } from 'lucide-react';
import type { Doctor } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { getDemoStockPortrait } from '@/data/doctors';

export function DoctorCard({
  doctor,
  className,
  priority,
}: {
  doctor: Doctor;
  className?: string;
  priority?: boolean;
}) {
  const next = doctor.nextAvailable;
  const stockPortrait = getDemoStockPortrait(doctor);
  const portraitUrl = stockPortrait?.src ?? doctor.photoUrl;

  return (
    <SpotlightCard
      className={cn(
        'card-surface card-lift group flex h-full flex-col overflow-hidden border border-slate-200 bg-white shadow-sm',
        className,
      )}
      spotlightColor="rgba(25, 166, 0, 0.08)"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {portraitUrl ? (
          <img
            src={portraitUrl}
            alt={stockPortrait ? 'Stock portrait for a fictional profile' : `Illustrated portrait of fictional clinician ${doctor.name}`}
            style={stockPortrait?.position ? { objectPosition: stockPortrait.position } : undefined}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <Avatar name={doctor.name} size="xl" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {doctor.onlineEnabled && (
            <Badge tone="lavender" className="bg-white/95 text-emerald-800 border border-emerald-200 shadow-sm backdrop-blur-md" dot>
              Video
            </Badge>
          )}
          <Badge tone="muted" className="bg-white/95 text-slate-700 border border-slate-200 shadow-sm backdrop-blur-md">
            {stockPortrait ? 'Demo · Stock photo' : 'Demo profile'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-rose">
            {doctor.specializations[0]?.name}
          </p>
          <h3 className="mt-1 font-display text-[21px] font-bold leading-tight text-slate-900">{doctor.name}</h3>
          <p className="mt-1 line-clamp-1 font-sans text-[12px] text-slate-600">{doctor.title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-[11.5px] text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck2 className="h-3.5 w-3.5 text-rose" />
            {doctor.experienceYears} yrs experience
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-rose" />
            {doctor.languages.slice(0, 2).join(', ')}
            {doctor.languages.length > 2 && ` +${doctor.languages.length - 2}`}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 font-body text-[11.5px] text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rose" />
            {doctor.inPersonEnabled ? doctor.city : 'Online only'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-rose" />
            {doctor.onlineEnabled && doctor.inPersonEnabled
              ? 'Video or in person'
              : doctor.onlineEnabled
                ? 'Video consultation'
                : 'In-person only'}
          </span>
        </div>

        <div className="my-4 fine-line" />

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Consultation fee
            </p>
            <p className="mt-1 font-sans text-xl font-bold text-slate-900">
              ₹{(doctor.feePaise / 100).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Next available
            </p>
            <p className="mt-1 font-sans text-[12px] font-bold text-rose">
              {next ? formatDate(next) : 'Check calendar'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to={`/doctors/${doctor.slug}`}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 font-sans text-[11px] font-semibold text-slate-700 shadow-sm transition-all hover:border-rose hover:text-rose hover:bg-emerald-50/50"
          >
            View profile <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <ButtonLink
            to={`/book?doctor=${doctor.slug}`}
            size="sm"
            className="min-h-10 w-full px-3 text-[11px] font-semibold"
          >
            Book now
          </ButtonLink>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function DoctorSkeleton() {
  return (
    <div className="card-surface h-[500px] overflow-hidden">
      <div className="skeleton h-[260px] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}
