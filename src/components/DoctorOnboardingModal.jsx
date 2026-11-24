import React, { useState } from 'react';
import { Building2, Stethoscope, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import Modal from './ui/Modal';
import confetti from 'canvas-confetti';

export default function DoctorOnboardingModal({ isOpen, onClose }) {
  const [docName, setDocName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [specialization, setSpecialization] = useState('General Physician');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('Chennai');
  const [phone, setPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsSuccess(false);
        onClose();
      }}
      title={isSuccess ? "Registration Submitted!" : "List Your Practice on Nayacura Pro"}
      subtitle={isSuccess ? "Welcome to the Nayacura Healthcare Provider Network." : "Reach millions of patients & modernize your clinical practice"}
      maxWidth="max-w-lg"
    >
      {isSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-brand-navy">Welcome, {docName}!</h4>
          <p className="text-xs text-slate-600">
            Our Provider Verification Team has received your application for <strong>{clinicName}</strong> (Medical Reg: {regNo}). We will verify your credentials and activate your verified profile within 24 hours.
          </p>
          <button
            onClick={() => {
              setIsSuccess(false);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Benefits pills */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-brand-navy bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
            <span className="flex items-center gap-1.5 text-brand-green-dark">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> 100% Free Listing
            </span>
            <span className="flex items-center gap-1.5 text-brand-green-dark">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Digital EMR & Rx
            </span>
            <span className="flex items-center gap-1.5 text-brand-green-dark">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Instant Video Consult
            </span>
            <span className="flex items-center gap-1.5 text-brand-green-dark">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> ABDM M1/M2/M3 Ready
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Doctor Full Name</label>
            <input
              type="text"
              required
              placeholder="Dr. Anandha Krishnan"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Medical Council Reg. No</label>
              <input
                type="text"
                required
                placeholder="TN-MCI-48192"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option>General Physician</option>
                <option>Gynecologist / Obstetrician</option>
                <option>Dermatologist</option>
                <option>Pediatrician</option>
                <option>Orthopedist</option>
                <option>Dentist</option>
                <option>Cardiologist</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Clinic / Hospital Name</label>
              <input
                type="text"
                required
                placeholder="Cura Health Clinic"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option>Chennai</option>
                <option>Bangalore</option>
                <option>Hyderabad</option>
                <option>Mumbai</option>
                <option>Delhi NCR</option>
                <option>Coimbatore</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Official Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Submit Verification Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </Modal>
  );
}
