import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles } from '../data/articles';

function initials(name = '') {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ArticlePage({ onBookAppointment }) {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) document.title = `${article.title} — Nayacura Health Feed`;
  }, [article]);

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-brand-navy">That article could not be found</h1>
        <p className="mt-2 text-sm text-slate-600">It may have been moved. Browse the full health feed instead.</p>
        <Link
          to="/health-feed"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to health feed
        </Link>
      </div>
    );
  }

  const related = getRelatedArticles(article.slug, 3);

  return (
    <article className="bg-slate-50 pb-16">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 sm:px-6">
          <div>
            <Link
              to="/health-feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-navy"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Health feed
            </Link>
          </div>

          <div className="mt-4">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-brand-green-dark">
              {article.category}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-brand-navy sm:text-4xl">
            {article.title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{article.summary}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {article.readTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Medically reviewed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Editorial library
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <img
          src={article.image}
          alt={article.title}
          className="mt-6 aspect-[16/9] w-full rounded-2xl border border-slate-200 object-cover"
        />

        {/* Body */}
        <div className="mt-8 space-y-7">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-extrabold text-brand-navy sm:text-xl">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-[15px]">{section.body}</p>
            </section>
          ))}
        </div>

        {/* Takeaways */}
        {article.takeaways?.length ? (
          <div className="mt-9 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-brand-green-dark">Key takeaways</h2>
            <ul className="mt-3 space-y-2">
              {article.takeaways.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Author + CTA */}
        <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-sm font-extrabold text-brand-green-dark">
              {initials(article.author)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{article.author}</p>
              <p className="text-xs text-slate-500">{article.specialty}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onBookAppointment?.()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy-dark"
          >
            Book a consultation <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-relaxed text-slate-500">
          This article is general education and does not replace a consultation. If you are taking
          medication, are pregnant, or have a heart condition, speak to a clinician before changing anything.
        </p>

        {/* Related */}
        {related.length ? (
          <section className="mt-10">
            <h2 className="text-base font-extrabold text-brand-navy">More from the health feed</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/health-feed/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <img src={item.image} alt={item.title} className="h-28 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-green-dark">
                      {item.category}
                    </span>
                    <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-brand-navy">
                      {item.title}
                    </p>
                    <span className="mt-auto pt-2 text-[11px] text-slate-400">{item.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
