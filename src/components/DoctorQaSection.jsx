import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircleQuestion,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { postDoctorAnswer } from '../lib/communityQa';

const RECOMMENDATIONS = [
  'General Self-Care Guidance',
  'Online Consultation Recommended',
  'At-Home Hormone / STI Test',
];

function formatDate(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DoctorQaSection({ threads, doctor, onNotify }) {
  const [filter, setFilter] = useState('pending'); // 'pending' | 'answered' | 'all'
  const [activeId, setActiveId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [recommendation, setRecommendation] = useState(RECOMMENDATIONS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  const pendingCount = threads.filter((t) => t.answers.length === 0).length;
  const answeredCount = threads.length - pendingCount;

  const visibleThreads = threads.filter((t) => {
    if (filter === 'pending') return t.answers.length === 0;
    if (filter === 'answered') return t.answers.length > 0;
    return true;
  });

  const handleOpenReply = (threadId) => {
    setActiveId(activeId === threadId ? null : threadId);
    setAnswerText('');
    setRecommendation(RECOMMENDATIONS[0]);
    setErrorMsg('');
  };

  const handlePublish = (event, threadId) => {
    event.preventDefault();
    setErrorMsg('');
    try {
      postDoctorAnswer(threadId, {
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorRegNo: doctor.regNo,
        doctorCity: 'Chennai',
        body: answerText,
        recommendation,
      });
      setAnswerText('');
      setActiveId(null);
      onNotify?.('Your clinical answer was published to the Patient Q&A page.');
    } catch (error) {
      setErrorMsg(error?.message || 'Could not publish answer.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#0B3B82]">
            Anonymous Patient Doubts (Sexual Health Q&amp;A)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Review patient doubts submitted privately on Ask a Doctor and publish verified clinical responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/ask-doctor"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#DCE7F6] bg-[#F8FBFF] px-3.5 py-2 text-xs font-bold text-[#0B3B82] hover:bg-[#EDF3FC] transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Public Q&amp;A Page
          </Link>

          {[
            { id: 'pending', label: `Awaiting Reply (${pendingCount})` },
            { id: 'answered', label: `Answered (${answeredCount})` },
            { id: 'all', label: `All (${threads.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`min-h-10 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                filter === tab.id
                  ? 'bg-[#0B3B82] text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doubt Cards */}
      {visibleThreads.length ? (
        <div className="space-y-4">
          {visibleThreads.map((thread) => {
            const isReplying = activeId === thread.id;
            const hasAnswers = thread.answers.length > 0;

            return (
              <div
                key={thread.id}
                className="rounded-2xl bg-white border border-[#DCE7F6] p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#F0F6FF] border border-[#DCE7F6] px-2.5 py-0.5 text-[11px] font-bold text-[#0B3B82]">
                      {thread.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                        hasAnswers
                          ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {hasAnswers ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Answered ({thread.answers.length})
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" /> Awaiting Doctor Answer
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="h-3.5 w-3.5" />
                      {thread.patientAlias}
                      {thread.gender && thread.gender !== 'Prefer not to say' ? ` • ${thread.gender}` : ''}
                    </span>
                    <span>•</span>
                    <span>{formatDate(thread.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-[#0B3B82]">{thread.title}</h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {thread.question}
                  </p>
                </div>

                {/* Existing Doctor Answers */}
                {hasAnswers && (
                  <div className="space-y-2 pt-2">
                    {thread.answers.map((ans) => (
                      <div
                        key={ans.id}
                        className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="font-extrabold text-[#0B3B82] inline-flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5 text-[#16A34A]" />
                            {ans.doctorName}
                          </span>
                          {ans.recommendation && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#15803D]">
                              <Sparkles className="h-3 w-3" /> {ans.recommendation}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{ans.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenReply(thread.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isReplying
                        ? 'border border-slate-200 bg-white text-slate-600'
                        : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs'
                    }`}
                  >
                    <MessageCircleQuestion className="h-3.5 w-3.5" />
                    <span>{isReplying ? 'Close Editor' : hasAnswers ? 'Add Follow-up Reply' : 'Answer This Doubt'}</span>
                  </button>
                </div>

                {isReplying && (
                  <form
                    onSubmit={(e) => handlePublish(e, thread.id)}
                    className="rounded-2xl border border-emerald-200 bg-[#F8FBFF] p-4 space-y-3"
                  >
                    {errorMsg && (
                      <p className="text-xs font-bold text-red-600">{errorMsg}</p>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-[#0B3B82] mb-1">
                        Your Clinical Answer *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Provide clear, non-judgmental medical guidance and explain when an online video or audio consult is needed…"
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>Suggested Next Step:</span>
                        <select
                          value={recommendation}
                          onChange={(e) => setRecommendation(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0B3B82]"
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
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B3B82] hover:bg-[#072658] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                      >
                        <Send className="h-3.5 w-3.5 text-emerald-400" />
                        Publish Clinical Answer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-400 mb-2" />
          <p className="text-sm font-bold text-[#0B3B82]">
            {filter === 'pending' ? 'All patient doubts have been answered!' : 'No doubts in this view'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Switch tabs above to review previously answered questions.
          </p>
        </div>
      )}
    </div>
  );
}
