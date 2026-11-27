import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  ShieldCheck, 
  Package, 
  ArrowRight, 
  Sparkles, 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import HealthFeedSection from '../components/HealthFeedSection';
import TestimonialsSection from '../components/TestimonialsSection';
import MobileAppSection from '../components/MobileAppSection';
import SpotlightCard from '../components/ui/SpotlightCard';
import InfiniteMarquee from '../components/ui/InfiniteMarquee';
import IntimacyAssessmentWidget from '../components/IntimacyAssessmentWidget';
import HowItWorksSection from '../components/HowItWorksSection';
import NayaAiBannerSection from '../components/NayaAiBannerSection';
import { SPECIALTIES, DOCTORS } from '../data/healthcareData';
import { CONDITIONS_DATA } from '../data/conditionsData';

export default function HomePage({ 
  selectedCity, 
  onBookAppointment, 
  onOpenBookingSchedule,
  onStartVideoConsult,
  onOpenSurgeryModal
}) {
  const navigate = useNavigate();

  const conditionKeys = [
    { key: 'erectile-dysfunction', label: 'Erectile Dysfunction Care', desc: 'Vascular & psychological solutions for firm erections', icon: 'Sparkles', color: 'from-blue-500/10 to-indigo-500/10' },
    { key: 'premature-ejaculation', label: 'Premature Ejaculation Care', desc: 'Delay sprays, serotonin modulation & lasting techniques', icon: 'Clock', color: 'from-emerald-500/10 to-teal-500/10' },
    { key: 'vaginismus', label: 'Vaginismus Rehabilitation', desc: 'Painless intimacy with dilators & pelvic desensitization', icon: 'HeartHandshake', color: 'from-rose-500/10 to-pink-500/10' },
    { key: 'testosterone', label: 'At-Home Testosterone Test', desc: 'Accurate 14-marker biomarker panel in sealed kit', icon: 'ShieldCheck', color: 'from-amber-500/10 to-orange-500/10' },
    { key: 'sti-screening', label: 'Confidential 7-Panel STI Test', desc: '100% anonymous PCR screening with encrypted results', icon: 'Lock', color: 'from-teal-500/10 to-cyan-500/10' },
    { key: 'zsr-circumcision', label: 'Painless ZSR Circumcision', desc: '15-min daycare stapler procedure with zero stitches', icon: 'Award', color: 'from-indigo-500/10 to-purple-500/10' },
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection
        selectedCity={selectedCity}
        onSelectSpecialty={(spec) => navigate(`/consult-sexologist?specialty=${encodeURIComponent(spec)}`)}
        onSelectDoctor={(doc) => onBookAppointment(doc, 'video')}
        onNavigateToTab={(tab) => {
          if (tab === 'booking') onOpenBookingSchedule();
          if (tab === 'home') navigate('/consult-sexologist');
          else if (tab === 'video-consult') navigate('/video-consult');
          else if (tab === 'lab-tests') navigate('/lab-tests');
          else if (tab === 'surgeries') navigate('/intimate-procedures');
          else if (tab === 'medicines') navigate('/wellness-store');
        }}
        onStartVideoConsult={onStartVideoConsult}
        onOpenSurgeryModal={() => navigate('/intimate-procedures')}
      />

      {/* React Bits Infinite Marquee for Clinical Trust & Discretion Tape */}
      <InfiniteMarquee />

      {/* 2. 60-Second Confidential Intimacy Assessment (Interactive Stepper Widget) */}
      <IntimacyAssessmentWidget onStartVideoConsult={onStartVideoConsult} />

      {/* 3. Explore Specific Conditions Section (Practo-Style Condition Directory) */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Specialized Condition Care
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
                Explore Intimate Health Treatments by Condition
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Click any condition to view causes, treatment protocols, and verified specialists.
              </p>
            </div>

            <Link 
              to="/consult-sexologist" 
              className="text-xs font-bold text-brand-green hover:text-brand-green-dark flex items-center gap-1 transition"
            >
              <span>View All 50+ Doctors</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Condition Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditionKeys.map((c) => (
              <Link
                key={c.key}
                to={`/condition/${c.key}`}
                className="group p-6 rounded-3xl border border-slate-200/90 hover:border-brand-green/40 hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 uppercase tracking-wider">
                      Condition Guide
                    </span>
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-green-dark transition">
                    {c.label}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">100% Confidential</span>
                  <span className="font-bold text-brand-green group-hover:translate-x-1 transition">
                    View Protocol →
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Featured Sexologists Preview */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy uppercase tracking-wider mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-brand-green" />
                Verified Clinical Providers
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
                Consult Top Sexologists & Specialists in {selectedCity}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                European Board & MCI certified doctors with private consulting rooms and video chambers.
              </p>
            </div>

            <Link 
              to="/consult-sexologist"
              className="px-5 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition"
            >
              See All Specialists
            </Link>
          </div>

          {/* Doctor Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOCTORS.slice(0, 3).map((doc) => (
              <div 
                key={doc.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      onError={(event) => {
                        const img = event.currentTarget;
                        if (img.dataset.fallback) return;
                        img.dataset.fallback = 'true';
                        const initials = doc.name
                          .replace(/^Dr\.?\s*/i, '')
                          .split(/\s+/)
                          .map((part) => part[0] || '')
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();
                        img.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#E8F5EC"/><text x="80" y="100" font-family="Inter, system-ui, sans-serif" font-size="58" font-weight="700" fill="#15803D" text-anchor="middle">${initials}</text></svg>`,
                        )}`;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow"
                    />
                    <div>
                      <h4 className="font-bold text-brand-navy text-base">{doc.name}</h4>
                      <p className="text-xs text-brand-green font-bold">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400">{doc.experience} Years Experience</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {doc.about}
                  </p>

                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">100% Online Consultation</span>
                    <p className="truncate text-[11px]">Encrypted Video &amp; Audio Call · {doc.city}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Video / Audio Fee</span>
                    <span className="text-base font-extrabold text-brand-navy">₹{doc.videoFee || doc.fee}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onBookAppointment(doc, 'video')}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-dark transition"
                    >
                      Book Online
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Confidential Naya AI Companion Spotlight */}
      <NayaAiBannerSection />

      {/* 5. How Nayacura Works — 3-Step 100% Discreet Journey & Privacy FAQ */}
      <HowItWorksSection onStartVideoConsult={onStartVideoConsult} />

      {/* 6. Health Feed, Testimonials & Mobile App */}
      <HealthFeedSection />
      <TestimonialsSection />
      <MobileAppSection />
    </div>
  );
}
