import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Car, 
  PhoneCall, 
  Clock, 
  CreditCard, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Lock,
  Zap
} from 'lucide-react';
import { SURGERIES } from '../data/healthcareData';
import Modal from './ui/Modal';
import confetti from 'canvas-confetti';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

export default function SurgeriesSection({ selectedCity }) {
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [insuranceCover, setInsuranceCover] = useState('Yes');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOpenConsult = (surgery) => {
    setSelectedSurgery(surgery);
    setIsModalOpen(true);
    setIsSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <section id="surgeries" className="py-14 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intimate Procedures Hero Banner styled with user's mint green wave design */}
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm mb-12 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="Nayacura Care • Clinical Intimate Procedures" className="text-xs uppercase tracking-wider" />
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Painless, Minimally Invasive & Discreet Procedures
            </h2>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              From modern ZSR laser circumcision to non-invasive acoustic shockwave therapy for ED and vaginismus interventions, experience world-class intimate surgery with total confidentiality.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => handleOpenConsult(SURGERIES[0])}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book Free Confidential Procedure Consult</span>
              </MagneticButton>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>0% Interest EMI Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <UserCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Dedicated Care Coordinator</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Nayacura Care */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Privacy & Discretion</h4>
              <p className="text-xs text-slate-500 mt-0.5">Private room consultations and anonymous hospital desk check-in.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-brand-green flex-shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Personal Care Coordinator</h4>
              <p className="text-xs text-slate-500 mt-0.5">A dedicated assistant guides you discreetly through hospital formalities.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Cashless Insurance Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">All TPA claims for medical circumcisions & varicocele handled.</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-600 flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Post-Op Doctor Follow-ups</h4>
              <p className="text-xs text-slate-500 mt-0.5">Complimentary recovery reviews and healing monitoring.</p>
            </div>
          </div>
        </div>

        {/* Procedures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SURGERIES.map((surg) => (
            <div 
              key={surg.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {surg.stayDuration}
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {surg.coverCashless ? 'Cashless Insurance Eligible' : '0% EMI Available'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-brand-navy group-hover:text-indigo-600 transition">
                  {surg.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {surg.tagline}
                </p>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  {surg.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Estimated Package</span>
                  <span className="text-lg font-extrabold text-brand-navy">{surg.startingPrice}</span>
                </div>

                <button
                  onClick={() => handleOpenConsult(surg)}
                  className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Book Free Evaluation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Surgery Callback Modal */}
      {selectedSurgery && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isSubmitted ? "Confidential Request Received!" : `Discreet Consultation: ${selectedSurgery.name}`}
          subtitle={isSubmitted ? "A Senior Medical Coordinator will contact you confidentially." : "Get transparent pricing & cashless eligibility check"}
          maxWidth="max-w-md"
        >
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-brand-navy">Thank you, {patientName}!</h4>
              <p className="text-xs text-slate-600">
                A dedicated Nayacura Care Manager will call you confidentially at <strong>+91 {patientPhone}</strong> within 15 minutes to answer your clinical questions and arrange your private doctor evaluation.
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name (Or Pseudonym)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confidential Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Health Insurance Status</label>
                <select
                  value={insuranceCover}
                  onChange={(e) => setInsuranceCover(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option>Yes, I have Private / Corporate Insurance</option>
                  <option>No, I prefer direct payment (0% EMI requested)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition"
              >
                Request Confidential Callback
              </button>

              <p className="text-[10px] text-center text-slate-400">
                100% confidential. No spam or marketing calls guaranteed.
              </p>
            </form>
          )}
        </Modal>
      )}

    </section>
  );
}
