import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import Modal from './ui/Modal';
import VideoCallRoom from './VideoCallRoom';
import { roomCodeFor } from '../lib/videoRoom';
import { SYMPTOMS_LIST, DOCTORS } from '../data/healthcareData';

export default function VideoConsultModal({ isOpen, onClose, preselectedDoctor = null }) {
  const [step, setStep] = useState('select'); // 'select' | 'matching' | 'connected'
  const [selectedConcern, setSelectedConcern] = useState(SYMPTOMS_LIST[0].name);

  const assignedDoctor = preselectedDoctor || DOCTORS[0];
  const roomCode = roomCodeFor(assignedDoctor.name);
  const patientName = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nayacura_user') || 'null');
      return saved?.name || 'Patient';
    } catch {
      return 'Patient';
    }
  })();

  useEffect(() => {
    let timer;
    if (step === 'matching') {
      timer = setTimeout(() => {
        setStep('connected');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleEndCall = () => {
    setStep('select');
    onClose();
  };

  /** Lets the admin console see that a consult was requested (best effort). */
  const recordConsultRequest = () => {
    void (async () => {
      try {
        let patientName = 'Guest patient';
        let phone = '';
        try {
          const saved = JSON.parse(localStorage.getItem('nayacura_user') || 'null');
          if (saved?.name) patientName = saved.name;
          if (saved?.phone) phone = String(saved.phone);
        } catch {
          /* ignore malformed local storage */
        }
        if (!phone) return; // no contact number: nothing actionable for the care team
        let token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('nayacura_csrf='))
          ?.split('=')[1];
        if (!token) {
          await fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => null);
          token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('nayacura_csrf='))
            ?.split('=')[1];
        }
        await fetch('/api/consult-requests', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'X-CSRF-Token': decodeURIComponent(token) } : {}),
          },
          body: JSON.stringify({
            fullName: patientName,
            phone,
            doctorName: assignedDoctor?.name,
            mode: 'VIDEO',
            preferredTime: 'Instant',
          }),
        });
      } catch {
        /* best effort only */
      }
    })();
  };

  // Once connected the real consultation room takes over the whole screen so the
  // clinician joins the same room (and the modal does not double-wrap it).
  if (step === 'connected') {
    return (
      <VideoCallRoom
        roomCode={roomCode}
        role="patient"
        selfName={patientName}
        peerName={assignedDoctor.name}
        appointment={{ timeSlot: 'Instant online consultation' }}
        onClose={handleEndCall}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleEndCall}
      title="Discreet Online Consultation"
      subtitle="Private 60-second online connection — talk via Video or Audio anytime inside the call"
      maxWidth="max-w-xl"
    >
      {step === 'select' && (
        <div className="space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-green-dark">100% Anonymous &amp; Online Only</h4>
              <p className="text-xs text-emerald-700">Switch between Audio (camera off) and Video freely inside your private call room</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select your intimate health concern
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS_LIST.map((sym) => (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => setSelectedConcern(sym.name)}
                  className={`p-3 text-left rounded-xl border text-xs font-bold transition ${
                    selectedConcern === sym.name
                      ? 'border-brand-green bg-emerald-50 text-brand-green-dark ring-2 ring-brand-green/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate">{sym.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{sym.specialty}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Consultation Fee:</span>
              <span>₹{assignedDoctor.videoFee}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Includes:</span>
              <span>15-20 Min Private Audio or Video Session + Official Digital Prescription + Free 7-Day Follow-up</span>
            </div>
          </div>

          <button
            onClick={() => { recordConsultRequest(); setStep('matching'); }}
            className="w-full py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Start Confidential Consultation (₹{assignedDoctor.videoFee})</span>
          </button>
        </div>
      )}

      {step === 'matching' && (
        <div className="text-center py-12 space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-4 border-emerald-500/40 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-brand-green text-white flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-brand-navy">Establishing Encrypted Connection...</h3>
            <p className="text-xs text-slate-500 mt-1">Connecting securely with {assignedDoctor.name} ({assignedDoctor.specialty})</p>
          </div>

          <div className="max-w-xs mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>256-Bit Encrypted & Zero Recording</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
