import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Sparkles, UserCheck } from 'lucide-react';
import { getDailyArticles } from '../data/articles';

export default function HealthFeedSection() {
  const articles = getDailyArticles(10);
  return (
    <section className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mint Green Wave Hero Banner */}
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm mb-10 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" />
              Nayacura Health Feed
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Read Top Articles from Sexual Health Experts
            </h2>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Evidence-based intimate health knowledge verified by senior sexologists, urologists, and gynecologists.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <UserCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Medically Reviewed by Certified Sexologists</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Clock className="w-4 h-4 text-[#16A34A]" />
                <span>Fresh selection daily</span>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((art) => (
            <Link
              key={art.slug}
              to={`/health-feed/${art.slug}`}
              aria-label={`Read: ${art.title}`}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card-soft hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={art.image} 
                    alt={art.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-brand-navy shadow-sm">
                    {art.category}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-green-dark transition line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-3">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-brand-green flex items-center justify-center text-xs font-bold">
                    {art.author.replace(/^Dr\.?\s*/i, '').charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{art.author}</div>
                    <div className="text-[10px] text-slate-400">{art.specialty}</div>
                  </div>
                </div>

                <span className="text-xs font-bold text-brand-green group-hover:translate-x-1 transition">
                  Read →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
