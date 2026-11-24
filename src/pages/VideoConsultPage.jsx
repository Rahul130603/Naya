import React from 'react';
import { Video, Lock, ShieldCheck, Clock, UserCheck, EyeOff, Sparkles } from 'lucide-react';
import DoctorDirectory from '../components/DoctorDirectory';
import MagneticButton from '../components/ui/MagneticButton';
import ShinyText from '../components/ui/ShinyText';

export default function VideoConsultPage({ 
  selectedCity, 
  selectedSpecialty, 
  setSelectedSpecialty, 
  onBookAppointment, 
  onStartVideoConsult 
}) {
  return (
    <div className="pt-6">
      {/* Telehealth Hero Banner styled with user's mint green wave design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="100% Confidential Online Consultation" className="text-xs uppercase tracking-wider" />
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Consult Top Sexologists Online in 60 Seconds
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Skip travel and waiting rooms. Talk privately about ED, premature ejaculation, low libido, vaginismus or STI doubts with verified European Board & MCI certified sexologists.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => onStartVideoConsult()}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <Video className="w-4 h-4" />
                <span>Connect to Doctor Now (Audio/Video)</span>
              </MagneticButton>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <EyeOff className="w-4 h-4 text-[#16A34A]" />
                <span>Audio-Only Option (Camera Off)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>256-Bit Encrypted Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory of Specialists */}
      <DoctorDirectory
        selectedCity={selectedCity}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        onBookAppointment={onBookAppointment}
        onStartVideoConsult={onStartVideoConsult}
      />
    </div>
  );
}
