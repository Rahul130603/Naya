import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Modal from './ui/Modal';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setOtpSent(true);
      setOtp('4829'); // simulated autofill
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    onLoginSuccess({
      name: name || (role === 'doctor' ? 'Dr. Rajesh Kumar' : 'Suresh Kumar'),
      phone,
      role
    });
    setOtpSent(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={otpSent ? "Verify Mobile Number" : "Welcome to Nayacura"}
      subtitle={otpSent ? `Enter the 4-digit code sent to +91 ${phone}` : "Login or create an account with your mobile number"}
      maxWidth="max-w-md"
    >
      {/* Role Toggle */}
      {!otpSent && (
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 py-2 rounded-lg transition ${role === 'patient' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
          >
            For Patients
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 py-2 rounded-lg transition ${role === 'doctor' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-500'}`}
          >
            For Doctors & Clinics
          </button>
        </div>
      )}

      {otpSent ? (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="text-center py-2">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Demo OTP automatically generated: 4829
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Enter 4-Digit OTP</label>
            <input
              type="text"
              maxLength={4}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center tracking-widest text-xl font-extrabold py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs shadow-md transition"
          >
            Verify & Continue
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Anandha Krishnan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">+91</span>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full text-xs pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Send Verification OTP</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            Your contact details are 100% confidential.
          </p>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              to="/login"
              onClick={onClose}
              className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] hover:underline"
            >
              Open Full Patient Sign In Page →
            </Link>
          </div>
        </form>
      )}
    </Modal>
  );
}
