import React, { useEffect, useMemo, useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Video, 
  CheckCircle2, 
  ThumbsUp, 
  SlidersHorizontal,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { DOCTORS, SPECIALTIES } from '../data/healthcareData';
import { formatTime, hasSavedSchedule, hydrateSchedule, loadSchedule, slotsForDate, subscribeSchedule } from '../lib/practiceSchedule';
import { getDoctorProfileOverride, hydratePublicDoctors, listPublicDoctors, subscribeRegistry } from '../lib/doctorRegistry';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

const normalizeText = (value = '') => String(value).toLowerCase().replace(/[’']/g, "'").trim();

const matchesSpecialty = (docSpecialty = '', filterSpecialty = '') => {
  if (!filterSpecialty || filterSpecialty === 'All') return true;
  const doc = normalizeText(docSpecialty);
  const target = normalizeText(filterSpecialty);
  if (doc.includes(target) || target.includes(doc)) return true;
  const aliases = {
    'clinical sexologist': ['sexolog'],
    'andrologist & urologist': ['androlog', 'urolog'],
    "women's sexual health": ["women's sexual", 'female sexual'],
    'psychologist & sex therapist': ['psychosexual', 'sex therap', 'psycholog'],
    'venereologist / sti specialist': ['sti', 'venereolog', 'std'],
    'pelvic floor physiotherapist': ['pelvic'],
  };
  return (aliases[target] || []).some((token) => doc.includes(token));
};

const parseLanguages = (languages) => {
  if (Array.isArray(languages) && languages.length) return languages;
  if (typeof languages === 'string' && languages.trim()) {
    return languages.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return ['Tamil', 'English'];
};

// Some profile photos point at remote URLs that can 404; fall back to a tidy
// initials avatar instead of the browser's broken-image placeholder.
const initialsAvatar = (name = '') => {
  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#E8F5EC"/><text x="80" y="100" font-family="Inter, system-ui, sans-serif" font-size="58" font-weight="700" fill="#15803D" text-anchor="middle">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export default function DoctorDirectory({ 
  selectedCity, 
  selectedSpecialty, 
  setSelectedSpecialty,
  onBookAppointment,
  onStartVideoConsult
}) {
  const [filterAvailability, setFilterAvailability] = useState('all'); // all | today | tomorrow
  const [sortBy, setSortBy] = useState('rating'); // rating | experience | fee

  // Approved clinicians live in the local registry & shared backend registry.
  const [registryVersion, setRegistryVersion] = useState(0);
  const [scheduleVersion, setScheduleVersion] = useState(0);
  useEffect(() => {
    void hydratePublicDoctors();
    return subscribeRegistry(() => setRegistryVersion((value) => value + 1));
  }, []);
  useEffect(() => subscribeSchedule(() => setScheduleVersion((value) => value + 1)), []);
  void scheduleVersion;

  const registryDoctors = useMemo(() => {
    void registryVersion;
    const accounts = listPublicDoctors();
    return accounts
      .filter((account) => !DOCTORS.some((doc) => doc.name.toLowerCase() === account.name.toLowerCase()))
      .map((account) => ({
        id: account.id,
        name: account.name,
        specialty: account.specialty || 'Clinical Sexologist',
        degree: [account.qualifications, account.university].filter(Boolean).join(' · ') || 'MBBS, Sexual Medicine',
        experience: parseInt(String(account.experience || ''), 10) || 10,
        rating: 98,
        reviewsCount: 0,
        city: account.city || 'Chennai',
        area: '',
        clinicName: account.clinicName || account.clinic || 'Nayacura Partner Clinic',
        clinicAddress: account.city || 'Chennai',
        fee: Number(account.fee) || 800,
        videoFee: Number(account.videoFee) || 599,
        photo: account.photoUrl || initialsAvatar(account.name),
        languages: parseLanguages(account.languages),
        about: account.about || `${account.name} is a verified ${account.specialty || 'sexual wellness specialist'} serving patients in ${account.city || 'Chennai'} with confidential, judgment-free care.`,
        services: ['Confidential Consultation', 'Private Follow-up'],
        availableToday: true,
        slots: {
          today: ['10:00 AM', '11:00 AM', '04:00 PM', '05:00 PM'],
          tomorrow: ['10:30 AM', '12:00 PM', '03:00 PM', '06:00 PM'],
        },
      }));
  }, [registryVersion]);

  // Pull published schedules so availability matches what the doctor saved.
  useEffect(() => {
    [...registryDoctors, ...DOCTORS].forEach((doc) => {
      void hydrateSchedule(doc.name);
    });
  }, [registryDoctors]);

  const slotsForTargetDay = (schedule, target) => {
    const primary = slotsForDate(schedule, target, 'online');
    if (primary.length > 0) {
      return primary.some((slot) => slot.selected) ? primary : primary.slice(0, 4);
    }
    return [];
  };

  /**
   * Slot pills & availability state for a card. When the clinician has published
   * a practice schedule we show their real saved slots; otherwise the curated
   * demo times are used.
   */
  const resolveCardAvailability = (doc) => {
    if (!hasSavedSchedule(doc.name)) {
      const base = doc.availableToday ? doc.slots.today : doc.slots.tomorrow;
      return {
        availableToday: doc.availableToday,
        dayLabel: doc.availableToday ? 'Today' : 'Tomorrow',
        slots: base.slice(0, 4).map((label) => ({ label, extended: false })),
      };
    }
    const schedule = loadSchedule(doc.name);
    const today = new Date();
    const todaySlots = slotsForTargetDay(schedule, today);
    if (todaySlots.length > 0) {
      return {
        availableToday: true,
        dayLabel: 'Today',
        slots: todaySlots,
      };
    }
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowSlots = slotsForTargetDay(schedule, tomorrow);
    if (tomorrowSlots.length > 0) {
      return {
        availableToday: false,
        dayLabel: 'Tomorrow',
        slots: tomorrowSlots,
      };
    }
    return {
      availableToday: false,
      dayLabel: 'Today',
      slots: [],
    };
  };

  // Filter Doctors (merge any locally saved clinician profile/photo overrides)
  const filteredDoctors = [...registryDoctors, ...DOCTORS].map((doc) => {
    const override = getDoctorProfileOverride(doc.email, doc.name);
    if (!override) return doc;
    return {
      ...doc,
      specialty: override.specialty || doc.specialty,
      clinicName: override.clinicName || override.clinic || doc.clinicName,
      city: override.city || doc.city,
      videoFee: override.videoFee ? Number(override.videoFee) : doc.videoFee,
      about: override.about || doc.about,
      photo: override.photoUrl || doc.photo,
    };
  }).filter((doc) => {
    // Specialty filter
    if (selectedSpecialty && selectedSpecialty !== 'All') {
      if (!matchesSpecialty(doc.specialty, selectedSpecialty)) {
        return false;
      }
    }
    // Availability filter
    if (filterAvailability === 'today' && !resolveCardAvailability(doc).availableToday) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experience - a.experience;
    if (sortBy === 'fee') return a.fee - b.fee;
    return 0;
  });

  /** Extended slots read as a range so the extra time is obvious. */
  const slotPillLabel = (slot) => {
    if (!slot.extended || typeof slot.endMinutes !== 'number') return slot.label;
    const hh = `${String(Math.floor(slot.endMinutes / 60)).padStart(2, '0')}:${String(slot.endMinutes % 60).padStart(2, '0')}`;
    return `${slot.label} – ${formatTime(hh)} · 1h`;
  };

  return (
    <section id="doctor-directory" className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card styled with user's mint green wave design */}
        <div 
          className="p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-sm mb-8 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="100% Confidential & Judgment-Free Specialists" className="text-xs uppercase tracking-wider" />
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Top Sexologists & Sexual Wellness Doctors in {selectedCity}
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Consult verified European Board &amp; MCI certified sexologists online via confidential video or audio call with zero waiting time.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => onStartVideoConsult ? onStartVideoConsult() : null}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <Video className="w-4 h-4" />
                <span>Instant Video / Audio Consult in 60s</span>
              </MagneticButton>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>MCI &amp; European Board Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>100% Online • Video &amp; Audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specialty Filter Scroll Bar */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2.5 min-w-max">
            <button
              onClick={() => setSelectedSpecialty('All')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                !selectedSpecialty || selectedSpecialty === 'All'
                  ? 'bg-brand-navy text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Specialists
            </button>
            {SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialty === spec.name;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(isSelected ? 'All' : spec.name)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-green text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-brand-green border border-slate-200'
                  }`}
                >
                  <span>{spec.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {spec.doctorCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by:
            </span>
            
            {/* Availability Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setFilterAvailability('all')}
                className={`px-3 py-1 rounded-lg transition ${filterAvailability === 'all' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-600'}`}
              >
                Any Day
              </button>
              <button
                onClick={() => setFilterAvailability('today')}
                className={`px-3 py-1 rounded-lg transition ${filterAvailability === 'today' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600'}`}
              >
                Available Today
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex w-full min-w-0 items-center gap-2 text-xs sm:w-auto">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort specialists"
              className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="rating">Patient Rating (High to Low)</option>
              <option value="experience">Experience (High to Low)</option>
              <option value="fee">Consultation Fee (Low to High)</option>
            </select>
          </div>

        </div>

        {/* Doctor Cards List */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No specialists match your criteria</h3>
            <p className="text-sm text-slate-500 mt-1">Try resetting the specialty or availability filters.</p>
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setFilterAvailability('all');
              }}
              className="mt-4 px-5 py-2 rounded-full bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-dark transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDoctors.map((doc) => {
              const availability = resolveCardAvailability(doc);
              const onlineFee = doc.videoFee || doc.fee;
              return (
              <div
                key={doc.id}
                className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card-soft transition-all duration-300 hover:border-brand-green/30 hover:shadow-xl sm:rounded-3xl sm:p-7"
              >
                <div className="flex flex-col gap-5 md:flex-row md:gap-6">

                  {/* Doctor Photo & Badges */}
                  <div className="flex flex-wrap items-start gap-4 md:shrink-0 md:flex-col md:gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.dataset.fallback) return;
                          img.dataset.fallback = 'true';
                          img.src = initialsAvatar(doc.name);
                        }}
                        className="h-20 w-20 rounded-2xl border-2 border-slate-100 object-cover shadow-md transition duration-300 group-hover:scale-[1.02] sm:h-28 sm:w-28"
                      />
                      <span className="absolute -bottom-1.5 -right-1.5 grid place-items-center rounded-full bg-brand-green p-1 text-white shadow-md ring-2 ring-white">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 md:flex-none">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold leading-none text-brand-green-dark">
                        <ThumbsUp className="h-3 w-3 text-brand-green" aria-hidden="true" />
                        {doc.reviewsCount > 0 ? `${doc.rating}% (${doc.reviewsCount} Stories)` : 'Newly verified'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {doc.experience} Years Experience
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold leading-snug text-brand-navy transition group-hover:text-brand-green-dark sm:text-[22px]">
                          {doc.name}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                          {doc.degree}
                        </p>
                        <p className="mt-1.5 text-sm font-bold text-brand-green">
                          {doc.specialty}
                        </p>
                      </div>

                      {/* Fee box — tablet & desktop */}
                      <div className="hidden shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right sm:block">
                        <div className="text-xs font-semibold text-slate-400">Online Consultation</div>
                        <div className="text-lg font-extrabold text-brand-navy">
                          ₹{onlineFee}
                        </div>
                        <div className="mt-0.5 text-[11px] font-bold text-emerald-600">
                          Video or Audio Call
                        </div>
                      </div>
                    </div>

                    {/* Fee strip — phone */}
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:hidden">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Online Consultation</div>
                        <div className="text-[11px] font-semibold text-emerald-600">Video or Audio Call</div>
                      </div>
                      <div className="text-base font-extrabold text-brand-navy">₹{onlineFee}</div>
                    </div>

                    {/* About snippet */}
                    <p className="mt-4 text-[13px] leading-relaxed text-slate-600 line-clamp-2 sm:text-xs">
                      {doc.about}
                    </p>

                    {/* Online Consult Info & Languages */}
                    <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Video className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-green" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800">100% Online Consultation</span>
                          <p className="text-slate-500">Video &amp; Audio Call supported · {doc.city}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <div className="min-w-0">
                          {availability.availableToday ? (
                            <span className="font-bold text-emerald-600">Available Today (Private Online Room)</span>
                          ) : (
                            <span className="font-bold text-amber-600">Next Available {availability.dayLabel}</span>
                          )}
                          <p className="text-slate-500">
                            Languages: {doc.languages.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Services Offered */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {doc.services.slice(0, 4).map((serv, idx) => (
                        <span key={idx} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {serv}
                        </span>
                      ))}
                    </div>

                    {/* Available Slot Pills Preview */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-brand-green" />
                        Online Slots for {availability.dayLabel}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                        {availability.slots.slice(0, 8).map((slot, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-emerald-200/70 bg-emerald-50/70 px-1 py-1.5 text-center text-[11px] font-bold text-brand-green-dark sm:px-2.5"
                          >
                            {slotPillLabel(slot)}
                          </span>
                        ))}
                        {availability.slots.length > 8 && (
                          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-center text-[11px] font-bold text-slate-600">
                            +{availability.slots.length - 8} more
                          </span>
                        )}
                      </div>
                      {availability.slots.length === 0 && (
                        <p className="text-[11px] text-slate-400">No slots published for this day.</p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                      <button
                        onClick={() => onBookAppointment(doc, 'online')}
                        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-brand-navy-dark hover:shadow-glow-navy sm:flex-none"
                      >
                        <Calendar className="h-4 w-4 text-brand-green-light" aria-hidden="true" />
                        <span>Book Online Consultation</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
