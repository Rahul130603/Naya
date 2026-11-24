import React from 'react';
import { Heart, ShieldCheck, Lock, Sparkles, Users, Award } from 'lucide-react';

export default function AboutPage() {
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
              <Heart className="w-3.5 h-3.5 text-[#16A34A]" />
              Our Clinical Mission
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Normalizing Sexual Health & Intimate Wellness in India
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Over 200 million Indians experience intimate concerns—from erectile dysfunction and premature ejaculation to vaginismus and performance anxiety. Yet over 90% suffer in silence due to guilt and stigma. Nayacura is here to change this with evidence-based medicine and total privacy.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>MCI & European Board Standards</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Lock className="w-4 h-4 text-[#16A34A]" />
                <span>100% Anonymous & Zero Judgment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft space-y-4">
            <h3 className="text-xl font-bold text-brand-navy">Why "naya" + "cura"?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>naya</strong> represents a new era of open, honest, modern healthcare without shame or whispering. <strong>cura</strong> is the Latin root for healing and thoughtful medical care. Together, Nayacura bridges European-board clinical sexology with seamless digital privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <Award className="w-8 h-8 text-brand-green mb-3" />
              <h4 className="text-base font-bold text-brand-navy">Evidence-Based Medicine</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                We reject unverified quackery. All our protocols are designed by certified doctors, andrologists, and gynecologists using scientifically proven treatments.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <Lock className="w-8 h-8 text-brand-navy mb-3" />
              <h4 className="text-base font-bold text-brand-navy">Discretion Without Compromise</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                From 100% unbranded plain packaging to anonymous barcoded lab vials and camera-off teleconsultations, your dignity is our sacred priority.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
