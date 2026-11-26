import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Stethoscope } from 'lucide-react';
import Modal from './ui/Modal';
import {
  HELLO_EMAIL,
  dispatchWelcomeEmail,
  findPatientByEmail,
  registerPatient,
} from '../lib/doctorRegistry';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor'
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [welcomeNotice, setWelcomeNotice] = useState('');
  const [welcomePreviewUrl, setWelcomePreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWelcomePreviewUrl('');
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register') {
      try {
        const { patient, welcomeMail } = registerPatient({ name, email: cleanEmail, password });
        setSubmitting(true);
        const emailStatus = await dispatchWelcomeEmail({
          to: patient.email,
          name: patient.name,
          role: 'patient',
          mailId: welcomeMail.id,
        });
        setSubmitting(false);
        if (emailStatus?.sent) {
          setWelcomeNotice(`Welcome email sent from ${HELLO_EMAIL} to ${patient.email}`);
        } else if (emailStatus?.previewUrl) {
          setWelcomePreviewUrl(emailStatus.previewUrl);
          setWelcomeNotice(`Account created! Test email preview ready (add SMTP credentials in backend/.env for real Gmail delivery).`);
        } else {
          setWelcomeNotice(`Account created & saved in Outbox (${HELLO_EMAIL}). Add SMTP credentials in backend/.env for real inbox delivery.`);
        }
        setTimeout(() => {
          onLoginSuccess(patient);
          setWelcomeNotice('');
          setWelcomePreviewUrl('');
          onClose();
        }, emailStatus?.previewUrl ? 2600 : 1200);
      } catch (err) {
        setSubmitting(false);
        setError(err?.message || 'Could not register account.');
      }
      return;
    }

    // Email Sign In
    const existing = findPatientByEmail(cleanEmail);
    if (existing && existing.password !== password) {
      setError('Incorrect password for this email address.');
      return;
    }

    const userObj = existing || {
      id: 'NC-PAT-4921',
      name: cleanEmail.split('@')[0] || 'Patient',
      email: cleanEmail,
      role: 'patient',
      city: 'Chennai',
    };
    onLoginSuccess(userObj);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'register' ? 'Create Your Confidential Account' : 'Sign In with Email'}
      subtitle={`Email-only private access • Welcome & updates sent from ${HELLO_EMAIL}`}
      maxWidth="max-w-md"
    >
      {/* Role Toggle */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => { setRole('patient'); setError(''); }}
          className={`flex-1 py-2 rounded-lg transition ${role === 'patient' ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}
        >
          For Patients
        </button>
        <button
          type="button"
          onClick={() => { setRole('doctor'); setError(''); }}
          className={`flex-1 py-2 rounded-lg transition ${role === 'doctor' ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-500'}`}
        >
          For Doctors &amp; Clinics
        </button>
      </div>

      {role === 'doctor' ? (
        <div className="space-y-4 text-xs">
          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 space-y-2">
            <p className="font-bold text-[#0B3B82] flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-purple-700" />
              Email-Only Clinician Onboarding
            </p>
            <p className="text-slate-600 leading-relaxed">
              Apply using your professional email address. Once an administrator approves your registration, your Login Email and Temporary Password are sent to your inbox from <strong>{HELLO_EMAIL}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/doctor-register'); }}
            className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Register as Doctor (Email Only)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => { onClose(); navigate('/doctor-login'); }}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-[#0B3B82] font-bold text-xs hover:bg-slate-50 transition"
          >
            Already Approved? Doctor Sign In →
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-xl border transition ${mode === 'register' ? 'border-[#16A34A] bg-emerald-50 text-[#15803D]' : 'border-slate-200 text-slate-500'}`}
            >
              Register (Email)
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-xl border transition ${mode === 'login' ? 'border-[#0B3B82] bg-blue-50 text-[#0B3B82]' : 'border-slate-200 text-slate-500'}`}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            {welcomeNotice && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-[#15803D] space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{welcomeNotice}</span>
                </div>
                {welcomePreviewUrl && (
                  <a
                    href={welcomePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block pl-6 text-[11px] font-extrabold text-[#0B3B82] underline hover:text-[#16A34A]"
                  >
                    Open Test Email Preview →
                  </a>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthik S."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark disabled:opacity-60 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? 'Creating Account & Sending Mail...' : mode === 'register' ? 'Register & Send Welcome Email' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              No phone number required • Welcome email sent from {HELLO_EMAIL}
            </p>

            <div className="pt-2 text-center border-t border-slate-100">
              <Link
                to="/login"
                onClick={onClose}
                className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] hover:underline"
              >
                Open Full Sign In &amp; Registration Page →
              </Link>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
