import React, { useState } from 'react';
import { PhoneCall, Mail, MapPin, Lock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (err) {}
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              100% Confidential Support
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Confidential Contact & 24x7 Helpline
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Have questions about sexual health consultations, lab testing, or discreet packaging? Our medical coordinators are here to assist you privately.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="mailto:support@nayacura.com"
                className="flex items-center gap-2 text-xs font-bold text-[#0B3B82] bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm hover:border-[#16A34A] transition"
              >
                <Mail className="w-4 h-4 text-[#16A34A]" />
                <span>support@nayacura.com</span>
              </a>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <PhoneCall className="w-4 h-4 text-[#16A34A]" />
                <span>+91 98400 12345 (Confidential Desk)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Private Response Within 15 Mins</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Details (1 col) */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <PhoneCall className="w-6 h-6 text-brand-green mb-2" />
              <h4 className="text-sm font-bold text-brand-navy">24x7 Anonymous Helpline</h4>
              <p className="text-xs text-slate-500 mt-0.5">Toll-free across India</p>
              <a href="tel:1800-200-6292" className="text-base font-extrabold text-brand-green mt-2 block">
                1800-200-NAYA (6292)
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <Mail className="w-6 h-6 text-brand-navy mb-2" />
              <h4 className="text-sm font-bold text-brand-navy">Confidential Email Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">Facing any issue? Write to our care desk</p>
              <a href="mailto:support@nayacura.com" className="text-sm font-bold text-brand-navy hover:text-brand-green mt-1.5 block transition">
                support@nayacura.com
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <MapPin className="w-6 h-6 text-amber-500 mb-2" />
              <h4 className="text-sm font-bold text-brand-navy">Headquarters</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Nayacura Health Technologies Ltd.<br />
                Sterling Road, Nungambakkam, Chennai, Tamil Nadu 600034
              </p>
            </div>
          </div>

          {/* Form (2 cols) */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
            {isSent ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Message Received Confidentially</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our private patient care coordinator will review your inquiry and reply discreetly within 2 hours. For urgent issues, email{' '}
                  <a href="mailto:support@nayacura.com" className="font-bold text-brand-navy hover:underline">
                    support@nayacura.com
                  </a>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-brand-navy mb-3">Send a Private Message</h3>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Your Name (Or Pseudonym)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email or Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="For our confidential reply"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">How can we help you?</label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Write your question or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Confidential Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
