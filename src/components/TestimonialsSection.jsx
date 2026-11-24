import React from 'react';
import { Star, Quote, CheckCircle2, ThumbsUp, Heart } from 'lucide-react';
import { TESTIMONIALS } from '../data/healthcareData';

export default function TestimonialsSection() {
  return (
    <section className="py-14 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 mb-3">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Patient Stories & Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy">
            What Our Patients Have to Say
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            Over 15 million verified patient consultations booked with peace of mind.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div 
              key={t.id}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 hover:border-emerald-200 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.location} • {t.service}</p>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
