import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Video, 
  Calendar, 
  Package, 
  Sparkles, 
  Clock, 
  HelpCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { CONDITIONS_DATA } from '../data/conditionsData';
import { DOCTORS } from '../data/healthcareData';
import MagneticButton from '../components/ui/MagneticButton';
import ShinyText from '../components/ui/ShinyText';

export default function ConditionDetailPage({ onBookAppointment, onStartVideoConsult }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const condition = CONDITIONS_DATA[slug] || CONDITIONS_DATA['erectile-dysfunction'];

  // Find relevant doctors for this condition
  const relevantDoctors = DOCTORS.filter(d => 
    d.specialty.toLowerCase().includes(condition.matchingSpecialty.toLowerCase())
  );

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-navy transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Previous Page</span>
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5" /> 100% Confidential Condition Guide
          </span>
        </div>

        {/* Hero Banner for Condition with User's Clean Edge-to-Edge Background Image */}
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm mb-10 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="Condition Care & Protocol" className="text-xs uppercase tracking-wider" />
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              {condition.title}
            </h1>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed max-w-2xl">
              {condition.tagline}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => onStartVideoConsult(relevantDoctors[0] || DOCTORS[0])}
                className="px-6 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition flex items-center gap-2 hover:shadow-lg"
              >
                <Video className="w-4 h-4" />
                <span>Consult Specialist in 60s (Private Audio/Video)</span>
              </MagneticButton>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Zero Stigma • Evidence-Based Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Content: Left Details, Right Action Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column: Overview, Causes & Treatments (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <h3 className="text-xl font-bold text-brand-navy mb-3">
                Understanding {condition.title.split('(')[0]}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {condition.overview}
              </p>
            </div>

            {/* Causes Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <h3 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Root Causes & Triggers</span>
              </h3>
              <div className="space-y-3">
                {condition.causes.map((cause, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence-Based Treatments Card */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <h3 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-green" />
                <span>Clinically Proven Treatment Protocol</span>
              </h3>
              <div className="space-y-3">
                {condition.treatments.map((treat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                    <span>{treat}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Quick Consultation & Product Card (1 col) */}
          <div className="space-y-6">
            
            {/* Quick Consultation Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Specialist Care
              </div>
              <h4 className="text-lg font-bold text-brand-navy">
                Speak with a {condition.specialistType}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Skip awkward clinic waiting rooms. Get a personalized diagnosis and prescription from home.
              </p>

              <div className="mt-5 space-y-2.5">
                <button
                  onClick={() => onStartVideoConsult(relevantDoctors[0] || DOCTORS[0])}
                  className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Private Call (₹{relevantDoctors[0]?.videoFee || 599})</span>
                </button>

                <button
                  onClick={() => onBookAppointment(relevantDoctors[0] || DOCTORS[0], 'clinic')}
                  className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book In-Clinic Appointment</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-brand-green" />
                <span>100% Confidential Medical Session</span>
              </div>
            </div>

            {/* Recommended Test Box */}
            {condition.recommendedTest && (
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  Recommended At-Home Test
                </span>
                <h5 className="text-base font-bold mt-2">{condition.recommendedTest}</h5>
                <p className="text-xs text-slate-300 mt-1">
                  100% plain packaging with anonymous barcode tracking.
                </p>
                <Link
                  to="/lab-tests"
                  className="mt-4 inline-block w-full text-center py-2.5 rounded-xl bg-white text-brand-navy font-bold text-xs hover:bg-slate-100 transition"
                >
                  View Test Details & Book
                </Link>
              </div>
            )}

            {/* Recommended Solution Box */}
            {condition.recommendedProduct && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-slate-100 px-2 py-0.5 rounded">
                  Doctor-Approved Solution
                </span>
                <h5 className="text-sm font-bold text-brand-navy mt-2">{condition.recommendedProduct}</h5>
                <p className="text-xs text-slate-500 mt-1">
                  Delivered in an unbranded plain brown box with zero outer details.
                </p>
                <Link
                  to="/wellness-store"
                  className="mt-4 inline-block w-full text-center py-2.5 rounded-xl bg-brand-green text-white font-bold text-xs hover:bg-brand-green-dark transition"
                >
                  Order in Plain Packaging
                </Link>
              </div>
            )}

          </div>

        </div>

        {/* Verified Specialists Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-brand-navy mb-6">
            Verified {condition.matchingSpecialty} Specialists
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(relevantDoctors.length > 0 ? relevantDoctors : DOCTORS.slice(0, 2)).map((doc) => (
              <div key={doc.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <img src={doc.photo} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover border" />
                    <div>
                      <h4 className="font-bold text-brand-navy text-base">{doc.name}</h4>
                      <p className="text-xs text-brand-green font-bold">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-400">{doc.experience} Years • {doc.clinicName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{doc.about}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-extrabold text-brand-navy">₹{doc.fee} (Visit) / ₹{doc.videoFee} (Call)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onStartVideoConsult(doc)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-brand-green-dark border border-emerald-200 text-xs font-bold hover:bg-brand-green hover:text-white transition"
                    >
                      Call Now
                    </button>
                    <button
                      onClick={() => onBookAppointment(doc, 'clinic')}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy-dark transition"
                    >
                      Book Visit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
