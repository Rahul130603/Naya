import React from 'react';
import { ShieldCheck, Lock, Award, Package, EyeOff, FlaskConical, HeartHandshake, CheckCircle2 } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Lock, label: '100% Confidential Consultations', sub: '256-Bit Encrypted' },
  { icon: Package, label: 'Plain Box Packaging Guarantee', sub: 'Zero Outer Markings' },
  { icon: Award, label: 'European Board (FECSM) Certified', sub: 'MCI Registered Sexologists' },
  { icon: EyeOff, label: 'Audio-Only Option', sub: 'Camera-Off Consultations' },
  { icon: FlaskConical, label: 'Anonymous Barcoded Labs', sub: 'NABL & ICMR Accredited' },
  { icon: ShieldCheck, label: 'Zero Stigma & Total Discretion', sub: 'Strict Medical Ethics' },
  { icon: HeartHandshake, label: 'Personal Care Coordinator', sub: 'Continuous Follow-Up' },
];

export default function InfiniteMarquee({ className = '' }) {
  // Duplicate items for continuous seamless loop
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className={`w-full overflow-hidden marquee-container py-3.5 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/50 border-y border-emerald-100/70 select-none ${className}`}>
      <div className="flex items-center gap-8 marquee-content animate-marquee whitespace-nowrap will-change-transform">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-default"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-[#16A34A] flex-shrink-0">
                <Icon className="w-3 h-3" />
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-bold text-[#0B3B82] tracking-tight">{item.label}</span>
                <span className="text-[10px] text-slate-500 font-medium ml-1.5 hidden sm:inline">• {item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
