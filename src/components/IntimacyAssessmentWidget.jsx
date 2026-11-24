import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Video, 
  ShieldCheck, 
  Clock, 
  Flame, 
  HeartHandshake, 
  FlaskConical, 
  Award,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';
import { DOCTORS } from '../data/healthcareData';

const QUESTIONS = [
  {
    id: 1,
    title: 'What is your primary intimate health concern?',
    subtitle: 'Select the concern that best describes what you are experiencing.',
    options: [
      {
        id: 'ed',
        label: 'Erection Hardness & Maintenance',
        desc: 'Difficulty getting or keeping firm erections during intimacy',
        icon: Flame,
        rootCause: 'Vascular blood flow restriction & performance anxiety',
        protocol: 'Doctor-prescribed PDE5 vasodilator protocol + vascular Doppler evaluation',
        successRate: '94% success rate within 3-4 weeks',
        doctorSpecialty: 'Clinical Sexologist & Andrologist'
      },
      {
        id: 'pe',
        label: 'Premature Climax / Lasting Stamina',
        desc: 'Reaching ejaculation sooner than 1-2 minutes or feeling low control',
        icon: Clock,
        rootCause: 'Hypersensitive nerve pathways & serotonin reuptake imbalance',
        protocol: 'Dual serotonin modulation therapy + neuro-desensitization spray',
        successRate: '92% of patients increase lasting time 4x',
        doctorSpecialty: 'Sexologist & Intimacy Counselor'
      },
      {
        id: 'libido',
        label: 'Low Drive, Fatigue & Loss of Morning Erections',
        desc: 'Decreased intimate interest, afternoon brain fog, or low stamina',
        icon: FlaskConical,
        rootCause: 'Endocrine hormonal disruption (Free Testosterone deficiency)',
        protocol: 'At-home 14-marker hormone biomarker test + natural bio-identical therapy',
        successRate: '89% experience renewed vitality in 21 days',
        doctorSpecialty: 'Andrologist & Endocrine Specialist'
      },
      {
        id: 'vaginismus',
        label: 'Female Involuntary Tightness / Painful Sex',
        desc: 'Inability to achieve penetration due to intense pelvic muscle spasms',
        icon: HeartHandshake,
        rootCause: 'Involuntary bulbocavernosus reflex contraction (Vaginismus)',
        protocol: 'Targeted pelvic floor neuromodulation + progressive dilator protocol',
        successRate: '95% achieve completely painless intimacy',
        doctorSpecialty: 'Female Intimacy Specialist & Gynecologist'
      },
      {
        id: 'sti',
        label: 'STI Doubt / Unprotected Exposure Screen',
        desc: 'Worried about burning, unusual discharge, rash, or routine checkup',
        icon: ShieldCheck,
        rootCause: 'Potential viral or bacterial pathogen requiring discrete PCR testing',
        protocol: 'Confidential 7-panel urine & blood PCR panel in 100% plain kit',
        successRate: '99.9% diagnostic accuracy within 24 hours',
        doctorSpecialty: 'Infectious Disease & Sexual Health Specialist'
      },
      {
        id: 'phimosis',
        label: 'Foreskin Tightness / Pain during Retraction',
        desc: 'Difficulty pulling back foreskin, repeated tears or infections',
        icon: Award,
        rootCause: 'Congenital or inflammatory Phimosis / Frenulum Breve',
        protocol: '15-minute daycare ZSR laser stapler circumcision with zero stitches',
        successRate: '99% permanent resolution, walk home in 30 mins',
        doctorSpecialty: 'Urologist & Daycare Surgeon'
      }
    ]
  },
  {
    id: 2,
    title: 'How long have you been experiencing this concern?',
    subtitle: 'Understanding the duration helps determine if it is acute or chronic.',
    options: [
      { id: 'recent', label: 'Recently started (< 1 Month)', desc: 'Usually triggered by sudden stress, fatigue, or life changes' },
      { id: 'medium', label: 'Past 1 to 6 Months', desc: 'Consistent pattern that has begun affecting intimacy and mood' },
      { id: 'chronic', label: 'Chronic (> 6 Months / 1+ Year)', desc: 'Long-standing concern requiring targeted medical protocol' },
      { id: 'situational', label: 'Situational / Occasional', desc: 'Happens with specific partners or during high anxiety moments' }
    ]
  },
  {
    id: 3,
    title: 'Do any of the following lifestyle factors apply to you?',
    subtitle: 'Lifestyle biomarkers directly correlate with intimate blood flow and hormones.',
    options: [
      { id: 'stress', label: 'High Work Stress & Performance Anxiety', desc: 'Overthinking during intimacy, fear of disappointing partner' },
      { id: 'metabolic', label: 'High Sugar (Diabetes), BP or High Cholesterol', desc: 'Can affect small micro-vessels responsible for blood flow' },
      { id: 'sleep', label: 'Irregular Sleep (< 6 hours) & Sedentary Lifestyle', desc: 'Dramatically reduces night-time testosterone production' },
      { id: 'none', label: 'None of the above / Purely physical symptom', desc: 'Concern exists despite healthy lifestyle and low stress' }
    ]
  }
];

export default function IntimacyAssessmentWidget({ onStartVideoConsult }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({
    concern: null,
    duration: null,
    lifestyle: null
  });
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = (option) => {
    if (currentStep === 0) {
      setSelectedAnswers({ ...selectedAnswers, concern: option });
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setSelectedAnswers({ ...selectedAnswers, duration: option });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setSelectedAnswers({ ...selectedAnswers, lifestyle: option });
      setIsCompleted(true);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswers({ concern: null, duration: null, lifestyle: null });
    setIsCompleted(false);
  };

  const chosenConcern = selectedAnswers.concern || QUESTIONS[0].options[0];

  return (
    <section className="py-14 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Card Container */}
        <div 
          className="rounded-3xl border border-emerald-200 shadow-card-soft p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-cover bg-center"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          {/* Top Badge & Header */}
          <div className="max-w-3xl mb-8 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="100% Anonymous • 60-Second Clinical Assessment" className="text-xs uppercase tracking-wider" />
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0B3B82] tracking-tight">
              Not Sure What You Need? Find Your Root Cause
            </h2>
            <p className="mt-2 text-slate-700 text-sm sm:text-base font-medium">
              Answer 3 anonymous questions to understand the underlying vascular, hormonal, or psychological factors and get matched with the right clinical specialist.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          {!isCompleted && (
            <div className="mb-8 relative z-10 max-w-xl">
              <div className="flex items-center justify-between text-xs font-bold text-[#0B3B82] mb-2">
                <span>Step {currentStep + 1} of 3</span>
                <span>{Math.round(((currentStep + 1) / 3) * 100)}% Completed</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white border border-emerald-200 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#16A34A] transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Question / Step Views */}
          {!isCompleted ? (
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0B3B82] mb-1">
                {QUESTIONS[currentStep].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6">
                {QUESTIONS[currentStep].subtitle}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUESTIONS[currentStep].options.map((opt) => {
                  const Icon = opt.icon || ChevronRight;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt)}
                      className="group p-5 rounded-2xl bg-white border border-emerald-100 hover:border-[#16A34A] shadow-xs hover:shadow-md transition-all duration-200 text-left flex items-start gap-3.5 transform hover:-translate-y-0.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] group-hover:bg-[#16A34A] group-hover:text-white transition flex items-center justify-center flex-shrink-0 font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 group-hover:text-[#0B3B82] transition leading-tight">
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                >
                  ← Back to previous question
                </button>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="relative z-10 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-md animate-fade-in">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clinical AI Assessment Complete
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B82]">
                    Personalized Clinical Recommendation for {chosenConcern.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Based on your reported duration and lifestyle biomarkers.
                  </p>
                </div>

                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-[#0B3B82] hover:bg-slate-50 transition border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>
              </div>

              {/* 3 Result Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    1. Primary Clinical Indicator
                  </span>
                  <div className="text-sm font-bold text-[#0B3B82] leading-tight">
                    {chosenConcern.rootCause}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Identified via reported duration: <strong>{selectedAnswers.duration?.label}</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803D] block mb-1">
                    2. Recommended Treatment Path
                  </span>
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    {chosenConcern.protocol}
                  </div>
                  <div className="text-[11px] text-[#15803D] font-semibold mt-1">
                    ★ {chosenConcern.successRate}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B3B82] block mb-1">
                    3. Matched Specialist Type
                  </span>
                  <div className="text-sm font-bold text-[#0B3B82] leading-tight">
                    {chosenConcern.doctorSpecialty}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>European Board & MCI Certified</span>
                  </div>
                </div>

              </div>

              {/* CTA Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <Lock className="w-4 h-4 text-[#16A34A]" />
                  <span>100% Anonymous • Camera-Off Audio Option Available</span>
                </div>

                <div className="flex items-center gap-3">
                  <MagneticButton
                    onClick={() => onStartVideoConsult(DOCTORS[0])}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition"
                  >
                    <Video className="w-4 h-4" />
                    <span>Consult Specialist in 60s (Private Audio/Video)</span>
                  </MagneticButton>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
