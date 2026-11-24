import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  Video, 
  CheckCircle2, 
  ThumbsUp, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Lock
} from 'lucide-react';
import { DOCTORS, SPECIALTIES } from '../data/healthcareData';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

export default function DoctorDirectory({ 
  selectedCity, 
  selectedSpecialty, 
  setSelectedSpecialty,
  onBookAppointment,
  onStartVideoConsult
}) {
  const [filterAvailability, setFilterAvailability] = useState('all'); // all | today | tomorrow
  const [filterMode, setFilterMode] = useState('all'); // all | clinic | video
  const [sortBy, setSortBy] = useState('rating'); // rating | experience | fee

  // Filter Doctors
  const filteredDoctors = DOCTORS.filter((doc) => {
    // Specialty filter
    if (selectedSpecialty && selectedSpecialty !== 'All') {
      if (!doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
        return false;
      }
    }
    // Availability filter
    if (filterAvailability === 'today' && !doc.availableToday) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experience - a.experience;
    if (sortBy === 'fee') return a.fee - b.fee;
    return 0;
  });

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
              Consult verified European Board & MCI certified sexologists. Select clinic consultation or instant confidential audio/video call with zero waiting time.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => onStartVideoConsult ? onStartVideoConsult() : null}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <Video className="w-4 h-4" />
                <span>Instant Video Consult in 60s</span>
              </MagneticButton>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>MCI & European Board Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>Zero Booking Fee • 100% Private</span>
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

            {/* Mode Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg transition ${filterMode === 'all' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-600'}`}
              >
                All Modes
              </button>
              <button
                onClick={() => setFilterMode('video')}
                className={`px-3 py-1 rounded-lg transition ${filterMode === 'video' ? 'bg-brand-green text-white shadow-sm' : 'text-slate-600'}`}
              >
                Discreet Video Call
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
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-card-soft hover:shadow-xl hover:border-brand-green/30 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Doctor Photo & Badges */}
                  <div className="flex flex-wrap sm:flex-col items-center sm:items-start gap-4 lg:shrink-0">
                    <div className="relative">
                      <img 
                        src={doc.photo} 
                        alt={doc.name} 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-100 shadow-md group-hover:scale-102 transition duration-300" 
                      />
                      <div className="absolute -bottom-2 -right-2 bg-brand-green text-white p-1 rounded-full shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col gap-1 text-left">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-brand-green-dark">
                        <ThumbsUp className="w-3 h-3 text-brand-green" />
                        {doc.rating}% ({doc.reviewsCount} Stories)
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {doc.experience} Years Experience
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-green-dark transition flex items-center gap-2">
                          {doc.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {doc.degree}
                        </p>
                        <p className="text-sm font-bold text-brand-green mt-1">
                          {doc.specialty}
                        </p>
                      </div>

                      {/* Fee Box */}
                      <div className="text-right bg-slate-50 border border-slate-100 rounded-2xl p-3 px-4">
                        <div className="text-xs text-slate-400 font-semibold">Confidential Consultation</div>
                        <div className="text-lg font-extrabold text-brand-navy">
                          ₹{doc.fee} <span className="text-[10px] text-slate-400 font-normal">at clinic</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-600 mt-0.5">
                          Discreet Video: ₹{doc.videoFee}
                        </div>
                      </div>
                    </div>

                    {/* About snippet */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                      {doc.about}
                    </p>

                    {/* Clinic Address & Languages */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{doc.clinicName}</span>
                          <p className="text-slate-500 break-words">{doc.clinicAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div>
                          {doc.availableToday ? (
                            <span className="font-bold text-emerald-600">Available Today (100% Private Room)</span>
                          ) : (
                            <span className="font-bold text-amber-600">Next Available Tomorrow</span>
                          )}
                          <p className="text-slate-400">
                            Languages: {doc.languages.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Services Offered */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {doc.services.slice(0, 4).map((serv, idx) => (
                        <span key={idx} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          {serv}
                        </span>
                      ))}
                    </div>

                    {/* Available Slot Pills Preview */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-green" />
                        Confidential Slots for {doc.availableToday ? 'Today' : 'Tomorrow'}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(doc.availableToday ? doc.slots.today : doc.slots.tomorrow).slice(0, 4).map((slot, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs font-bold text-brand-green-dark"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                      <button
                        onClick={() => onBookAppointment(doc, 'clinic')}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition hover:shadow-glow-navy flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-brand-green-light" />
                        <span>Book Confidential In-Clinic Visit</span>
                      </button>

                      <button
                        onClick={() => onStartVideoConsult(doc)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-green-soft border border-emerald-300 hover:bg-brand-green hover:text-white text-brand-green-dark font-bold text-xs transition flex items-center justify-center gap-2 group-btn"
                      >
                        <Video className="w-4 h-4" />
                        <span>Discreet Video/Audio Call (₹{doc.videoFee})</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
