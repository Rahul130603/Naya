import React, { useState } from 'react';
import { Building2, Stethoscope, CheckCircle2, ShieldCheck, ArrowRight, Lock, Users, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ForSexologistsPage({ onOpenDoctorOnboarding }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [regNo, setRegNo] = useState('');
  const [specialty, setSpecialty] = useState('Clinical Sexologist');
  const [city, setCity] = useState('Chennai');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsDone(true);
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mint Green Wave Hero Banner */}
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm mb-12 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Stethoscope className="w-3.5 h-3.5 text-[#16A34A]" />
              For Healthcare Providers & Specialists
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Join the Nayacura Sexual Medicine Network
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Expand your clinical practice, consult thousands of verified patients seeking confidential care, and practice with state-of-the-art encrypted EMR and teleconsult tools.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenDoctorOnboarding ? onOpenDoctorOnboarding() : null}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply to Join Network</span>
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>Encrypted EMR & 100% Patient Anonymity</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars for Sexologists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy">High Patient Intent</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Connect with patients genuinely seeking help for ED, PE, vaginismus, and hormonal health who value expert medical care.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-navy flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy">Encrypted EMR & Rx</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Generate digital prescriptions, track patient biomarker histories, and conduct audio/video consultations within a secure HIPAA suite.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-navy">ABDM & MCI Verified</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              All partner sexologists undergo strict medical council verification, ensuring patients receive the highest standard of evidence-based care.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-2xl mx-auto">
          {isDone ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy">Application Received!</h3>
              <p className="text-xs text-slate-600">
                Thank you, Dr. {name}. Our Medical Director will review your registration (Reg No: {regNo}) and contact you at +91 {phone} within 24 hours to complete verification.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-brand-navy mb-4">Register Your Practice (Free)</h3>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Anandha Krishnan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Medical Reg. Number</label>
                  <input
                    type="text"
                    required
                    placeholder="TN-MCI-48192"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    <option>Clinical Sexologist</option>
                    <option>Andrologist & Urologist</option>
                    <option>Women's Sexual Health</option>
                    <option>Psychologist & Sex Therapist</option>
                    <option>Venereologist / STI Specialist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    <option>Chennai</option>
                    <option>Bangalore</option>
                    <option>Hyderabad</option>
                    <option>Mumbai</option>
                    <option>Delhi NCR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition"
              >
                Submit Provider Verification
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
