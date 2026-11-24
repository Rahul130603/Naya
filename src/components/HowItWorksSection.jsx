import React, { useState } from 'react';
import { 
  Lock, 
  Video, 
  Package, 
  HeartHandshake, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Clock 
} from 'lucide-react';
import ShinyText from './ui/ShinyText';
import MagneticButton from './ui/MagneticButton';

const STEPS = [
  {
    step: '01',
    badge: 'Step 1: Private Consultation',
    title: 'Consult from Home in 60s',
    subtitle: 'Zero waiting rooms. Camera-off audio supported.',
    desc: 'Connect with verified European Board (FECSM) & MCI registered clinical sexologists. If you feel shy or awkward, switch your camera OFF and talk privately via audio.',
    icon: Video,
    highlight: '256-Bit Encrypted Virtual Chamber',
    tagIcon: EyeOff
  },
  {
    step: '02',
    badge: 'Step 2: 100% Plain Packaging',
    title: 'Discreet Plain Box Delivery',
    subtitle: 'Zero brand names or medicine names on the box.',
    desc: 'Medications and at-home lab kits arrive in standard unbranded brown cardboard boxes with anonymous barcodes. Delivery personnel, roommates, or family cannot tell what is inside.',
    icon: Package,
    highlight: 'Tamper-Proof Sealed Plain Box',
    tagIcon: Lock
  },
  {
    step: '03',
    badge: 'Step 3: Free Follow-Up Care',
    title: 'Ongoing Recovery Support',
    subtitle: 'Complimentary check-ins until complete recovery.',
    desc: 'Intimate healing takes continuous guidance. Enjoy free follow-up messaging with your sexologist and a dedicated care coordinator to monitor progress without extra fees.',
    icon: HeartHandshake,
    highlight: '7 Days Free Doctor Re-consult',
    tagIcon: CheckCircle2
  }
];

const FAQS = [
  {
    q: 'Will anyone know what is inside the delivery parcel?',
    a: 'Absolutely not. All treatments and home test kits are shipped in 100% plain brown cardboard boxes. There is no mention of "Nayacura", "Sexology", "Sexual Wellness", or any medication names on the box. Only your shipping address and an anonymous barcode appear.'
  },
  {
    q: 'Can I consult with my video camera turned OFF?',
    a: 'Yes! Over 70% of our patients prefer audio-only consultations. You have full control in our encrypted chamber to keep your camera turned off and speak comfortably without revealing your face.'
  },
  {
    q: 'What merchant name appears on my bank statement or UPI?',
    a: 'Your bank statement or UPI app will only show a generic billing name: "NC Health Services". Words like "Sexual", "Sexology", or "Nayacura" will never appear on your financial records.'
  },
  {
    q: 'Are all Nayacura doctors legally recognized and certified?',
    a: 'Yes. All doctors on Nayacura are verified with the Medical Council of India (MCI) / State Medical Councils and hold specialized qualifications in Clinical Sexology, Andrology, or European Board Sexual Medicine (FECSM).'
  }
];

export default function HowItWorksSection({ onStartVideoConsult }) {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white via-emerald-50/20 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
            <ShinyText text="100% Discreet • Zero Awkwardness Guarantee" className="text-xs uppercase tracking-wider" />
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B3B82] tracking-tight">
            How Nayacura Works: From Stigma to Complete Recovery
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            No crowded waiting rooms. No judgmental looks. A modern healthcare experience built from the ground up for total confidentiality and clinical excellence.
          </p>
        </div>

        {/* 3 Step Interactive Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-16">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            const TagIcon = item.tagIcon;

            return (
              <div 
                key={idx}
                className="group relative p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card-soft hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Number Watermark */}
                <span className="absolute top-4 right-6 text-5xl font-black text-slate-100 group-hover:text-emerald-100 transition select-none">
                  {item.step}
                </span>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mb-6 group-hover:bg-[#16A34A] group-hover:text-white transition-colors duration-300 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>

                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#15803D] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-3">
                    {item.badge}
                  </span>

                  <h3 className="text-xl font-bold text-[#0B3B82] group-hover:text-slate-900 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs font-bold text-slate-500 mt-1">
                    {item.subtitle}
                  </p>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <TagIcon className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Taboo Doubts & Privacy FAQ Accordion */}
        <div className="max-w-4xl mx-auto mt-16 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block mb-1">
              Confidentiality & Privacy Answers
            </span>
            <h3 className="text-2xl font-extrabold text-[#0B3B82]">
              Common Intimate Concerns Answered Honestly
            </h3>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div 
                key={i}
                className="rounded-2xl border border-slate-200/90 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-800 hover:text-[#0B3B82] flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <span>{faq.q}</span>
                  {activeFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {activeFaq === i && (
                  <div className="p-4 sm:p-5 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Doctor Consult Action */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Have a private medical doubt? Speak directly to a specialist.</span>
            </div>

            <MagneticButton
              onClick={() => onStartVideoConsult ? onStartVideoConsult() : null}
              className="px-6 py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Talk to Doctor in 60s</span>
            </MagneticButton>
          </div>
        </div>

      </div>
    </section>
  );
}
