import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  EyeOff,
  Lock,
  MessageCircleQuestion,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ThumbsUp,
  UserRound,
  X,
} from 'lucide-react';
import {
  QA_CATEGORIES,
  listLikedQaIds,
  listQaThreads,
  postDoctorAnswer,
  postQaQuestion,
  subscribeQaThreads,
  toggleHelpful,
} from '../lib/communityQa';

const RECOMMENDATIONS = [
  'General Self-Care Guidance',
  'Video Consultation Recommended',
  'At-Home Hormone / STI Test',
  'In-Clinic Evaluation',
];

function formatRelativeDate(iso) {
  if (!iso) return 'Just now';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AskDoctorPage({ user }) {
  const [threads, setThreads] = useState(() => listQaThreads());
  const [likedIds, setLikedIds] = useState(() => listLikedQaIds());
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'answered' | 'pending'
  const [search, setSearch] = useState('');
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Patient doubt form state
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [formCategory, setFormCategory] = useState(QA_CATEGORIES[0]);
  const [ageGroup, setAgeGroup] = useState('25–34');
  const [gender, setGender] = useState('Prefer not to say');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formError, setFormError] = useState('');

  // Inline doctor reply state when signed in as doctor
  const [replyingId, setReplyingId] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyRec, setReplyRec] = useState(RECOMMENDATIONS[0]);
  const [replyError, setReplyError] = useState('');

  useEffect(() => subscribeQaThreads((nextThreads, nextLiked = listLikedQaIds()) => {
    setThreads(nextThreads);
    setLikedIds(nextLiked);
  }), []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const isDoctor = user?.role === 'doctor';
  const unansweredCount = threads.filter((t) => t.answers.length === 0).length;
  const answeredCount = threads.length - unansweredCount;

  const filteredThreads = threads.filter((thread) => {
    const matchesCategory = category === 'All' || thread.category === category;
    const isAnswered = thread.answers.length > 0;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'answered' && isAnswered) ||
      (statusFilter === 'pending' && !isAnswered);
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${thread.title} ${thread.question} ${thread.category} ${thread.answers.map((a) => `${a.doctorName} ${a.body}`).join(' ')}`
        .toLowerCase()
        .includes(q);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleSubmitDoubt = (event) => {
    event.preventDefault();
    setFormError('');
    try {
      postQaQuestion({
        title,
        question,
        category: formCategory,
        ageGroup,
        gender,
        isAnonymous,
        patientName: !isAnonymous ? user?.name || 'Patient' : '',
      });
      setTitle('');
      setQuestion('');
      setAskModalOpen(false);
      setStatusFilter('all');
      setCategory('All');
      showToast('Your doubt has been posted confidentially. A verified specialist will reply soon.');
    } catch (error) {
      setFormError(error?.message || 'Could not post your doubt.');
    }
  };

  const handleSubmitDoctorReply = (event, threadId) => {
    event.preventDefault();
    setReplyError('');
    try {
      postDoctorAnswer(threadId, {
        doctorName: user?.name || 'Dr. Arvind Swaminathan',
        doctorSpecialty: user?.specialty || 'Clinical Sexologist & Andrologist',
        doctorRegNo: user?.regNo || 'TN-MED-44819',
        doctorCity: 'Chennai',
        body: replyBody,
        recommendation: replyRec,
      });
      setReplyBody('');
      setReplyingId(null);
      showToast('Your clinical answer has been published for the patient.');
    } catch (error) {
      setReplyError(error?.message || 'Please write an answer.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-[#0B3B82] px-4 py-3 text-xs font-bold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="border-b border-emerald-100 bg-gradient-to-br from-[#F3FAF4] via-white to-[#F0F6FF] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3B82] shadow-2xs">
                <EyeOff className="h-3.5 w-3.5 text-[#16A34A]" />
                100% Anonymous Sexual Health Q&amp;A
              </span>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#0B3B82] leading-tight">
                Ask Your Intimate Health Doubt.{' '}
                <span className="text-[#16A34A]">Get Verified Doctor Answers.</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Have a question about erection, stamina, vaginismus, STI testing, hormones, or intimacy? Post your doubt anonymously without judgement — NMC-verified sexologists review and answer directly.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormError('');
                    setAskModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] px-6 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask a Doubt Privately</span>
                </button>

                <Link
                  to="/consult-sexologist"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B3B82] hover:border-[#16A34A] transition shadow-2xs"
                >
                  <Stethoscope className="h-4 w-4 text-[#16A34A]" />
                  <span>Book 1-on-1 Consultation</span>
                </Link>

                {isDoctor && (
                  <Link
                    to="/doctor-dashboard/qa"
                    className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-800 hover:bg-purple-100 transition"
                  >
                    <MessageCircleQuestion className="h-4 w-4" />
                    <span>Open Doctor Q&amp;A Queue ({unansweredCount} Pending)</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats & Privacy Card */}
            <div className="rounded-3xl border border-[#DCE7F6] bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-[#16A34A]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#0B3B82]">Safe, Clinician-Moderated Forum</p>
                  <p className="text-xs text-slate-500">Your identity stays hidden by default.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-center">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xl font-black text-[#0B3B82]">{threads.length}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Total Doubts</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-xl font-black text-[#16A34A]">{answeredCount}</p>
                  <p className="text-[11px] font-semibold text-emerald-800">Doctor Answered</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-xl font-black text-amber-700">{unansweredCount}</p>
                  <p className="text-[11px] font-semibold text-amber-800">Awaiting Reply</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#F8FBFF] border border-[#DCE7F6] p-3 text-[11px] text-slate-600 flex items-start gap-2">
                <Lock className="h-4 w-4 text-[#0B3B82] shrink-0 mt-0.5" />
                <span>
                  Avoid sharing phone numbers or full medical documents here. For personalized prescriptions, book a private video room.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Q&A Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Filters */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doubts (e.g., erection, vaginismus, STI window, stamina)…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `All (${threads.length})` },
                { id: 'answered', label: `Doctor Answered (${answeredCount})` },
                { id: 'pending', label: `Awaiting Doctor (${unansweredCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    statusFilter === tab.id
                      ? 'bg-[#0B3B82] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {['All', ...QA_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  category === cat
                    ? 'bg-[#E8F8EE] text-[#15803D] border border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        {filteredThreads.length ? (
          <div className="space-y-5">
            {filteredThreads.map((thread) => {
              const hasAnswers = thread.answers.length > 0;

              return (
                <article
                  key={thread.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-emerald-200"
                >
                  {/* Top Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F0F6FF] border border-[#DCE7F6] px-3 py-1 text-[11px] font-bold text-[#0B3B82]">
                        {thread.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border ${
                          hasAnswers
                            ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {hasAnswers ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Doctor Answered
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" /> Awaiting Doctor Reply
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <UserRound className="h-3.5 w-3.5" />
                        {thread.patientAlias}
                      </span>
                      <span>•</span>
                      <span>{formatRelativeDate(thread.createdAt)}</span>
                    </div>
                  </div>

                  {/* Question Body */}
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0B3B82]">
                    {thread.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {thread.question}
                  </p>

                  {/* Actions Row */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {(() => {
                      const isLiked = likedIds.includes(thread.id);
                      return (
                        <button
                          type="button"
                          aria-pressed={isLiked}
                          onClick={() => {
                            const result = toggleHelpful(thread.id);
                            setThreads(result.threads);
                            setLikedIds(result.likedIds);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                            isLiked
                              ? 'border-emerald-300 bg-emerald-100 text-[#15803D] shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-[#15803D]'
                          }`}
                        >
                          <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{isLiked ? 'Liked' : 'Helpful'} ({thread.helpfulCount || 0})</span>
                        </button>
                      );
                    })()}

                    <div className="flex flex-wrap items-center gap-2">
                      {isDoctor && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(replyingId === thread.id ? null : thread.id);
                            setReplyError('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#0B3B82] hover:bg-[#072658] px-4 py-1.5 text-xs font-bold text-white transition"
                        >
                          <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{hasAnswers ? 'Add Another Doctor Reply' : 'Answer as Doctor'}</span>
                        </button>
                      )}
                      {!hasAnswers && !isDoctor && (
                        <Link
                          to="/doctor-login"
                          className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                        >
                          Doctor? Sign in to answer →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Inline Doctor Reply Composer (visible when Doctor clicks Answer) */}
                  {isDoctor && replyingId === thread.id && (
                    <form
                      onSubmit={(e) => handleSubmitDoctorReply(e, thread.id)}
                      className="mt-4 rounded-2xl border border-purple-200 bg-purple-50/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-extrabold text-[#0B3B82] flex items-center gap-1.5">
                          <BadgeCheck className="h-4 w-4 text-[#16A34A]" />
                          Replying as {user?.name || 'Dr. Arvind Swaminathan'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setReplyingId(null)}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>

                      {replyError && (
                        <p className="text-xs font-bold text-red-600">{replyError}</p>
                      )}

                      <textarea
                        rows={3}
                        required
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Write clear, empathetic, evidence-based guidance for this patient…"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span>Suggested Next Step:</span>
                          <select
                            value={replyRec}
                            onChange={(e) => setReplyRec(e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B3B82]"
                          >
                            {RECOMMENDATIONS.map((rec) => (
                              <option key={rec} value={rec}>
                                {rec}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Publish Answer
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Doctor Answers */}
                  {hasAnswers && (
                    <div className="mt-5 space-y-3">
                      {thread.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className="rounded-2xl border border-emerald-200/80 bg-[#F4FBF6] p-4 sm:p-5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-200/60">
                            <div className="flex items-center gap-2.5">
                              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#0B3B82] text-white text-xs font-extrabold">
                                {ans.doctorName.replace(/^Dr\.?\s*/i, '').charAt(0) || 'D'}
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#0B3B82] flex items-center gap-1.5">
                                  <span>{ans.doctorName}</span>
                                  <BadgeCheck className="h-4 w-4 text-[#16A34A]" />
                                </p>
                                <p className="text-[11px] font-semibold text-slate-500">
                                  {ans.doctorSpecialty}
                                  {ans.doctorRegNo ? ` • Reg: ${ans.doctorRegNo}` : ''}
                                </p>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-slate-500">
                              Answered {formatRelativeDate(ans.createdAt)}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {ans.body}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            {ans.recommendation && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-3 py-1 text-[11px] font-bold text-[#15803D]">
                                <Sparkles className="h-3 w-3" />
                                {ans.recommendation}
                              </span>
                            )}

                            <Link
                              to="/consult-sexologist"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                            >
                              <span>Consult this specialist privately</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <MessageCircleQuestion className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-lg font-extrabold text-[#0B3B82]">No matching doubts found</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Try clearing your filters or be the first to ask your question confidentially.
            </p>
            <button
              type="button"
              onClick={() => setAskModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] px-5 py-2.5 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" /> Ask a Doubt Privately
            </button>
          </div>
        )}
      </section>

      {/* Ask a Doubt Modal */}
      {askModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B3B82]">
                  Post a Sexual Health Doubt
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your question goes directly to verified Nayacura specialists. Identity stays hidden when Anonymous is enabled.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setAskModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDoubt} className="mt-5 space-y-4 text-xs">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 font-bold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#0B3B82] mb-1">
                  Topic / Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  {QA_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B3B82] mb-1">Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="18–24">18–24 yrs</option>
                    <option value="25–34">25–34 yrs</option>
                    <option value="35–44">35–44 yrs</option>
                    <option value="45+">45+ yrs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#0B3B82] mb-1">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B3B82] mb-1">
                  Short Doubt Headline *
                </label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Feeling pain during intimacy after starting new medication"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B3B82] mb-1">
                  Describe Your Doubt in Detail *
                </label>
                <textarea
                  rows={4}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Share symptoms, duration, or questions openly. Do not include your phone number or real name if posting anonymously."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#16A34A]"
                />
                <span>
                  <span className="font-bold text-[#0B3B82] flex items-center gap-1">
                    <EyeOff className="h-3.5 w-3.5 text-[#16A34A]" /> Post Anonymously (Recommended)
                  </span>
                  <span className="block text-[11px] text-slate-600 mt-0.5">
                    Displays as “Anonymous • {ageGroup} yrs” so your name is never shown.
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAskModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post Doubt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
