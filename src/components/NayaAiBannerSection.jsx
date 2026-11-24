import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Globe, Stethoscope } from 'lucide-react';
import ShinyText from './ui/ShinyText';

export default function NayaAiBannerSection() {
  const navigate = useNavigate();

  const samplePrompts = [
    { label: 'Anxiety About Intimacy', text: 'I feel anxious about intimacy. Where do I start?', lang: 'English' },
    { label: 'மருத்துவர் vs ஆலோசகர்', text: 'எனக்கு மருத்துவர் தேவையா அல்லது ஆலோசகரா?', lang: 'தமிழ்' },
    { label: 'Low Desire Guidance', text: 'Low desire-ku endha specialist-a paakanum?', lang: 'Tanglish' },
    { label: 'First Private Consult', text: 'What happens in a first confidential consultation?', lang: 'English' },
  ];

  return (
    <section className="py-14 bg-slate-50/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Card matching Nayacura Mint-Green Wave Signature Design */}
        <div 
          className="relative rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 shadow-card-soft overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(ellipse at top right, rgba(232, 248, 238, 0.8) 0%, rgba(244, 253, 248, 0.5) 45%, #ffffff 80%)'
          }}
        >
          {/* Subtle Ambient Decorative Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-50/50 blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (Clear, High-Contrast Typography) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Category Badge Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-[#15803D] shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>CONFIDENTIAL AI WELLNESS COMPANION</span>
                <span className="rounded-full bg-[#16A34A] px-1.5 py-0.2 text-[9px] font-black text-white uppercase tracking-wider">
                  AI
                </span>
              </div>

              {/* High-Contrast Bold Heading */}
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0B3B82] leading-tight">
                Your Space, Your Conversation.{' '}
                <span className="text-[#16A34A] block sm:inline">
                  Ask Naya AI Freely.
                </span>
              </h2>

              {/* Subtitle Paragraph */}
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Ask any private intimate health or sexual wellness question in 100% confidence. Naya provides evidence-based clinical guidance in English, தமிழ் (Tamil), and Tanglish with zero judgment.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-700 font-semibold">
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 shadow-xs rounded-full px-3.5 py-1.5">
                  <Lock className="h-3.5 w-3.5 text-[#16A34A]" />
                  100% Anonymous (No Login Needed)
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 shadow-xs rounded-full px-3.5 py-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#0B3B82]" />
                  Trilingual: EN • தமிழ் • Tanglish
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/90 shadow-xs rounded-full px-3.5 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                  Clinical Protocol Guided
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/ai"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-102"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Confidential Chat</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/consult-sexologist"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3.5 text-sm font-bold text-[#0B3B82] shadow-xs transition"
                >
                  <Stethoscope className="h-4 w-4 text-[#16A34A]" />
                  <span>Book Verified Doctor</span>
                  <span className="text-xs text-slate-400">↗</span>
                </Link>
              </div>

            </div>

            {/* Right Interactive Prompt Cards (Crisp White Cards with Slate/Emerald Borders) */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B3B82] uppercase tracking-wider mb-2">
                <span>Click a popular doubt to ask Naya:</span>
                <span className="text-[10px] text-[#16A34A] font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Private
                </span>
              </div>

              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigate('/ai')}
                  className="w-full text-left rounded-2xl bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-[#16A34A] p-3.5 transition-all duration-200 group flex items-center justify-between shadow-xs hover:shadow-md"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-extrabold text-[#0B3B82] group-hover:text-[#16A34A] uppercase tracking-wide transition-colors">
                        {item.label}
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-[10px] font-bold text-slate-600 group-hover:text-[#15803D] transition-colors">
                        {item.lang}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate group-hover:text-slate-900">
                      "{item.text}"
                    </p>
                  </div>
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-[#16A34A] group-hover:text-white transition-all shadow-xs">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
