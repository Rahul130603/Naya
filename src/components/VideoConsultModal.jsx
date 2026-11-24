import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  Stethoscope,
  FileText,
  User,
  Lock,
  EyeOff
} from 'lucide-react';
import Modal from './ui/Modal';
import { SYMPTOMS_LIST, DOCTORS } from '../data/healthcareData';

export default function VideoConsultModal({ isOpen, onClose, preselectedDoctor = null }) {
  const [step, setStep] = useState('select'); // 'select' | 'matching' | 'connected'
  const [selectedConcern, setSelectedConcern] = useState(SYMPTOMS_LIST[0].name);
  const [consultDuration, setConsultDuration] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false); // Default to camera off for sexual privacy
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: 'Hello! I am Dr. Arvind Swaminathan. Please feel completely safe and relaxed. Whatever we discuss is 100% confidential and judgment-free. How can I help you today?' }
  ]);

  const assignedDoctor = preselectedDoctor || DOCTORS[0];

  useEffect(() => {
    let timer;
    if (step === 'matching') {
      timer = setTimeout(() => {
        setStep('connected');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    let callTimer;
    if (step === 'connected') {
      callTimer = setInterval(() => {
        setConsultDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [step]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = { sender: 'patient', text: chatMessage };
    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'doctor',
        text: 'Thank you for sharing openly. This is very common and completely treatable. I am prescribing an evidence-based clinical solution for you right away.'
      }]);
    }, 1500);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setStep('select');
    setConsultDuration(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleEndCall}
      title={step === 'connected' ? "100% Confidential Consultation Chamber" : "Discreet Sexual Wellness Consult"}
      subtitle={step === 'connected' ? `With ${assignedDoctor.name} (${assignedDoctor.specialty})` : "Private 60-second connection with certified clinical sexologist"}
      maxWidth={step === 'connected' ? "max-w-3xl" : "max-w-xl"}
    >
      {step === 'select' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-green-dark">100% Anonymous & Private</h4>
              <p className="text-xs text-emerald-700">Audio or Video call options • Camera off by default for your peace of mind</p>
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
              <span>15-20 Min Private Audio/Video Session + Official Digital Prescription + Free 7-Day Follow-up</span>
            </div>
          </div>

          <button
            onClick={() => setStep('matching')}
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

      {step === 'connected' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[480px]">
          {/* Video Stream Area (2 cols) */}
          <div className="min-h-[320px] md:min-h-0 md:col-span-2 bg-slate-900 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            {/* Top Info Bar */}
            <div className="flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Encrypted • {formatTime(consultDuration)}</span>
              </div>
              <div className="text-xs font-semibold bg-slate-800/80 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>100% Private</span>
              </div>
            </div>

            {/* Doctor Video Mockup */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src={assignedDoctor.photo} 
                alt={assignedDoctor.name} 
                className="w-full h-full object-cover opacity-85" 
              />
              <div className="absolute bottom-16 left-4 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs">
                <div className="font-bold">{assignedDoctor.name}</div>
                <div className="text-[10px] text-emerald-400">{assignedDoctor.specialty}</div>
              </div>
            </div>

            {/* Patient Self-View PiP (Privacy mode toggle) */}
            <div className="absolute top-16 md:top-12 right-4 w-24 h-20 bg-slate-800 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg flex items-center justify-center z-10">
              {isVideoOn ? (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-[10px] font-bold">
                  Camera On
                </div>
              ) : (
                <div className="text-slate-400 text-center p-1">
                  <EyeOff className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="text-[9px] block font-bold text-slate-300">Audio Only (Private)</span>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="flex items-center justify-center gap-3 z-10 mt-auto pt-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full text-white transition ${isMicOn ? 'bg-slate-700/80 hover:bg-slate-600' : 'bg-red-500'}`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full text-white transition ${isVideoOn ? 'bg-slate-700/80 hover:bg-slate-600' : 'bg-emerald-600'}`}
                title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition px-5 flex items-center gap-1.5 font-bold text-xs"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Chat & Notes Panel (1 col) */}
          <div className="min-h-[280px] md:min-h-0 flex flex-col bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold text-slate-800">Private Chat</span>
              </div>
              <span className="text-[10px] text-slate-400">Encrypted</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl max-w-[85%] ${
                    m.sender === 'patient'
                      ? 'bg-brand-navy text-white ml-auto rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 bg-white flex gap-1.5">
              <input
                type="text"
                placeholder="Type your message privately..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-brand-green text-white hover:bg-brand-green-dark"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}
