import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  Languages,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  User,
} from 'lucide-react';
import { HELLO_EMAIL, dispatchWelcomeEmail, submitApplication } from '../lib/doctorRegistry';
import { saveDocument } from '../lib/documentStore';

const SPECIALTIES = [
  'Clinical Sexology',
  'Andrology & Urology',
  "Women's Sexual Health",
  'Psychosexual Therapy',
  'Sexual Health & STI Care',
  'General Physician',
];

const initialForm = {
  fullName: '',
  email: '',
  city: '',
  languages: '',
  specialty: '',
  qualification: '',
  university: '',
  graduationYear: '',
  experience: '',
  council: '',
  regNo: '',
  certificateName: '',
  cvName: '',
  consent: false,
};

function Field({ label, required, icon: Icon, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#31466A]">
        {label}{required && <span className="text-[#B42318]"> *</span>}
      </span>
      <span className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition ${error ? 'border-[#B42318]' : 'border-[#DCE7F6] focus-within:border-[#16A34A]'}`}>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[#7C8DAA]" aria-hidden="true" />}
        {children}
      </span>
      {hint && !error && <span className="mt-1 block text-[11px] text-[#526987]">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] font-semibold text-[#B42318]">{error}</span>}
    </label>
  );
}

export default function DoctorRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mailDelivery, setMailDelivery] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  const update = (key) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleFile = (key) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors((current) => ({ ...current, [key]: 'Only PDF files are accepted.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [key]: 'File must be smaller than 2 MB.' }));
      return;
    }
    setForm((current) => ({ ...current, [key]: file.name }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (key === 'certificateName') setCertificateFile(file);
    if (key === 'cvName') setCvFile(file);
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Enter your full name as per council records.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid professional email.';
    if (!form.city.trim()) next.city = 'Enter your city of practice.';
    if (!form.languages.trim()) next.languages = 'List the languages you consult in.';
    if (!form.specialty) next.specialty = 'Choose your primary specialty.';
    if (!form.qualification.trim()) next.qualification = 'Enter your highest qualification.';
    if (!form.university.trim()) next.university = 'Enter your university or institution.';
    if (!/^\d{4}$/.test(form.graduationYear)) next.graduationYear = 'Enter a 4-digit graduation year.';
    if (!form.experience.trim()) next.experience = 'Enter your years of experience.';
    if (!form.council.trim()) next.council = 'Enter your registration council.';
    if (!form.regNo.trim()) next.regNo = 'Enter your council registration number.';
    if (!form.certificateName) next.certificateName = 'Upload your council registration certificate.';
    if (!form.consent) next.consent = 'Please accept the verification declaration.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      document.getElementById('clinician-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSubmitting(true);
    const application = submitApplication(form, { deferDispatch: true });
    await saveDocument(`${application.id}:certificate`, certificateFile);
    if (cvFile) await saveDocument(`${application.id}:cv`, cvFile);
    const emailStatus = await dispatchWelcomeEmail({
      to: application.email,
      name: application.fullName,
      role: 'doctor',
      applicationId: application.id,
      mailId: application.welcomeMailId,
    });
    setSubmitting(false);
    setMailDelivery(emailStatus);
    setSubmitted(application);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#DCE7F6] bg-white p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-[#128D28]">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#0B3B82]">Welcome to Nayacura — Application Submitted</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#526987]">
            Thank you, {submitted.fullName}.{' '}
            {mailDelivery?.sent
              ? <>A welcome confirmation email has been delivered from <strong className="text-[#0B3B82]">{HELLO_EMAIL}</strong> to <strong className="text-[#0B3B82]">{submitted.email}</strong>.</>
              : <>Your welcome confirmation from <strong className="text-[#0B3B82]">{HELLO_EMAIL}</strong> is queued for <strong className="text-[#0B3B82]">{submitted.email}</strong>.</>}
          </p>
          {mailDelivery?.previewUrl && (
            <div className="mt-3">
              <a href={mailDelivery.previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#128D28] hover:bg-emerald-100">
                <Mail className="h-3.5 w-3.5" /> Open Test Email Preview
              </a>
            </div>
          )}
          <dl className="mt-6 grid gap-3 rounded-2xl bg-[#F8FBFF] p-4 text-left text-sm">
            <div className="flex items-center justify-between gap-3"><dt className="text-[#526987]">Application ID</dt><dd className="font-bold text-[#0B3B82]">{submitted.id}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#526987]">Professional email</dt><dd className="font-semibold text-[#14213D]">{submitted.email}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#526987]">Status</dt><dd className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Pending admin verification</dd></div>
          </dl>
          <div className="mt-6 rounded-2xl border border-dashed border-[#DCE7F6] p-4 text-left text-xs leading-relaxed text-[#526987]">
            <p className="font-bold text-[#31466A]">What happens next?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>A welcome email from <strong>{HELLO_EMAIL}</strong> confirms your application is in the review queue.</li>
              <li>An administrator reviews your credentials in the clinician approval queue.</li>
              <li>On approval, your <strong>Login Email and Temporary Password</strong> are sent from <strong>{HELLO_EMAIL}</strong> to {submitted.email}.</li>
              <li>Use that email and password on the doctor sign-in page to enter your clinician console.</li>
            </ol>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/doctor-login" className="inline-flex items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#082B5E]">
              Back to doctor sign in <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#DCE7F6] px-5 py-2.5 text-sm font-bold text-[#31466A] hover:bg-[#F0F6FF]">
              Return home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/doctor-login" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#31466A] hover:text-[#0B3B82]">
          <ArrowLeft className="h-4 w-4" /> Back to clinician sign in
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div>
            <div className="rounded-3xl border border-[#DCE7F6] bg-white p-6 shadow-sm sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#128D28]">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified clinician onboarding
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0B3B82]">Apply as a Clinician</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#526987]">
                Submit your verified credentials to establish your private practice on Nayacura. Every application is reviewed by our medical governance team within 24–48 hours.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-[#526987]">
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[#16A34A]" />256-bit encrypted</span>
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-[#16A34A]" />Medical board vetted</span>
                <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />24–48h review</span>
              </div>
            </div>

            <form id="clinician-form" onSubmit={handleSubmit} className="mt-5" noValidate>
              <div className="overflow-hidden rounded-3xl border border-[#DCE7F6] bg-white shadow-sm">
                <div className="space-y-6 p-5 sm:p-6 lg:max-h-[70vh] lg:min-h-[460px] lg:overflow-y-auto">
              <section className="border-t border-[#EEF3FA] pt-6 first:border-t-0 first:pt-0">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#0B3B82]">
                  <User className="h-4 w-4" /> 01. Professional profile &amp; email
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" required icon={User} error={errors.fullName}>
                    <input value={form.fullName} onChange={update('fullName')} placeholder="e.g. Dr. Maya Sharma, MD" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <Field label="Professional email" required icon={Mail} error={errors.email} hint={`Welcome & login credentials are sent from ${HELLO_EMAIL} (no phone number needed).`}>
                    <input type="email" value={form.email} onChange={update('email')} placeholder="doctor@hospital.org" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <Field label="City of practice" required icon={MapPin} error={errors.city}>
                    <input value={form.city} onChange={update('city')} placeholder="e.g. Chennai, Tamil Nadu" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <Field label="Consultation languages" required icon={Languages} error={errors.languages}>
                    <input value={form.languages} onChange={update('languages')} placeholder="e.g. English, Tamil, Hindi" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                </div>
              </section>

              <section className="border-t border-[#EEF3FA] pt-6">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#0B3B82]">
                  <Stethoscope className="h-4 w-4" /> 02. Medical specialty & academic degrees
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Primary clinical specialty" required icon={Stethoscope} error={errors.specialty}>
                    <select value={form.specialty} onChange={update('specialty')} className="w-full bg-transparent text-sm text-[#14213D] outline-none">
                      <option value="">Choose primary specialty</option>
                      {SPECIALTIES.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}
                    </select>
                  </Field>
                  <Field label="Highest qualification" required icon={GraduationCap} error={errors.qualification}>
                    <input value={form.qualification} onChange={update('qualification')} placeholder="e.g. MBBS, MD (Psychiatry), DNB" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <Field label="University or institution" required icon={Building2} error={errors.university}>
                    <input value={form.university} onChange={update('university')} placeholder="e.g. Madras Medical College / AIIMS" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Graduation year" required icon={Calendar} error={errors.graduationYear}>
                      <input value={form.graduationYear} onChange={update('graduationYear')} inputMode="numeric" maxLength={4} placeholder="e.g. 2018" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                    </Field>
                    <Field label="Years of experience" required icon={Briefcase} error={errors.experience}>
                      <input value={form.experience} onChange={update('experience')} inputMode="numeric" placeholder="e.g. 8" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                    </Field>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#EEF3FA] pt-6">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#0B3B82]">
                  <Award className="h-4 w-4" /> 03. Medical council registration
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Registration council" required icon={BadgeCheck} error={errors.council}>
                    <input value={form.council} onChange={update('council')} placeholder="e.g. Tamil Nadu Medical Council / NMC" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                  <Field label="Registration / license number" required icon={FileText} error={errors.regNo} hint="As printed on your council certificate.">
                    <input value={form.regNo} onChange={update('regNo')} placeholder="e.g. TNMC-84920" className="w-full bg-transparent text-sm text-[#14213D] outline-none placeholder:text-slate-400" />
                  </Field>
                </div>
              </section>

              <section className="border-t border-[#EEF3FA] pt-6">
                <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-[#0B3B82]">
                  <Upload className="h-4 w-4" /> 04. Credential verification documents (PDF)
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#31466A]">Council certificate <span className="text-[#B42318]">*</span></span>
                    <label className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center transition ${errors.certificateName ? 'border-[#B42318] bg-red-50/40' : 'border-[#C9D8EC] bg-[#F8FBFF] hover:border-[#16A34A]'}`}>
                      <Upload className="h-5 w-5 text-[#0B3B82]" />
                      <span className="text-xs font-bold text-[#0B3B82]">{form.certificateName || 'Click to upload or drag & drop PDF'}</span>
                      <span className="text-[10px] text-[#526987]">PDF format only · max 2 MB</span>
                      <input type="file" accept="application/pdf" className="sr-only" onChange={handleFile('certificateName')} />
                    </label>
                    {errors.certificateName
                      ? <span className="mt-1 block text-[11px] font-semibold text-[#B42318]">{errors.certificateName}</span>
                      : <span className="mt-1 block text-[11px] text-[#526987]">Upload the registration certificate showing the council and number.</span>}
                  </div>
                  <div>
                    <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-[#31466A]">Curriculum vitae <span className="font-semibold normal-case text-[#526987]">(optional)</span></span>
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#C9D8EC] bg-[#F8FBFF] px-4 py-5 text-center transition hover:border-[#16A34A]">
                      <FileText className="h-5 w-5 text-[#0B3B82]" />
                      <span className="text-xs font-bold text-[#0B3B82]">{form.cvName || 'Click to upload or drag & drop PDF'}</span>
                      <span className="text-[10px] text-[#526987]">PDF format only · max 2 MB</span>
                      <input type="file" accept="application/pdf" className="sr-only" onChange={handleFile('cvName')} />
                    </label>
                    <span className="mt-1 block text-[11px] text-[#526987]">Recommended to showcase clinical expertise & training.</span>
                  </div>
                </div>
              </section>

              <section className="border-t border-[#EEF3FA] pt-6">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={form.consent} onChange={update('consent')} className="mt-0.5 h-4 w-4 rounded border-[#C9D8EC] text-[#16A34A] focus:ring-[#16A34A]" />
                  <span className="text-xs leading-relaxed text-[#526987]">
                    I solemnly affirm that all submitted credentials, medical qualifications and council registration details are active, accurate and unencumbered. I consent to credential verification under the <Link to="/privacy-standards" className="font-semibold text-[#0B3B82] underline">Privacy Policy</Link> and Terms of Practice.
                  </span>
                </label>
                {errors.consent && <p className="mt-2 text-[11px] font-semibold text-[#B42318]">{errors.consent}</p>}
              </section>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#E1E7EF] bg-[#F8FBFF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <button type="button" onClick={() => navigate('/doctor-login')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE7F6] bg-white px-5 py-2.5 text-sm font-bold text-[#31466A] hover:bg-[#F0F6FF]">
                    <ArrowLeft className="h-4 w-4" /> Back to sign in
                  </button>
                  <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B3B82] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#082B5E] disabled:opacity-60">
                    <ShieldCheck className="h-4 w-4" /> {submitting ? 'Submitting & sending welcome email...' : 'Submit clinician application'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0B3B82]">How onboarding works</h2>
              <ol className="mt-4 space-y-4">
                {[
                  { title: 'Apply with verified credentials', copy: 'Share your council registration, degrees and documents.' },
                  { title: 'Medical governance review', copy: 'Our administrators verify every certificate against council records.' },
                  { title: 'Approval emails', copy: 'A thank-you email and a credentials email (Doctor ID + temporary password) are sent to you.' },
                  { title: 'Start consulting privately', copy: 'Sign in to your clinician console, set availability and see patients.' },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-extrabold text-[#128D28]">{index + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-[#14213D]">{step.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#526987]">{step.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-[#DCE7F6] bg-[#0B3B82] p-5 text-white shadow-sm">
              <h3 className="text-sm font-extrabold">Why clinicians choose Nayacura</h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-blue-100">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />Encrypted telehealth suite with patient queue controls.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />Digital prescription stamping fulfilled by our pharmacy.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />Confidential EMR, STI panels and hormone reports.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />Stigma-free, consent-led care standards.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
              <p className="text-xs leading-relaxed text-[#526987]">
                Already approved? Use the Doctor ID and temporary password from your credentials email on the <Link to="/doctor-login" className="font-bold text-[#0B3B82] underline">clinician sign-in</Link> page.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
