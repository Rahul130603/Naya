import React, { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Video, 
  UserCheck, 
  FlaskConical, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp,
  Lock,
  Package,
  CalendarDays,
  LayoutGrid
} from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';
import AnimatedCounter from './ui/AnimatedCounter';
import ShinyText from './ui/ShinyText';
import MagneticButton from './ui/MagneticButton';
import Magnet from './ui/Magnet';
import BorderBeam from './ui/BorderBeam';
import { SPECIALTIES, SYMPTOMS_LIST, DOCTORS } from '../data/healthcareData';

const HERO_HEADLINES = [
  {
    first: <>Science-Backed <span className="text-brand-navy">Sexual Wellness</span></>,
    second: <>Reimagined with <span className="text-brand-navy">naya</span><span className="text-brand-green">cura</span></>,
  },
  {
    first: <>Confidential <span className="text-brand-navy">Sexual Wellness</span></>,
    second: <>Guided by <span className="text-brand-green">Verified Specialists</span></>,
  },
  {
    first: <>Judgment-Free <span className="text-brand-navy">Intimate Care</span></>,
    second: <>For Your Body and <span className="text-brand-green">Your Pace</span></>,
  },
];
const HEADLINE_INTERVAL_MS = 5000;

export default function HeroSection({ 
  selectedCity, 
  onSelectSpecialty, 
  onSelectDoctor,
  onNavigateToTab,
  onStartVideoConsult,
  onOpenSurgeryModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  // Rotate the two-line hero headline like a short looping reel.
  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return undefined;
    const timer = window.setInterval(() => {
      setHeadlineIndex((current) => (current + 1) % HERO_HEADLINES.length);
    }, HEADLINE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  // Filter recommendations based on search input
  const filteredSpecialties = SPECIALTIES.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoctors = DOCTORS.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSymptoms = SYMPTOMS_LIST.filter(sym =>
    sym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sym.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 pt-10 pb-16">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 -z-10 h-96 w-96 rounded-full bg-brand-navy/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-1.5 text-xs font-bold text-brand-green-dark mb-4 shadow-sm animate-fade-in">
            <Lock className="h-3.5 w-3.5 text-brand-green" />
            <span>100% Confidential • Stigma-Free • <ShinyText text="European Board & MCI Certified" className="text-xs" /></span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            <span className="sr-only">Science-Backed Sexual Wellness Reimagined with Nayacura</span>
            <span aria-hidden="true" className="grid">
              {HERO_HEADLINES.map((headline, index) => (
                <span
                  key={index}
                  className={`col-start-1 row-start-1 transition-all duration-700 ease-out ${
                    index === headlineIndex ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                  }`}
                >
                  {headline.first}
                  <br className="hidden sm:inline" />{' '}
                  {headline.second}
                </span>
              ))}
            </span>
          </h1>

          <div aria-hidden="true" className="mx-auto mt-4 flex w-40 items-center gap-1.5">
            {HERO_HEADLINES.map((_, index) => (
              <span
                key={index}
                className={`relative h-1 flex-1 overflow-hidden rounded-full ${index === headlineIndex ? 'bg-brand-green/25' : 'bg-slate-200'}`}
              >
                {index === headlineIndex && (
                  <span key={headlineIndex} className="hero-progress-fill absolute inset-y-0 left-0 rounded-full bg-brand-green" />
                )}
              </span>
            ))}
          </div>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Overcome erectile dysfunction, premature ejaculation, low libido, vaginismus and intimate anxiety with verified sexologists, discreet at-home testing, and judgment-free medical care.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Magnet padding={14} magnetStrength={10} maxOffset={6} wrapperClassName="hero-cta-magnet" innerClassName="flex">
            <button
              type="button"
              onClick={() => onNavigateToTab('booking')}
              className="inline-flex h-11 w-[210px] items-center justify-center gap-2.5 rounded-full border border-brand-navy bg-brand-navy text-xs font-bold text-white shadow-md transition-[background-color,box-shadow] duration-200 hover:bg-brand-navy-dark hover:shadow-glow-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Book Appointment</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
            </Magnet>
            <Magnet padding={14} magnetStrength={10} maxOffset={6} wrapperClassName="hero-cta-magnet" innerClassName="flex">
            <a
              href="#services"
              className="inline-flex h-11 w-[178px] items-center justify-center gap-2.5 rounded-full border border-brand-navy bg-white text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
            >
              <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Explore Services</span>
            </a>
            </Magnet>
          </div>

          {/* Discreet Promise Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-green" /> Zero Stigma & Total Anonymity
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
              <Package className="w-4 h-4 text-brand-navy" /> 100% Unbranded Plain Box Packaging
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
              <Lock className="w-4 h-4 text-brand-green" /> Doctor-Patient Confidentiality
            </span>
          </div>
        </div>

        {/* Practo-Style Universal Search Bar for Sexual Health */}
        <div className="max-w-4xl mx-auto mb-12 relative z-30">
          <div className="rounded-3xl bg-white p-2 sm:p-2.5 shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-brand-green/20">
            
            {/* Location Indicator */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 w-full md:w-56 border-b md:border-b-0 md:border-r border-slate-200 text-slate-700">
              <MapPin className="h-5 w-5 text-brand-green flex-shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                <span className="text-sm font-semibold truncate text-slate-800">{selectedCity}</span>
              </div>
            </div>

            {/* Entity Search Input */}
            <div className="relative flex-1 w-full flex items-center px-3 py-1">
              <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search concerns (e.g. ED, Premature Ejaculation, Low Libido, Vaginismus, STIs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className="w-full text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search CTA */}
            <MagneticButton
              onClick={() => {
                onNavigateToTab('home');
                setIsFocused(false);
              }}
              className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-glow-navy"
            >
              <span>Search</span>
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </div>

          {/* Search Dropdown Modal/Suggestions */}
          {isFocused && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setIsFocused(false)} 
              />
              <div className="absolute left-0 right-0 mt-3 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 z-30 max-h-96 overflow-y-auto animate-slide-up">
                
                {/* Popular Concerns */}
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                    Common Sexual Health Concerns
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filteredSymptoms.map((sym) => (
                      <button
                        key={sym.id}
                        onClick={() => {
                          setSearchQuery(sym.specialty);
                          setIsFocused(false);
                          onSelectSpecialty(sym.specialty);
                        }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-brand-green border border-slate-200 transition"
                      >
                        {sym.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                {filteredSpecialties.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Specialties
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredSpecialties.map((spec) => (
                        <button
                          key={spec.id}
                          onClick={() => {
                            setSearchQuery(spec.name);
                            setIsFocused(false);
                            onSelectSpecialty(spec.name);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition"
                        >
                          <div>
                            <div className="text-sm font-bold text-slate-800">{spec.name}</div>
                            <div className="text-xs text-slate-400">{spec.desc}</div>
                          </div>
                          <span className="text-xs text-brand-green font-bold">View →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctors matching */}
                {filteredDoctors.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Sexologists in {selectedCity}
                    </div>
                    <div className="space-y-2">
                      {filteredDoctors.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            setIsFocused(false);
                            onSelectDoctor(doc);
                          }}
                          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-emerald-50/50 text-left transition border border-transparent hover:border-emerald-100"
                        >
                          <img src={doc.photo} alt={doc.name} className="w-10 h-10 rounded-full object-cover border" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{doc.name}</div>
                            <div className="text-xs text-slate-500">{doc.specialty} • {doc.area}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-brand-navy">₹{doc.fee}</span>
                            <div className="text-[10px] text-emerald-600 font-bold">Available Today</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 4 Hero Action Cards (100% Sexual Wellness) */}
        <div id="services" className="grid scroll-mt-28 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Instant Discreet Video/Audio Call */}
          <SpotlightCard 
            spotlightColor="rgba(22, 163, 74, 0.18)"
            className="group cursor-pointer p-6 hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            <BorderBeam color="#16A34A" duration={6} className="opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div onClick={() => onStartVideoConsult()} className="h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center shadow-inner group-hover:bg-brand-green group-hover:text-white transition duration-300">
                    <Video className="w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-extrabold text-brand-green-dark">
                    <Lock className="w-3 h-3 text-brand-green" />
                    100% Private
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-green-dark transition">
                  Discreet Online Consult
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Connect with a clinical sexologist in 60s. Audio/Video option with camera off toggle.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">From ₹500</span>
                <span className="text-xs font-bold text-brand-green flex items-center gap-1 group-hover:translate-x-1 transition">
                  Consult Now →
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Discreet Online Audio Consult */}
          <SpotlightCard 
            spotlightColor="rgba(11, 59, 130, 0.18)"
            borderColor="hover:border-brand-navy/40"
            className="group cursor-pointer p-6 hover:-translate-y-1 transition-all"
          >
            <div onClick={() => onNavigateToTab('home')} className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-navy flex items-center justify-center shadow-inner group-hover:bg-brand-navy group-hover:text-white transition duration-300">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-blue-100/80 px-2.5 py-1 text-[11px] font-extrabold text-brand-navy">
                    Video &amp; Audio
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy group-hover:text-brand-navy-light transition">
                  Scheduled Online Consult
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Book a dedicated video or audio slot with top Sexologists, Andrologists, and Female Intimacy doctors.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">100% Online</span>
                <span className="text-xs font-bold text-brand-navy flex items-center gap-1 group-hover:translate-x-1 transition">
                  Book Slot →
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Hormone & STI Home Tests */}
          <SpotlightCard 
            spotlightColor="rgba(16, 185, 129, 0.18)"
            className="group cursor-pointer p-6 hover:-translate-y-1 transition-all"
          >
            <div onClick={() => onNavigateToTab('lab-tests')} className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-teal-100/80 px-2.5 py-1 text-[11px] font-extrabold text-teal-800">
                    Discreet Kit
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy group-hover:text-teal-700 transition">
                  Hormone & STI Panels
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Testosterone, Free T, and confidential 7-panel STI screening in a sealed tamper-proof kit.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">100% Anonymous</span>
                <span className="text-xs font-bold text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Order Test →
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Intimate Procedures & Treatments */}
          <SpotlightCard 
            spotlightColor="rgba(79, 70, 229, 0.18)"
            borderColor="hover:border-indigo-400"
            className="group cursor-pointer p-6 hover:-translate-y-1 transition-all"
          >
            <div onClick={() => onOpenSurgeryModal()} className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="rounded-full bg-indigo-100/80 px-2.5 py-1 text-[11px] font-extrabold text-indigo-900">
                    Nayacura Care
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy group-hover:text-indigo-700 transition">
                  Intimate Procedures
                </h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Painless ZSR Laser Circumcision, Shockwave ED Therapy, and Vaginismus Botox Protocol.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Cashless Insurance</span>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                  Explore Care →
                </span>
              </div>
            </div>
          </SpotlightCard>

        </div>

        {/* Live Trust Metrics Bar */}
        <div className="mt-16 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-card-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            <div className="pt-2 md:pt-0">
              <div className="text-2xl sm:text-4xl font-black text-brand-navy">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                Confidential & Anonymous
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-4xl font-black text-brand-green">
                <AnimatedCounter end={85000} suffix="+" />
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                Intimate Health Patients Treated
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-4xl font-black text-brand-navy">
                <AnimatedCounter end={99} suffix=".2%" />
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                Patient Recommendation Score
              </p>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-4xl font-black text-brand-green">
                <AnimatedCounter end={100} suffix="% Plain" />
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                Unbranded Discreet Packaging
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
