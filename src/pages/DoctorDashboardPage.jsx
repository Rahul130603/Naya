import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import VideoCallRoom from '../components/VideoCallRoom';
import DoctorQaSection from '../components/DoctorQaSection';
import useVideoRoom from '../hooks/useVideoRoom';
import { roomCodeFor } from '../lib/videoRoom';
import { listQaThreads, subscribeQaThreads } from '../lib/communityQa';
import { 
  LayoutDashboard,
  Users,
  Video, 
  FileText, 
  FlaskConical,
  Clock, 
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus,
  EyeOff,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Building,
  MessageCircleQuestion
} from 'lucide-react';

const SECTION_TITLES = {
  overview: 'Dashboard Overview',
  queue: "Today's Patient Queue",
  qa: 'Patient Doubts (Q&A)',
  video: 'Video Consultation Suite',
  prescriptions: 'Digital E-Prescriptions',
  emr: 'Patient Medical Records (EMR)',
  schedule: 'Practice Schedule & Availability',
  profile: 'Clinician Profile & Credentials'
};

export default function DoctorDashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [internalSection, setInternalSection] = useState(section || 'overview');
  const activeSection = (section && SECTION_TITLES[section]) ? section : internalSection;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modal States
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(null);
  const [isNewRxModalOpen, setIsNewRxModalOpen] = useState(false);
  const [prescribedToast, setPrescribedToast] = useState(null);

  // Practice state
  const [isAcceptingInstantCalls, setIsAcceptingInstantCalls] = useState(true);
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'clinic' | 'video'
  const [selectedEmrPatient, setSelectedEmrPatient] = useState('PT-9410');
  const [qaThreads, setQaThreads] = useState(() => listQaThreads());

  useEffect(() => subscribeQaThreads(setQaThreads), []);

  const pendingQaCount = qaThreads.filter((thread) => thread.answers.length === 0).length;

  const showDoctorToast = (message) => {
    setPrescribedToast(message);
    setTimeout(() => setPrescribedToast(null), 4000);
  };

  // Clinician profile
  const doctor = user?.role === 'doctor' ? user : {
    name: 'Dr. Arvind Swaminathan',
    regNo: 'TN-MED-44819',
    specialty: 'Clinical Sexologist & Andrologist',
    experience: '14+ Years',
    clinic: 'Nayacura Men & Women Intimate Health Clinic, Chennai',
    email: 'dr.arvind@nayacura.clinic',
    phone: '+91 94440 18291',
    role: 'doctor'
  };

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'queue', label: "Today's Queue", icon: Users },
    { key: 'qa', label: 'Patient Doubts (Q&A)', icon: MessageCircleQuestion, badge: pendingQaCount },
    { key: 'video', label: 'Video Consultation Suite', icon: Video },
    { key: 'prescriptions', label: 'E-Prescriptions', icon: FileText },
    { key: 'emr', label: 'Patient Records (EMR)', icon: FlaskConical },
    { key: 'schedule', label: 'Practice Schedule', icon: Clock },
  ];

  const handleNavClick = (key) => {
    setInternalSection(key);
    navigate(key === 'overview' ? '/doctor-dashboard' : `/doctor-dashboard/${key}`);
    setSidebarOpen(false);
  };

  // Patients Queue
  const [patientsQueue] = useState([
    {
      id: 'PT-9410',
      name: 'Suresh Kumar',
      age: 34,
      gender: 'Male',
      time: '04:30 PM (Today)',
      type: 'clinic',
      room: 'Private Consultation Suite 3',
      chiefComplaint: 'Erectile Vitality & Performance Anxiety Management',
      status: 'Confirmed & Checked-In',
      history: 'Consultation #2. Biomarkers verified (Testosterone: 624 ng/dL, STI 7-Panel: Negative).',
      vitals: { bp: '120/80 mmHg', pulse: '72 bpm', weight: '74 kg' }
    },
    {
      id: 'PT-9418',
      name: 'Anonymous Patient #812',
      age: 29,
      gender: 'Male',
      time: '05:15 PM (Today)',
      type: 'video',
      room: 'Encrypted HD Video Room',
      chiefComplaint: 'Premature Ejaculation & Sensitivity Calibration',
      status: 'Ready in Waiting Room',
      history: 'First time confidential video consult.',
      vitals: { bp: '118/76 mmHg', pulse: '76 bpm', weight: '68 kg' }
    },
    {
      id: 'PT-9422',
      name: 'Karthik Raja',
      age: 38,
      gender: 'Male',
      time: '06:00 PM (Today)',
      type: 'clinic',
      room: 'Private Consultation Suite 3',
      chiefComplaint: 'Low Libido & Daily Fatigue Evaluation',
      status: 'Confirmed',
      history: 'Follow-up on Shilajit & hormonal regimen.',
      vitals: { bp: '124/82 mmHg', pulse: '70 bpm', weight: '78 kg' }
    },
    {
      id: 'PT-9430',
      name: 'Anonymous Patient #930',
      age: 31,
      gender: 'Male',
      time: '06:45 PM (Today)',
      type: 'video',
      room: 'Encrypted HD Video Room',
      chiefComplaint: 'Post-Finasteride Sexual Wellness Evaluation',
      status: 'Confirmed',
      history: 'Review of endocrine blood profile.',
      vitals: { bp: '122/80 mmHg', pulse: '74 bpm', weight: '71 kg' }
    }
  ]);

  // Live video room: patient presence arrives from the patient portal.
  const roomCode = roomCodeFor(doctor.name);
  const { room: videoRoom, patientPresent, bothPresent, status: videoStatus } = useVideoRoom(roomCode);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [dismissedPatientJoin, setDismissedPatientJoin] = useState(null);
  const waitingPatient = patientsQueue[0];
  const patientJoinedAt = videoRoom?.patient?.joinedAt || null;
  const videoCompleted = videoStatus === 'completed' && !patientPresent;
  const completedAtLabel = videoRoom?.completedAt
    ? new Date(videoRoom.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const showPatientRoomToast = Boolean(patientJoinedAt) && !isCallOpen && dismissedPatientJoin !== patientJoinedAt;

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX-2026-8812',
      patientName: 'Suresh Kumar',
      patientId: 'PT-9410',
      date: '21 Nov 2026',
      drug: 'Tadalafil Daily Care 5mg',
      instructions: '1 tab daily at bedtime with water',
      duration: '30 Days',
      status: 'DISPATCHED',
      type: 'Standard'
    },
    {
      id: 'RX-2026-8819',
      patientName: 'Anonymous Patient #812',
      patientId: 'PT-9418',
      date: '23 Nov 2026',
      drug: 'Nayacura Pro-Delay Care Spray',
      instructions: 'Apply 2-3 metered sprays 15 mins prior',
      duration: '100+ Sprays',
      status: 'REFILL REQUEST',
      type: 'Refill Request'
    }
  ]);

  // New Rx State
  const [newRxPatient, setNewRxPatient] = useState('Suresh Kumar');
  const [newRxMedicine, setNewRxMedicine] = useState('Tadalafil Daily Care 5mg');
  const [newRxDosage, setNewRxDosage] = useState('1 tablet daily at bedtime');
  const [newRxDuration, setNewRxDuration] = useState('30 Days');
  const [newRxNotes, setNewRxNotes] = useState('Continue aerobic exercise and adequate hydration.');

  const handleIssueRx = (e) => {
    e.preventDefault();
    const newRx = {
      id: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: newRxPatient,
      patientId: 'PT-9410',
      date: 'Today',
      drug: newRxMedicine,
      instructions: newRxDosage,
      duration: newRxDuration,
      status: 'ISSUED & SIGNED',
      type: 'Certified Tele-Rx'
    };
    setPrescriptions([newRx, ...prescriptions]);
    setIsNewRxModalOpen(false);
    setPrescribedToast(`Digitally signed and issued prescription for ${newRxPatient}!`);
    setTimeout(() => setPrescribedToast(null), 4000);
  };

  const handleApproveRefill = (rxId) => {
    setPrescriptions(prescriptions.map(p => p.id === rxId ? { ...p, status: 'APPROVED & DISPATCHED' } : p));
    setPrescribedToast('Refill request approved and sent to pharmacy dispatch!');
    setTimeout(() => setPrescribedToast(null), 4000);
  };

  // Stealth Mode Camouflage
  if (isStealthMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Clinician Screen Lock Active</h2>
          <p className="mt-2 text-xs text-slate-400">
            Clinical records and patient identifiers are temporarily hidden from display. Medical session remains active.
          </p>
          <button
            type="button"
            onClick={() => setIsStealthMode(false)}
            className="mt-6 w-full py-3 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition"
          >
            Resume Clinician Console
          </button>
        </div>
      </div>
    );
  }

  const filteredQueue = queueFilter === 'all' 
    ? patientsQueue 
    : patientsQueue.filter(p => p.type === queueFilter);

  return (
    <div className="flex min-h-screen bg-[#F5F9FF] text-[#0B234D]">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* 1. PERSISTENT LEFT SIDEBAR */}
      <aside className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-[#E1E7EF] bg-white transition-transform duration-200 lg:sticky lg:top-0 shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Top: Logo & Main Navigation Links */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex h-[74px] items-center justify-between border-b border-[#E1E7EF] px-6 shrink-0">
            <Link to="/" aria-label="Nayacura home">
              <img src="/logo.png" alt="Nayacura" className="h-10 sm:h-14 w-auto object-contain cursor-pointer hover:opacity-85 transition" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Doctor portal" className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">Doctor Portal</p>
            
            <div className="space-y-1">
              {navItems.map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNavClick(key)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${
                    activeSection === key 
                      ? 'bg-[#0B3B82] text-white shadow-sm' 
                      : 'text-[#14213D] hover:bg-[#F0F6FF]'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                      activeSection === key ? 'bg-emerald-400 text-[#0B3B82]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Doctor Credential Footnote - Pinned to the VERY BOTTOM */}
        <div className="mt-auto shrink-0 border-t border-[#E1E7EF] p-4 bg-slate-50/80">
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 w-full text-left group hover:opacity-90 transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#0B3B82] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-[#16A34A] transition">
              {doctor.name.charAt(4) || 'D'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0B3B82] truncate group-hover:text-[#16A34A] transition">{doctor.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{doctor.regNo}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="min-w-0 flex-1">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#E1E7EF] bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Open dashboard menu"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Doctor Portal</p>
              <h2 className="truncate text-lg font-extrabold text-[#0B3B82] sm:text-2xl">
                {SECTION_TITLES[activeSection] || 'Dashboard Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Available Online</span>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('video')}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#072658] transition"
            >
              <Video className="h-3.5 w-3.5 text-emerald-400" />
              <span>Video Suite</span>
            </button>

            <span className="hidden h-7 w-px bg-[#E1E7EF] sm:block" />

            {/* Round Avatar Icon with Dropdown Menu & Sign Out */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#0B3B82] font-bold text-white text-sm hover:ring-2 hover:ring-[#16A34A] hover:ring-offset-2 transition cursor-pointer shadow-xs"
                aria-label="Clinician Account Menu"
                title="Account Menu & Sign Out"
              >
                {doctor.name.charAt(4) || 'D'}
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-scale-up text-xs">
                    {/* User Info Header */}
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-extrabold text-[#0B3B82] text-sm truncate">{doctor.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{doctor.specialty}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          {doctor.regNo}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B3B82]">
                          Doctor Portal
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium transition"
                      >
                        <Building className="h-4 w-4 text-[#0B3B82]" />
                        <span>Go to Nayacura Home</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium text-left transition"
                      >
                        <UserRound className="h-4 w-4 text-[#0B3B82]" />
                        <span>Clinician Profile & Credentials</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsStealthMode(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-left transition"
                      >
                        <EyeOff className="h-4 w-4 text-slate-400" />
                        <span>Screen Lock</span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-left transition"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Toast Notification */}
        {prescribedToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0B3B82] text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{prescribedToast}</span>
          </div>
        )}

        {/* Patient joined the secure room — live presence notification */}
        {showPatientRoomToast && (
          <div className="fixed bottom-6 right-6 z-40 w-[min(92vw,340px)] rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#128D28]"><Video className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0B3B82]">{videoRoom?.patient?.name || waitingPatient?.name || 'Your patient'} joined the room</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#526987]">Your patient is waiting in the secure video room. Join now to begin the consultation.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setIsCallOpen(true); setDismissedPatientJoin(patientJoinedAt); }} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white hover:bg-[#082B5E]">Join Room</button>
                  <button type="button" onClick={() => setDismissedPatientJoin(patientJoinedAt)} className="rounded-lg border border-[#DCE7F6] px-3 py-2 text-xs font-bold text-[#526987]">Later</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <div className="px-4 py-5 sm:px-6 lg:px-8">

          {/* ==================== A. DASHBOARD OVERVIEW ==================== */}
          {activeSection === 'overview' && (
            <>
              {/* Mint-Wave Hero Banner matching uploaded design */}
              <section className="relative mb-5 overflow-hidden rounded-2xl border border-[#DCE7F6] bg-white p-6 shadow-sm sm:p-8">
                <svg
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-3/5 opacity-80 sm:h-32"
                  viewBox="0 0 800 150"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 150 C160 45 260 50 400 125 C555 175 670 35 800 70 L800 150 Z" fill="#DDF7DD" />
                  <path d="M0 150 C180 72 280 86 430 135 C570 178 670 80 800 105 L800 150 Z" fill="#9FEA93" />
                  <path d="M130 150 C290 90 360 128 480 150 Z" fill="#50CC47" />
                </svg>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>MCI / NMC Certified Specialist • Reg No: {doctor.regNo}</span>
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3B82] sm:text-3xl">
                    Welcome back, <span className="text-[#128D28]">{doctor.name}</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#334B73]">
                    Manage your patient queue, issue certified digital tele-prescriptions, and review confidential diagnostic EMRs.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavClick('video')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E] transition"
                    >
                      <Video className="h-4 w-4 text-emerald-400" />
                      Enter HD Video Suite
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNewRxModalOpen(true)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16A34A] bg-emerald-50 px-5 py-2 text-sm font-bold text-[#128D28] hover:bg-emerald-100 transition"
                    >
                      <Plus className="h-4 w-4" />
                      + Write Digital Rx
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('queue')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-[#0B3B82] hover:bg-blue-100 transition"
                    >
                      <Calendar className="h-4 w-4" />
                      Today's Queue ({patientsQueue.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('qa')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100 transition"
                    >
                      <MessageCircleQuestion className="h-4 w-4" />
                      Patient Doubts ({pendingQaCount} Pending)
                    </button>
                  </div>
                </div>
              </section>

              {/* 4 Summary Stat Cards in a Row */}
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
                {[
                  { key: 'queue', label: "Today's Queue", count: patientsQueue.length, note: 'Consultations', icon: Users, tone: 'bg-blue-50 text-[#0B3B82]' },
                  { key: 'prescriptions', label: 'Pending Refills', count: '2', note: 'Medical slips', icon: FileText, tone: 'bg-emerald-50 text-[#128D28]' },
                  { key: 'emr', label: 'EMR Labs', count: '8', note: 'Diagnostic reports', icon: FlaskConical, tone: 'bg-purple-50 text-purple-700' },
                  { key: 'video', label: 'Instant Video', count: isAcceptingInstantCalls ? 'Active' : 'Offline', note: 'Telehealth status', icon: Video, tone: 'bg-amber-50 text-amber-700' },
                ].map(({ key, label, count, note, icon: Icon, tone }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNavClick(key)}
                    className="flex min-h-28 items-center gap-3 rounded-2xl border border-[#DCE7F6] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#16A34A] sm:p-5"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-extrabold uppercase tracking-wide text-[#31466A]">{label}</span>
                      <span className="block text-2xl font-extrabold text-[#0B3B82]">{count}</span>
                      <span className="block truncate text-xs text-[#526987]">{note}</span>
                    </span>
                    <ChevronRight className="hidden h-4 w-4 text-[#0B3B82] sm:block" />
                  </button>
                ))}
              </div>

              {/* Balanced 2x2 Grid of Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                
                {/* Card 1: Next Patient Up */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Next Patient Up</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                        Confirmed & Checked-In
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-extrabold text-slate-800">Suresh Kumar (Male, 34 yrs)</h4>
                          <p className="text-xs text-slate-500">ID: PT-9410 • Consultation #2</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#0B3B82] block">Today</span>
                          <span className="text-xs text-slate-500">04:30 PM (Today)</span>
                        </div>
                      </div>

                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                        <p className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>Private Consultation Suite 3</span>
                        </p>
                        <p className="text-slate-600">
                          <strong>Chief Complaint:</strong> Erectile Vitality & Performance Anxiety Management
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientRecord(patientsQueue[0])}
                      className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition flex items-center gap-1"
                    >
                      <span>View Full Patient EMR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrescribedToast('Calling Suresh Kumar into Consultation Suite 3...');
                        setTimeout(() => setPrescribedToast(null), 3000);
                      }}
                      className="px-4 py-2 rounded-full bg-[#0B3B82] hover:bg-[#072658] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <span>Call Patient In</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card 2: Digital E-Prescription Manager */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Digital E-Prescription Manager</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0B3B82] text-xs font-extrabold border border-blue-200">
                        2 Pending Refills
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Tadalafil Daily Care 5mg</p>
                          <p className="text-[11px] text-slate-500">Patient: Suresh Kumar • 30 Days supply</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          DISPATCHED
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Nayacura Pro-Delay Care Spray</p>
                          <p className="text-[11px] text-slate-500">Patient: Anonymous #812 • Metered Spray</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApproveRefill('RX-2026-8819')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                        >
                          APPROVE REFILL →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsNewRxModalOpen(true)}
                      className="px-4 py-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create New Digital Rx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('prescriptions')}
                      className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      View All Rx History →
                    </button>
                  </div>
                </div>

                {/* Card 3: Electronic Medical Records (EMR) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Electronic Medical Records (EMR)</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
                        NABL Verified
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                        <span>Patient: Suresh Kumar (PT-9410)</span>
                        <span className="text-emerald-700">Lab Panel Complete</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <p className="text-slate-500">7-Panel STI Screen:</p>
                          <p className="font-bold text-emerald-700">All Non-Reactive (Negative)</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Serum Total Testosterone:</p>
                          <p className="font-bold text-[#0B3B82]">624 ng/dL (Normal Range)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientRecord(patientsQueue[0])}
                      className="font-bold text-xs text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      Review Full Diagnostic Chart →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick('emr')}
                      className="text-xs text-slate-500 hover:text-slate-700 transition"
                    >
                      Search All EMRs
                    </button>
                  </div>
                </div>

                {/* Card 4: Practice Schedule & Availability */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Practice Schedule & Availability</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-xs font-bold text-[#0B3B82] block">Instant Video Care Status</span>
                          <span className="text-[11px] text-slate-500">Allow verified patients to request instant video triage</span>
                        </div>
                        <button type="button" role="switch" aria-checked={isAcceptingInstantCalls} aria-label="Accept instant video consults" onClick={() => setIsAcceptingInstantCalls(!isAcceptingInstantCalls)}
                          className={`toggle-switch w-11 h-6 rounded-full transition-colors relative shrink-0 flex items-center ${
                            isAcceptingInstantCalls ? 'bg-[#16A34A]' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                            isAcceptingInstantCalls ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      <div className="mt-3 text-xs text-slate-600 space-y-1">
                        <p>📍 <strong>Chennai Nungambakkam Clinic:</strong> 02:00 PM – 07:00 PM</p>
                        <p>💻 <strong>Nayacura Telehealth Suite:</strong> 07:30 PM – 09:30 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">
                      Next available slot: <strong>Tomorrow 10:30 AM</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('schedule')}
                      className="self-start font-bold text-[#0B3B82] hover:text-[#16A34A] transition sm:self-auto"
                    >
                      Manage Practice Calendar →
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ==================== B. TODAY'S PATIENT QUEUE ==================== */}
          {activeSection === 'queue' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Today's Scheduled Consultations</h3>
                  <p className="text-xs text-slate-500 mt-1">Review check-in status, triage priority, and initiate private sessions.</p>
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'clinic', 'video'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setQueueFilter(tab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                        queueFilter === tab
                          ? 'bg-[#0B3B82] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab === 'all' ? 'All (4)' : tab === 'clinic' ? 'In-Clinic (2)' : 'Encrypted Video (2)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredQueue.map((patient) => (
                  <div key={patient.id} className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#16A34A] transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-[#0B3B82]">{patient.name}</span>
                        <span className="text-xs text-slate-400">({patient.gender}, {patient.age} yrs)</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B3B82] border border-blue-200">
                          {patient.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          patient.type === 'clinic' ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {patient.type === 'clinic' ? '📍 In-Clinic' : '💻 Telehealth Video'}
                        </span>
                        {patient.name === waitingPatient?.name && videoCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#128D28] border border-emerald-200">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Chief Complaint:</strong> {patient.chiefComplaint}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Scheduled for: <strong>{patient.time}</strong> • Location/Room: <strong>{patient.room}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedPatientRecord(patient)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        View Full EMR
                      </button>

                      {patient.type === 'clinic' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPrescribedToast(`Calling ${patient.name} into ${patient.room}...`);
                            setTimeout(() => setPrescribedToast(null), 3000);
                          }}
                          className="px-5 py-2 rounded-xl bg-[#0B3B82] hover:bg-[#072658] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <span>Call Patient In</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCallOpen(true)}
                          className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>{videoCompleted ? 'Rejoin' : 'Start Video'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== C. VIDEO TELEHEALTH SUITE ==================== */}
          {activeSection === 'video' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div className="flex flex-col gap-2 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0B3B82]">HD Video Consultation Suite</h3>
                    <p className="text-xs text-slate-500 mt-1">256-Bit HIPAA Encrypted LiveKit WebRTC Peer-to-Peer Teleconsultation Room</p>
                  </div>
                  <span className={`self-start px-3 py-1 rounded-full text-xs font-extrabold border ${bothPresent || patientPresent ? 'bg-emerald-50 text-[#16A34A] border-emerald-200' : videoCompleted ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {bothPresent ? 'Both Connected' : patientPresent ? 'Patient In Room' : videoCompleted ? 'Completed' : 'Waiting for Patient'}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Video Preview Window */}
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-white lg:col-span-2">
                    <div className="relative flex min-h-[230px] flex-col items-center justify-center gap-1 p-6 pt-12 sm:min-h-[300px] lg:aspect-video lg:min-h-0">
                      {patientPresent ? (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A] text-xl font-bold">
                            {(waitingPatient?.name || 'P').charAt(0)}
                          </div>
                          <p className="font-extrabold text-base">{waitingPatient?.name || 'Patient'}</p>
                          <p className="text-xs text-slate-400">{bothPresent ? 'Patient is connected' : 'Patient is waiting in the room'}</p>
                        </>
                      ) : videoCompleted ? (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-8 w-8" />
                          </div>
                          <p className="font-extrabold text-base">Consultation completed</p>
                          <p className="text-center text-xs text-slate-400">{completedAtLabel ? `Session closed at ${completedAtLabel}` : 'Session closed'}</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B3B82] text-xl font-bold">
                            {doctor.name.charAt(4)}
                          </div>
                          <p className="font-extrabold text-base">{doctor.name}</p>
                          <p className="text-xs text-slate-400">{doctor.specialty} (Ready)</p>
                        </>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 pr-3 sm:left-4 sm:top-4">
                        <span className="flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          HD 1080p WebRTC
                        </span>
                        <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                          Room #{roomCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[11px] text-slate-400">
                        {bothPresent ? 'Connected — consultation in progress' : patientPresent ? 'Patient is waiting — join the room' : videoCompleted ? 'Consultation completed — rejoin if needed' : 'Waiting for patient to connect audio/video...'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCallOpen(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#15803D] sm:w-auto"
                      >
                        <Video className="h-4 w-4" />
                        {bothPresent || videoCompleted ? 'Rejoin Room' : 'Join Room'}
                      </button>
                    </div>
                  </div>

                  {/* Right: Tele-Consultation Controls */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-xs text-[#0B3B82] uppercase tracking-wider mb-2">Connected Patient</h4>
                      <p className="font-extrabold text-slate-800 text-sm">{waitingPatient?.name || 'Suresh Kumar'}</p>
                      <p className="text-xs text-slate-500">Scheduled: 04:30 PM • 30 mins slot</p>
                      <p className="text-xs text-slate-600 mt-2"><strong>Complaint:</strong> Performance Anxiety & Vitality</p>
                      <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${patientPresent ? 'bg-emerald-100 text-[#15803D]' : videoCompleted ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${patientPresent ? 'bg-emerald-500 animate-pulse' : videoCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {bothPresent ? 'Both in room — connected' : patientPresent ? 'Patient in the waiting room' : videoCompleted ? 'Consultation completed' : 'Waiting for patient'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCallOpen(true)}
                      className="w-full py-3 rounded-xl bg-[#0B3B82] hover:bg-[#082B5E] text-white text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4 text-emerald-400" />
                      {bothPresent ? 'Rejoin Video Room' : 'Enter Video Room'}
                    </button>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-xs text-[#0B3B82] uppercase tracking-wider">Quick Actions in Call</h4>
                      <button
                        type="button"
                        onClick={() => setIsNewRxModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-white border border-[#16A34A] text-[#16A34A] hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Write Prescription in Call
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientRecord(patientsQueue[0])}
                        className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                      >
                        Open Patient EMR Chart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== D. DIGITAL E-PRESCRIPTIONS ==================== */}
          {activeSection === 'prescriptions' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Digital E-Prescription Manager</h3>
                  <p className="text-xs text-slate-500 mt-1">Review active tele-prescriptions, approve refill requests, and issue certified digital slips.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRxModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  + Create New Digital Rx
                </button>
              </div>

              {/* Prescriptions History Table */}
              <div className="rounded-2xl bg-white border border-[#DCE7F6] shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <span className="col-span-3">Patient & ID</span>
                  <span className="col-span-4">Formulation & Dosage</span>
                  <span className="col-span-2">Date & Duration</span>
                  <span className="col-span-3 text-right">Status & Action</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="grid grid-cols-1 items-start gap-3 p-4 text-xs transition hover:bg-slate-50/60 sm:grid-cols-12 sm:items-center sm:gap-2">
                      <div className="sm:col-span-3">
                        <p className="font-extrabold text-slate-800">{rx.patientName}</p>
                        <p className="text-[11px] text-slate-500">{rx.id} • {rx.patientId}</p>
                      </div>
                      <div className="sm:col-span-4">
                        <p className="font-bold text-[#0B3B82]">{rx.drug}</p>
                        <p className="text-[11px] text-slate-500">{rx.instructions}</p>
                      </div>
                      <div className="flex items-center gap-3 sm:col-span-2 sm:block">
                        <p className="font-medium text-slate-700">{rx.date}</p>
                        <p className="text-[11px] text-slate-500">{rx.duration}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:col-span-3 sm:block sm:text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rx.status.includes('DISPATCHED') || rx.status.includes('SIGNED')
                            ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {rx.status}
                        </span>
                        {rx.status === 'REFILL REQUEST' && (
                          <div className="sm:mt-1">
                            <button
                              type="button"
                              onClick={() => handleApproveRefill(rx.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-[11px] font-bold hover:bg-[#15803D] transition sm:ml-auto"
                            >
                              Approve Refill
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== E. PATIENT RECORDS (EMR) ==================== */}
          {activeSection === 'emr' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Electronic Medical Records (EMR)</h3>
                  <p className="text-xs text-slate-500 mt-1">NABL Accredited diagnostic reports, STI screens, and endocrine blood profiles.</p>
                </div>
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-xs font-bold text-slate-500">Selected Patient:</span>
                  <select
                    value={selectedEmrPatient}
                    onChange={(e) => setSelectedEmrPatient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#0B3B82] bg-white focus:outline-none sm:w-auto sm:py-1.5"
                  >
                    <option value="PT-9410">Suresh Kumar (PT-9410)</option>
                    <option value="PT-9418">Anonymous Patient #812 (PT-9418)</option>
                    <option value="PT-9422">Karthik Raja (PT-9422)</option>
                  </select>
                </div>
              </div>

              {/* Diagnostics Detail Card */}
              <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-6">
                <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      NABL & CAP Accredited Laboratory
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800 mt-1">7-Panel Confidential STI Screen & Hormone Profile</h4>
                    <p className="text-xs text-slate-500">Specimen collected: 21 Nov 2026 • Verified by Pathologist Dr. R. Ramanathan, MD</p>
                  </div>
                  <span className="self-start px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-extrabold border border-emerald-200">
                    ALL NON-REACTIVE (NORMAL)
                  </span>
                </div>

                {/* STI Screen Table */}
                <div>
                  <h5 className="text-xs font-bold text-[#0B3B82] uppercase tracking-wider mb-2">1. STI Pathogen Multiplex Panel</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { test: 'HIV 1 & 2 4th Gen Ag/Ab', result: 'Non-Reactive', status: 'Negative' },
                      { test: 'Syphilis (VDRL / RPR)', result: 'Non-Reactive', status: 'Negative' },
                      { test: 'Hepatitis B (HBsAg)', result: 'Non-Reactive', status: 'Negative' },
                      { test: 'Hepatitis C (Anti-HCV)', result: 'Non-Reactive', status: 'Negative' },
                      { test: 'Herpes Simplex HSV-1 IgG', result: '0.12 (Index)', status: 'Negative' },
                      { test: 'Herpes Simplex HSV-2 IgG', result: '0.08 (Index)', status: 'Negative' },
                      { test: 'Chlamydia Trachomatis PCR', result: 'Not Detected', status: 'Negative' },
                      { test: 'Neisseria Gonorrhoeae PCR', result: 'Not Detected', status: 'Negative' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <p className="font-bold text-slate-700 text-[11px] truncate">{item.test}</p>
                        <p className="font-extrabold text-[#16A34A] mt-1">{item.result}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Endocrine Profile */}
                <div>
                  <h5 className="text-xs font-bold text-[#0B3B82] uppercase tracking-wider mb-2">2. Endocrine & Vitality Biomarkers</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
                      <p className="text-slate-500 text-[11px]">Serum Total Testosterone</p>
                      <p className="text-lg font-extrabold text-[#0B3B82]">624 ng/dL</p>
                      <p className="text-[10px] text-slate-500">Biological Reference: 280 – 850 ng/dL</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                      <p className="text-slate-500 text-[11px]">Free Testosterone (ECLIA)</p>
                      <p className="text-lg font-extrabold text-[#16A34A]">17.8 pg/mL</p>
                      <p className="text-[10px] text-slate-500">Biological Reference: 8.5 – 25.0 pg/mL</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200">
                      <p className="text-slate-500 text-[11px]">Serum Prolactin</p>
                      <p className="text-lg font-extrabold text-purple-700">8.4 ng/mL</p>
                      <p className="text-[10px] text-slate-500">Biological Reference: 2.5 – 17.0 ng/mL</p>
                    </div>
                  </div>
                </div>

                {/* Clinical Notes Editor */}
                <div className="pt-4 border-t border-slate-200">
                  <h5 className="text-xs font-bold text-[#0B3B82] uppercase tracking-wider mb-2">Doctor Clinical Consultation Notes</h5>
                  <textarea
                    rows={3}
                    defaultValue="Patient Suresh Kumar presenting with psychogenic performance anxiety in second consultation. Biomarkers rule out physiological hypogonadism. Prescribed low-dose daily Tadalafil 5mg alongside stress-regulation protocols."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#0B3B82]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPrescribedToast('Clinical notes auto-saved to encrypted EMR database.');
                        setTimeout(() => setPrescribedToast(null), 3000);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#072658] transition"
                    >
                      Save EMR Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== F. PRACTICE SCHEDULE ==================== */}
          {activeSection === 'schedule' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Practice Schedule & Telehealth Windows</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure appointment slots for in-person clinic and encrypted video calls.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isAcceptingInstantCalls ? 'text-[#16A34A]' : 'text-slate-500'}`}>
                    {isAcceptingInstantCalls ? 'ONLINE (Accepting)' : 'OFFLINE'}
                  </span>
                  <button type="button" role="switch" aria-checked={isAcceptingInstantCalls} aria-label="Accept instant video consults" onClick={() => setIsAcceptingInstantCalls(!isAcceptingInstantCalls)}
                    className={`toggle-switch flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      isAcceptingInstantCalls ? 'bg-[#16A34A]' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isAcceptingInstantCalls ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs space-y-4">
                  <h4 className="font-extrabold text-[#0B3B82] text-sm">📍 In-Person Clinic Hours (Nungambakkam)</h4>
                  <div className="space-y-2 text-xs">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-700">{day}</span>
                        <span className="text-[#0B3B82] font-semibold">02:00 PM – 07:00 PM (10 Slots)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs space-y-4">
                  <h4 className="font-extrabold text-[#0B3B82] text-sm">💻 Encrypted Telehealth Evening Suite</h4>
                  <div className="space-y-2 text-xs">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100">
                        <span className="font-bold text-slate-700">{day}</span>
                        <span className="text-[#16A34A] font-semibold">07:30 PM – 09:30 PM (4 Slots)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PATIENT DOUBTS (Q&A) ==================== */}
          {activeSection === 'qa' && (
            <DoctorQaSection
              threads={qaThreads}
              doctor={doctor}
              onNotify={showDoctorToast}
            />
          )}

          {/* ==================== G. CLINICIAN PROFILE ==================== */}
          {activeSection === 'profile' && (
            <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-[#0B3B82] text-white text-2xl font-bold flex items-center justify-center">
                  {doctor.name.charAt(4)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#0B3B82]">{doctor.name}</h3>
                  <p className="text-xs text-slate-500">{doctor.specialty} • {doctor.experience} Experience</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Tamil Nadu Medical Council Reg: {doctor.regNo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Practice Location</p>
                  <p className="font-extrabold text-slate-800 mt-1">{doctor.clinic}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Encrypted Doctor Mail</p>
                  <p className="font-extrabold text-slate-800 mt-1">{doctor.email}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== WRITE DIGITAL RX MODAL ==================== */}
      {isNewRxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-emerald-300 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#16A34A]" />
                <h3 className="font-extrabold text-[#0B3B82] text-base">Issue Certified Tele-Prescription</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRxModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueRx} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={newRxPatient}
                  onChange={(e) => setNewRxPatient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Suresh Kumar">Suresh Kumar (PT-9410)</option>
                  <option value="Anonymous Patient #812">Anonymous Patient #812 (PT-9418)</option>
                  <option value="Karthik Raja">Karthik Raja (PT-9422)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formulation Name</label>
                <select
                  value={newRxMedicine}
                  onChange={(e) => setNewRxMedicine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none"
                >
                  <option value="Tadalafil Daily Care 5mg">Tadalafil Daily Care 5mg (PDE-5 Vitality)</option>
                  <option value="Nayacura Pro-Delay Care Spray">Nayacura Pro-Delay Care Spray (Lidocaine Calibration)</option>
                  <option value="Pure Himalayan Shilajit Gold Grade">Pure Himalayan Shilajit Gold Grade (Testosterone Support)</option>
                  <option value="Sildenafil Citrate 50mg">Sildenafil Citrate 50mg (On-Demand)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage & Frequency</label>
                  <input
                    type="text"
                    value={newRxDosage}
                    onChange={(e) => setNewRxDosage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newRxDuration}
                    onChange={(e) => setNewRxDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={newRxNotes}
                  onChange={(e) => setNewRxNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Digitally signed via MCI Certificate • Reg: TN-MED-44819. Dispatches in 100% plain box.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition shadow-xs"
                >
                  Sign & Issue Tele-Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PATIENT FULL EMR VIEWER MODAL ==================== */}
      {selectedPatientRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-[#0B3B82]" />
                <h3 className="font-extrabold text-[#0B3B82] text-base">
                  Electronic Medical Record — {selectedPatientRecord.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block">Patient ID:</span>
                  <span className="font-extrabold text-[#0B3B82]">{selectedPatientRecord.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Age & Gender:</span>
                  <span className="font-extrabold text-slate-800">{selectedPatientRecord.age} Yrs / {selectedPatientRecord.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Pressure:</span>
                  <span className="font-extrabold text-emerald-700">{selectedPatientRecord.vitals?.bp || '120/80 mmHg'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">Clinical History & Presentation:</h4>
                <p className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-700 mt-1">
                  {selectedPatientRecord.history}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">Chief Complaint:</h4>
                <p className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-700 mt-1">
                  {selectedPatientRecord.chiefComplaint}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">NABL Verified Pathology Panel:</h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-1">
                  <div className="flex justify-between font-medium">
                    <span>7-Panel STI Multiplex:</span>
                    <span className="font-bold text-emerald-700">NON-REACTIVE (Negative)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Serum Testosterone:</span>
                    <span className="font-bold text-[#0B3B82]">624 ng/dL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">256-Bit HIPAA Encrypted Consultation Room</span>
              <button
                type="button"
                onClick={() => setSelectedPatientRecord(null)}
                className="px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {isCallOpen && (
        <VideoCallRoom
          roomCode={roomCode}
          role="doctor"
          selfName={doctor.name}
          peerName={waitingPatient?.name || 'Patient'}
          onClose={() => setIsCallOpen(false)}
        />
      )}

    </div>
  );
}