import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import PatientCalendar from '../components/PatientCalendar';
import VideoCallRoom from '../components/VideoCallRoom';
import useVideoRoom from '../hooks/useVideoRoom';
import { roomCodeFor } from '../lib/videoRoom';
import { formatDayLabel, formatShortDate, isSameDay, parseAppointmentDate, TODAY, TOMORROW } from '../lib/appointmentDates';
import {
  ShieldCheck,
  Lock,
  Calendar,
  Video,
  FileText,
  Package,
  Bot,
  EyeOff,
  Download,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Phone,
  Mail,
  LogOut,
  FlaskConical,
  Pill,
  LayoutDashboard,
  CreditCard,
  UserRound,
  Menu,
  X,
  Bell,
  Headphones,
  Building,
} from 'lucide-react';

const SECTION_TITLES = {
  overview: 'Dashboard Overview',
  appointments: 'My Appointments',
  video: 'Video Consultation',
  prescriptions: 'Prescriptions',
  'lab-reports': 'Lab Reports',
  orders: 'My Orders',
  payments: 'Payments',
  profile: 'My Profile',
  privacy: 'Privacy & Security',
  notifications: 'Notifications',
};

const statusTone = (status = '') => {
  if (/pending/i.test(status)) return 'bg-amber-50 text-amber-700';
  if (/cancel/i.test(status)) return 'bg-red-50 text-red-600';
  if (/completed/i.test(status)) return 'bg-slate-100 text-slate-600';
  return 'bg-emerald-50 text-[#128D28]';
};

function SectionIntro({ title, copy, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3B82]">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#526987]">{copy}</p>
      </div>
      {action}
    </div>
  );
}

export default function PatientDashboardPage({
  user,
  onLogout,
  appointments = [],
  storeOrders = [],
  onOpenTracking,
  onOpenBookingSchedule,
}) {
  const navigate = useNavigate();

  // The sidebar is URL driven: every item below renders its own page.
  const { section } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/dashboard') ? '/dashboard' : '/patient-dashboard';
  const activeSection = section && SECTION_TITLES[section] ? section : 'overview';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => TODAY);

  // Stealth / Camouflage Mode State
  const [isStealthMode, setIsStealthMode] = useState(false);

  // Anonymous Alias State
  const [useAnonymousAlias, setUseAnonymousAlias] = useState(false);

  // Modal States for Prescriptions and Lab Reports
  const [selectedRx, setSelectedRx] = useState(null);
  const [selectedLabReport, setSelectedLabReport] = useState(null);

  // 1-Click Refill Toast State
  const [refillToast, setRefillToast] = useState(null);

  // Live video room state
  const [callAppointment, setCallAppointment] = useState(null);

  // Fallback profile for a signed-out visitor — no seeded demo identity.
  const patientProfile = user || {
    name: 'Patient',
    phone: '',
    email: '',
    id: '',
    city: '',
    joinedDate: '',
  };

  const displayName = useAnonymousAlias ? 'Private Patient' : patientProfile.name;
  const firstName = displayName.split(' ')[0] || 'Patient';
  const avatarLetter = firstName.charAt(0).toUpperCase();

  const dashboardPath = (key) => (key === 'overview' ? basePath : `${basePath}/${key}`);

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'appointments', label: 'My Appointments', icon: Calendar },
    { key: 'video', label: 'Video Consultation', icon: Video },
    { key: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { key: 'lab-reports', label: 'Lab Reports', icon: FlaskConical },
    { key: 'orders', label: 'My Orders', icon: Package },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  const accountItems = [
    { key: 'profile', label: 'My Profile', icon: UserRound },
    { key: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
  ];

  // Prescriptions appear only after a clinician issues one for this account.
  const [prescriptions] = useState([]);

  // Lab reports appear once a booked test has been processed for this account.
  const [labReports] = useState([]);

  // Bookings always come from this account's own state.

  const allBookings = appointments;
  // Lab pickups are pushed into the same appointments array, so keep them apart.
  const consultations = allBookings
    .filter((booking) => booking.doctorName)
    .map((booking) => ({ ...booking, dateObj: parseAppointmentDate(booking) }))
    .sort((a, b) => {
      if (a.dateObj && b.dateObj) return a.dateObj - b.dateObj;
      if (a.dateObj) return -1;
      if (b.dateObj) return 1;
      return 0;
    });
  const labPickups = allBookings.filter((booking) => !booking.doctorName && booking.packageName);
  const markedDates = consultations.map((booking) => booking.dateObj).filter(Boolean);
  const appointmentsOnSelected = selectedDate
    ? consultations.filter((booking) => booking.dateObj && isSameDay(booking.dateObj, selectedDate))
    : [];
  const nextConsultation = consultations.find((booking) => booking.dateObj && booking.dateObj >= TODAY)
    || consultations[0]
    || null;
  const primaryRoomCode = roomCodeFor(nextConsultation?.doctorName || 'Nayacura Consultation');
  const { room: primaryRoom, doctorPresent: primaryDoctorPresent } = useVideoRoom(primaryRoomCode);
  const isPrimaryRoomCompleted = primaryRoom?.status === 'completed';
  const appointmentStatus = (appointment) => (
    roomCodeFor(appointment?.doctorName) === primaryRoomCode && isPrimaryRoomCompleted
      ? 'Completed'
      : appointment?.status || 'Scheduled'
  );
  const doctorJoinedAt = primaryRoom?.doctor?.joinedAt || null;
  const [dismissedDoctorJoin, setDismissedDoctorJoin] = useState(null);
  // Notify the patient whenever the doctor is in the room and they are not in the call.
  const showDoctorRoomToast = Boolean(doctorJoinedAt) && !callAppointment && dismissedDoctorJoin !== doctorJoinedAt;
  const paymentRows = consultations.map((booking) => ({
    id: booking.id,
    date: booking.dateObj ? formatDayLabel(booking.dateObj) : booking.day || '—',
    doctor: booking.doctorName,
    amount: booking.fee || 0,
    status: booking.status || 'Scheduled',
  }));
  const consultationValue = paymentRows.reduce((total, row) => total + Number(row.amount || 0), 0);

  // 1-Click Refill Simulator
  const handleRefillClick = (medicine) => {
    setRefillToast(`Added "${medicine.name}" to your 100% plain box delivery bag!`);
    setTimeout(() => setRefillToast(null), 3500);
  };

  // Stealth Camouflage View
  if (isStealthMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Stealth Privacy Mode Active</h2>
          <p className="mt-2 text-xs text-slate-400">
            Your patient dashboard is hidden from screen onlookers. All confidential medical data remains securely encrypted in background memory.
          </p>
          <button
            type="button"
            onClick={() => setIsStealthMode(false)}
            className="mt-6 w-full py-3 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition"
          >
            Resume Confidential Session
          </button>
          <Link to="/" className="mt-3 block text-xs text-slate-400 hover:text-white">← Exit to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F9FF] text-[#0B234D]">
      {sidebarOpen && <button type="button" aria-label="Close dashboard menu" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" />}
      <aside className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-[#E1E7EF] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:w-[300px] lg:shrink-0 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[74px] items-center justify-between border-b border-[#E1E7EF] px-6">
          <Link to="/" aria-label="Nayacura home"><img src="/logo.png" alt="Nayacura" className="h-10 sm:h-14 w-auto object-contain" /></Link>
          <button type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav aria-label="Patient dashboard" className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Patient portal</p>
          <div className="space-y-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                to={dashboardPath(key)}
                onClick={() => setSidebarOpen(false)}
                aria-current={activeSection === key ? 'page' : undefined}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${activeSection === key ? 'bg-[#0B3B82] text-white shadow-sm' : 'text-[#14213D] hover:bg-[#F0F6FF]'}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{label}
              </Link>
            ))}
            <Link
              to="/ai"
              onClick={() => setSidebarOpen(false)}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold text-[#14213D] transition-colors hover:bg-[#F0F6FF]"
            >
              <Bot className="h-5 w-5 shrink-0" aria-hidden="true" />Naya AI Chats
            </Link>
          </div>
          <div className="my-5 border-t border-[#E1E7EF]" />
          <p className="mb-3 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Account</p>
          <div className="space-y-1">
            {accountItems.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                to={dashboardPath(key)}
                onClick={() => setSidebarOpen(false)}
                aria-current={activeSection === key ? 'page' : undefined}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${activeSection === key ? 'bg-[#0B3B82] text-white shadow-sm' : 'hover:bg-[#F0F6FF]'}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setSidebarOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold hover:bg-[#F0F6FF]"><Headphones className="h-5 w-5" />Help &amp; Support</Link>
            <a href="mailto:support@nayacura.com" className="mx-2 mb-2 flex items-center gap-2 rounded-xl border border-[#DCE7F6] bg-[#F8FBFF] px-3 py-2 text-[11px] font-bold text-[#0B3B82] hover:border-[#16A34A] transition">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
              <span className="truncate">support@nayacura.com</span>
            </a>
            <button type="button" onClick={() => { onLogout?.(); navigate('/login'); }} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-5 w-5" />Logout</button>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#E1E7EF] bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button type="button" aria-label="Open dashboard menu" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu className="h-6 w-6" /></button>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Patient Portal</p>
              <h2 className="truncate text-lg font-extrabold text-[#0B3B82] sm:text-2xl">{SECTION_TITLES[activeSection]}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to={dashboardPath('notifications')} aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-[#F0F6FF]"><Bell className="h-5 w-5" /></Link>
            <span className="hidden h-7 w-px bg-[#E1E7EF] sm:block" />
            {/* Round Avatar Icon with Dropdown Menu & Sign Out */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#16A34A] font-bold text-white text-sm hover:ring-2 hover:ring-[#0B3B82] hover:ring-offset-2 transition cursor-pointer shadow-xs"
                aria-label="Patient Account Menu"
                title="Account Menu & Sign Out"
              >
                {avatarLetter}
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
                      <p className="font-extrabold text-[#0B3B82] text-sm truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{patientProfile.email || 'Confidential Patient'}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          {patientProfile.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B3B82]">
                          Patient Portal
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
                          navigate(dashboardPath('profile'));
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium text-left transition"
                      >
                        <UserRound className="h-4 w-4 text-[#0B3B82]" />
                        <span>My Profile & Settings</span>
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
                        <span>Quick Stealth Camouflage</span>
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
            <span className="hidden max-w-36 truncate text-sm font-bold text-slate-700 sm:block">{displayName}</span>
          </div>
        </header>

        {/* 1-Click Refill Notification Toast */}
        {refillToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0B3B82] text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
            <Package className="h-5 w-5 text-emerald-400" />
            <span>{refillToast}</span>
            <button
              type="button"
              onClick={() => navigate('/wellness-store')}
              className="ml-2 px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[11px] hover:bg-[#15803D]"
            >
              View Bag →
            </button>
          </div>
        )}

        {/* Doctor joined the secure room — live presence notification */}
        {showDoctorRoomToast && nextConsultation && (
          <div className="fixed bottom-6 right-6 z-40 w-[min(92vw,340px)] rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#128D28]"><Video className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0B3B82]">{primaryRoom?.doctor?.name || nextConsultation.doctorName} joined the room</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#526987]">Your doctor is waiting in the secure video room. Join now to start the consultation.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setCallAppointment(nextConsultation); setDismissedDoctorJoin(doctorJoinedAt); }} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white hover:bg-[#082B5E]">Join Room</button>
                  <button type="button" onClick={() => setDismissedDoctorJoin(doctorJoinedAt)} className="rounded-lg border border-[#DCE7F6] px-3 py-2 text-xs font-bold text-[#526987]">Later</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTAINER */}
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          {activeSection === 'overview' && (
            <>
              <section className="relative mb-5 overflow-hidden rounded-2xl border border-[#DCE7F6] bg-white p-6 shadow-sm sm:p-8">
                <svg className="pointer-events-none absolute bottom-0 right-0 h-24 w-3/5 opacity-80 sm:h-32" viewBox="0 0 800 150" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 150 C160 45 260 50 400 125 C555 175 670 35 800 70 L800 150 Z" fill="#DDF7DD" />
                  <path d="M0 150 C180 72 280 86 430 135 C570 178 670 80 800 105 L800 150 Z" fill="#9FEA93" />
                  <path d="M130 150 C290 90 360 128 480 150 Z" fill="#50CC47" />
                </svg>
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3B82] sm:text-3xl">Welcome back, <span className="text-[#128D28]">{displayName}</span></h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#334B73]">Manage your consultations, prescriptions, tests and wellness care in one place.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={onOpenBookingSchedule} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E]"><Calendar className="h-4 w-4" />Book Appointment</button>
                    <Link to="/ai" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16A34A] bg-emerald-50 px-5 py-2 text-sm font-bold text-[#128D28] hover:bg-emerald-100"><Bot className="h-4 w-4" />Ask Naya AI</Link>
                  </div>
                </div>
              </section>

              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
                {[
                  { key: 'appointments', label: 'Appointments', count: consultations.length, note: 'Consultations', icon: Calendar, tone: 'bg-blue-50 text-[#0B3B82]' },
                  { key: 'prescriptions', label: 'Prescriptions', count: prescriptions.length, note: 'Medical slips', icon: FileText, tone: 'bg-emerald-50 text-[#128D28]' },
                  { key: 'lab-reports', label: 'Lab Reports', count: labReports.length, note: 'Test results', icon: FlaskConical, tone: 'bg-purple-50 text-purple-700' },
                  { key: 'orders', label: 'My Orders', count: storeOrders.length, note: 'Store orders', icon: Package, tone: 'bg-amber-50 text-amber-700' },
                ].map(({ key, label, count, note, icon: Icon, tone }) => (
                  <Link key={key} to={dashboardPath(key)} className="flex min-h-28 items-center gap-3 rounded-2xl border border-[#DCE7F6] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#16A34A] sm:p-5">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase leading-tight tracking-wide text-[#31466A] sm:text-xs">{label}</span><span className="block text-2xl font-extrabold text-[#0B3B82]">{count}</span><span className="block truncate text-xs text-[#526987]">{note}</span></span>
                    <ChevronRight className="hidden h-4 w-4 text-[#0B3B82] sm:block" />
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <section id="consultation-card" className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EF] pb-3"><h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><Calendar className="h-5 w-5" />{nextConsultation && appointmentStatus(nextConsultation) === 'Completed' ? 'Last Consultation' : 'Upcoming Consultation'}</h3>{nextConsultation && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#128D28]">{appointmentStatus(nextConsultation)}</span>
                )}</div>
                  {nextConsultation ? <>
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 font-extrabold text-[#0B3B82]">{nextConsultation.doctorName?.charAt(0) || 'D'}</span><div><p className="font-bold text-[#14213D]">{nextConsultation.doctorName}</p><p className="text-xs text-[#526987]">{nextConsultation.doctorSpecialty}</p><p className="mt-1 text-xs text-[#0B3B82]">{nextConsultation.clinicName}</p></div></div>
                      <div className="text-sm font-semibold text-[#31466A]"><p>{nextConsultation.dateObj ? formatDayLabel(nextConsultation.dateObj) : nextConsultation.day}</p><p className="mt-1">{nextConsultation.timeSlot}</p></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E1E7EF] pt-3"><span className="text-xs text-[#526987]">{nextConsultation.type === 'video' ? 'Video consultation' : 'In-clinic consultation'}</span><div className="flex flex-wrap gap-2">{nextConsultation.type === 'video' && <button type="button" onClick={() => setCallAppointment(nextConsultation)} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white">Join Video Call</button>}<Link to={dashboardPath('appointments')} className="rounded-lg border border-[#9AB5DF] px-3 py-2 text-xs font-bold text-[#0B3B82]">Manage Visit →</Link></div></div>
                  </> : <p className="py-5 text-sm text-[#526987]">No appointments yet.</p>}
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EF] pb-3"><h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><FlaskConical className="h-5 w-5 text-purple-700" />Latest Lab Diagnostics</h3>{labReports[0] && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#128D28]">{labReports[0].status}</span>}</div>
                  {labReports[0] ? <><h4 className="mt-4 text-sm font-bold text-[#14213D]">{labReports[0].title}</h4><p className="mt-2 text-xs leading-relaxed text-[#526987]">{labReports[0].summary}</p><button type="button" onClick={() => setSelectedLabReport(labReports[0])} className="mt-4 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-800">View Full Report</button></> : <p className="py-5 text-sm text-[#526987]">No lab reports yet.</p>}
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EF] pb-3"><h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><FileText className="h-5 w-5 text-[#128D28]" />Active Prescription</h3><span className="text-xs text-[#526987]">{prescriptions[0]?.date}</span></div>
                  {prescriptions[0] ? <><h4 className="mt-4 text-sm font-bold text-[#14213D]">{prescriptions[0].diagnosis}</h4><p className="mt-1 text-xs text-[#526987]">By {prescriptions[0].doctor}</p><button type="button" onClick={() => setSelectedRx(prescriptions[0])} className="mt-4 text-xs font-bold text-[#0B3B82] hover:underline">View Prescription →</button></> : <p className="py-5 text-sm text-[#526987]">No prescriptions yet.</p>}
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#E1E7EF] pb-3"><h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><Package className="h-5 w-5 text-[#128D28]" />My Orders</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#128D28]">{storeOrders.length} orders</span></div>
                  {storeOrders.length ? <><p className="mt-4 text-sm font-bold text-[#14213D]">{storeOrders[0].productName || storeOrders[0].name || 'Wellness store order'}</p><p className="mt-1 text-xs text-[#526987]">Check delivery details for your order.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onOpenTracking} className="rounded-lg border border-[#16A34A] px-3 py-2 text-xs font-bold text-[#128D28]">Track Package →</button><Link to={dashboardPath('orders')} className="rounded-lg border border-[#9AB5DF] px-3 py-2 text-xs font-bold text-[#0B3B82]">All Orders →</Link></div></> : <><p className="mt-4 text-sm text-[#526987]">You have no store orders yet.</p><Link to="/wellness-store" className="mt-4 inline-flex rounded-lg border border-[#16A34A] px-3 py-2 text-xs font-bold text-[#128D28]">Browse Store →</Link></>}
                </section>
              </div>
            </>
          )}

          {activeSection === 'appointments' && (
            <div className="space-y-5">
              <SectionIntro
                title="My Appointments"
                copy="Every booked consultation is marked with a green dot on the calendar. Pick a date to see that day's visit details."
                action={<button type="button" onClick={onOpenBookingSchedule} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E]"><Calendar className="h-4 w-4" />Book Appointment</button>}
              />

              <div className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <PatientCalendar markedDates={markedDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E1E7EF] pb-3">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]">
                      <Calendar className="h-5 w-5" />
                      {selectedDate ? formatDayLabel(selectedDate) : 'Select a date'}
                    </h3>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#128D28]">
                      {appointmentsOnSelected.length} appointment{appointmentsOnSelected.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {appointmentsOnSelected.length ? (
                    <div className="mt-4 space-y-3">
                      {appointmentsOnSelected.map((appointment) => (
                        <article key={appointment.id} className="rounded-xl border border-[#E1E7EF] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 font-extrabold text-[#0B3B82]">{appointment.doctorName?.charAt(0) || 'D'}</span>
                              <div>
                                <p className="text-sm font-bold text-[#14213D]">{appointment.doctorName}</p>
                                <p className="text-xs text-[#526987]">{appointment.doctorSpecialty}</p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#31466A]"><Clock className="h-3.5 w-3.5" />{appointment.timeSlot}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(appointmentStatus(appointment))}`}>{appointmentStatus(appointment)}</span>
                              <p className="mt-1 text-xs font-bold text-[#0B3B82]">₹{appointment.fee || 0}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E1E7EF] pt-3">
                            <span className="inline-flex items-center gap-1 text-xs text-[#526987]"><MapPin className="h-3.5 w-3.5" />{appointment.type === 'video' ? 'Secure video room' : appointment.clinicName || appointment.clinicAddress}</span>
                            {appointment.type === 'video' ? (
                              <button type="button" onClick={() => setCallAppointment(appointment)} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white">Join Video Call</button>
                            ) : (
                              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#0B3B82]">In-clinic visit</span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-dashed border-[#DCE7F6] bg-[#F8FBFF] p-6 text-center">
                      <Calendar className="mx-auto h-6 w-6 text-[#9AB5DF]" />
                      <p className="mt-2 text-sm font-semibold text-[#31466A]">No appointment on this date</p>
                      <p className="mt-1 text-xs text-[#526987]">Dates with a green dot already have a booking. Use Book Appointment to add one.</p>
                    </div>
                  )}
                </section>
              </div>

              <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-[#E1E7EF] pb-3">
                  <h3 className="text-base font-extrabold text-[#0B3B82]">All Consultations ({consultations.length})</h3>
                  <Link to={dashboardPath('video')} className="text-xs font-bold text-[#0B3B82] hover:underline">Video visits →</Link>
                </div>
                {consultations.length ? (
                  <div className="mt-4 grid gap-3">
                    {consultations.map((appointment) => (
                      <div key={appointment.id} className="flex flex-col gap-3 rounded-xl border border-[#E1E7EF] p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#0B3B82]">{appointment.doctorName}</p>
                          <p className="mt-0.5 text-[#526987]">{appointment.doctorSpecialty} • {appointment.clinicName || appointment.clinicAddress}</p>
                          <p className="mt-1 font-semibold text-[#31466A]">
                            {formatShortDate(appointment.dateObj) || appointment.day} at {appointment.timeSlot}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(appointmentStatus(appointment))}`}>{appointmentStatus(appointment)}</span>
                          {appointment.type === 'video' ? (
                            <button type="button" onClick={() => setCallAppointment(appointment)} className="rounded-lg bg-[#0B3B82] px-3 py-1.5 text-[11px] font-bold text-white">Join Video Call</button>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-[#15803D]">In-Clinic</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-4 text-sm text-[#526987]">No consultations booked yet.</p>}
              </section>
            </div>
          )}

          {activeSection === 'video' && (
            <div className="space-y-5">
              <SectionIntro
                title="Video Consultation"
                copy="Your secure room is ready. Join here — the doctor is notified the moment you enter, and the call starts when both of you are inside."
                action={(
                  <button
                    type="button"
                    onClick={() => nextConsultation && setCallAppointment(nextConsultation)}
                    disabled={!nextConsultation}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Video className="h-4 w-4" />Join Room
                  </button>
                )}
              />

              {consultations.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {consultations.map((appointment) => {
                    const code = roomCodeFor(appointment.doctorName);
                    const completed = appointmentStatus(appointment) === 'Completed';
                    const doctorWaiting = code === primaryRoomCode && primaryDoctorPresent;
                    return (
                      <section key={appointment.id} className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 font-extrabold text-[#0B3B82]">{appointment.doctorName?.charAt(0) || 'D'}</span>
                            <div>
                              <p className="text-sm font-bold text-[#14213D]">{appointment.doctorName}</p>
                              <p className="text-xs text-[#526987]">{appointment.doctorSpecialty}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(appointmentStatus(appointment))}`}>{appointmentStatus(appointment)}</span>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F8FBFF] p-3 text-xs text-[#31466A]">
                          <p className="flex items-center gap-1.5 font-semibold"><Calendar className="h-3.5 w-3.5" />{formatDayLabel(appointment.dateObj) || appointment.day}</p>
                          <p className="mt-1 flex items-center gap-1.5 font-semibold"><Clock className="h-3.5 w-3.5" />{appointment.timeSlot} · Asia/Kolkata</p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#E1E7EF] px-3 py-2 text-[11px] font-semibold">
                          <span className="inline-flex items-center gap-1.5 text-[#31466A]">
                            <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-emerald-500' : doctorWaiting ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            {completed ? 'Consultation completed' : doctorWaiting ? 'Doctor is in the room' : 'Room ready · doctor will be notified'}
                          </span>
                          <span className="text-[#526987]">#{code}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => { setDismissedDoctorJoin(doctorJoinedAt); setCallAppointment(appointment); }}
                          className="mt-4 w-full rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#082B5E]"
                        >
                          {completed ? 'Rejoin Room' : 'Join Room'}
                        </button>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <section className="rounded-2xl border border-dashed border-[#DCE7F6] bg-white p-8 text-center shadow-sm">
                  <Video className="mx-auto h-7 w-7 text-[#9AB5DF]" />
                  <p className="mt-3 text-base font-bold text-[#0B3B82]">No consultations booked yet</p>
                  <p className="mt-1 text-sm text-[#526987]">Book an appointment and its secure room appears here instantly.</p>
                  <button type="button" onClick={onOpenBookingSchedule} className="mt-4 rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#082B5E]">Book Appointment</button>
                </section>
              )}

              <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><ShieldCheck className="h-5 w-5 text-[#16A34A]" />Before you join</h3>
                <ul className="mt-3 grid gap-2 text-sm text-[#31466A] sm:grid-cols-2">
                  <li className="rounded-xl bg-[#F8FBFF] p-3">Use headphones and sit in a private room.</li>
                  <li className="rounded-xl bg-[#F8FBFF] p-3">Joining notifies your doctor that you are waiting.</li>
                  <li className="rounded-xl bg-[#F8FBFF] p-3">If the doctor joins first, you get a notification here.</li>
                  <li className="rounded-xl bg-[#F8FBFF] p-3">The call connects automatically when both are inside.</li>
                </ul>
              </section>
            </div>
          )}

          {activeSection === 'prescriptions' && (
            <div className="space-y-5">
              <SectionIntro
                title="Prescriptions"
                copy="Digitally signed prescriptions from your Nayacura clinicians. Download or print any slip for your records."
                action={<button type="button" onClick={() => navigate('/wellness-store')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16A34A] bg-emerald-50 px-5 py-2 text-sm font-bold text-[#128D28] hover:bg-emerald-100"><Pill className="h-4 w-4" />Order medicines</button>}
              />
              <div className="grid gap-4 xl:grid-cols-2">
                {prescriptions.length === 0 && (
                  <div className="rounded-2xl border border-[#DCE7F6] bg-white p-8 text-center shadow-sm xl:col-span-2">
                    <FileText className="mx-auto h-8 w-8 text-[#94A3B8]" />
                    <p className="mt-3 text-base font-bold text-[#0B3B82]">No prescriptions yet</p>
                    <p className="mt-1 text-sm text-[#526987]">Prescriptions issued after a consultation will appear here.</p>
                  </div>
                )}
                {prescriptions.map((rx) => (
                  <article key={rx.id} className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-extrabold text-[#128D28]">Rx</span>
                        <div>
                          <p className="text-sm font-bold text-[#14213D]">{rx.doctor}</p>
                          <p className="text-xs text-[#526987]">{rx.specialty}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-[#128D28]">{rx.date}</span>
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#0B3B82]">{rx.diagnosis}</p>
                    <p className="mt-1 text-xs text-[#526987]">{rx.medicines.length} medicine{rx.medicines.length === 1 ? '' : 's'} · valid till {rx.validTill}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setSelectedRx(rx)} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white">View Slip</button>
                      <button type="button" onClick={() => handleRefillClick(rx.medicines[0])} className="inline-flex items-center gap-1.5 rounded-lg border border-[#16A34A] px-3 py-2 text-xs font-bold text-[#128D28]"><RefreshCw className="h-3.5 w-3.5" />1-Click Refill</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'lab-reports' && (
            <div className="space-y-5">
              <SectionIntro
                title="Lab Reports"
                copy="Confidential pathology and biomarker reports. Reports stay private to your account."
                action={<Link to="/lab-tests" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E]"><FlaskConical className="h-4 w-4" />Book a test</Link>}
              />
              <div className="grid gap-3">
                {labReports.length === 0 && (
                  <div className="rounded-2xl border border-[#DCE7F6] bg-white p-8 text-center shadow-sm">
                    <FlaskConical className="mx-auto h-8 w-8 text-[#94A3B8]" />
                    <p className="mt-3 text-base font-bold text-[#0B3B82]">No lab reports yet</p>
                    <p className="mt-1 text-sm text-[#526987]">Book a confidential test and your verified reports will appear here.</p>
                  </div>
                )}
                {labReports.map((report) => (
                  <article key={report.id} className="flex flex-col gap-3 rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#0B3B82]">{report.title}</p>
                      <p className="mt-1 text-xs text-[#526987]">{report.sampleDate} · {report.parameters.length} parameters · {report.labPartner}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(report.status)}`}>{report.status}</span>
                      <button type="button" onClick={() => setSelectedLabReport(report)} className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white">View Breakdown</button>
                    </div>
                  </article>
                ))}
              </div>

              {labPickups.length > 0 && (
                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#0B3B82]">Scheduled Sample Pickups</h3>
                  <div className="mt-3 space-y-2">
                    {labPickups.map((pickup) => (
                      <div key={pickup.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E1E7EF] p-3 text-xs">
                        <span className="font-bold text-[#0B3B82]">{pickup.packageName}</span>
                        <span className="text-[#526987]">{pickup.date} · {pickup.slot || 'Slot to be confirmed'}</span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-[#0B3B82]">{pickup.status}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-5">
              <SectionIntro
                title="My Orders"
                copy="Wellness store orders are delivered in unbranded, plain packaging. Track every shipment here."
                action={<Link to="/wellness-store" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E]"><Package className="h-4 w-4" />Browse Store</Link>}
              />
              {storeOrders.length ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {storeOrders.map((order) => (
                    <article key={order.id} className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#0B3B82]">{order.productName || order.name || order.lines?.[0]?.product?.title || 'Wellness store order'}</p>
                          <p className="mt-1 text-xs text-[#526987]">Order {order.id} · {order.count || order.lines?.length || 1} item(s)</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(order.status)}`}>{order.status || 'Processing'}</span>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div><dt className="text-[#526987]">Total</dt><dd className="mt-0.5 font-bold text-[#14213D]">₹{order.total ?? order.subtotal ?? 0}</dd></div>
                        <div><dt className="text-[#526987]">Estimated delivery</dt><dd className="mt-0.5 font-semibold text-[#14213D]">{order.estimatedDelivery || 'Updating'}</dd></div>
                      </dl>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E1E7EF] pt-3">
                        <span className="text-[11px] font-semibold text-[#526987]">{order.trackingNumber ? `AWB ${order.trackingNumber}` : 'Tracking number pending'}</span>
                        <button type="button" onClick={() => onOpenTracking?.(order.id)} className="rounded-lg border border-[#16A34A] px-3 py-2 text-xs font-bold text-[#128D28]">Track Package →</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <section className="rounded-2xl border border-dashed border-[#DCE7F6] bg-white p-8 text-center shadow-sm">
                  <Package className="mx-auto h-7 w-7 text-[#9AB5DF]" />
                  <p className="mt-3 text-base font-bold text-[#0B3B82]">No orders yet</p>
                  <p className="mt-1 text-sm text-[#526987]">Doctor-approved products arrive in 100% plain packaging.</p>
                  <Link to="/wellness-store" className="mt-4 inline-flex rounded-xl bg-[#0B3B82] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#082B5E]">Browse Store</Link>
                </section>
              )}
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-5">
              <SectionIntro title="Payments" copy="Consultation charges and payment status for this account." />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#526987]">Consultations</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0B3B82]">{paymentRows.length}</p>
                </div>
                <div className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#526987]">Consultation value</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#0B3B82]">₹{consultationValue}</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm lg:col-span-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#526987]">Payment mode</p>
                  <p className="mt-1 text-sm font-bold text-[#14213D]">Pay at clinic / secure online link</p>
                </div>
              </div>
              <section className="overflow-hidden rounded-2xl border border-[#DCE7F6] bg-white shadow-sm">
                <div className="border-b border-[#E1E7EF] p-5"><h3 className="text-base font-extrabold text-[#0B3B82]">Consultation charges</h3></div>
                {paymentRows.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FBFF] text-[#526987]">
                        <tr>
                          <th className="px-5 py-3 font-bold">Reference</th>
                          <th className="px-5 py-3 font-bold">Date</th>
                          <th className="px-5 py-3 font-bold">Clinician</th>
                          <th className="px-5 py-3 font-bold">Amount</th>
                          <th className="px-5 py-3 text-right font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEF3FA]">
                        {paymentRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-5 py-3 font-semibold text-[#0B3B82]">{row.id}</td>
                            <td className="px-5 py-3 text-[#526987]">{row.date}</td>
                            <td className="px-5 py-3 text-[#31466A]">{row.doctor}</td>
                            <td className="px-5 py-3 font-bold text-[#14213D]">₹{row.amount}</td>
                            <td className="px-5 py-3 text-right"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(row.status)}`}>{row.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="p-5 text-sm text-[#526987]">No payment records yet.</p>}
              </section>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-5">
              <SectionIntro title="My Profile" copy="Your identity stays private. Only your care team sees these details." />
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#E1E7EF] pb-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#16A34A] text-lg font-extrabold text-white">{avatarLetter}</span>
                    <div>
                      <p className="text-base font-bold text-[#0B3B82]">{displayName}</p>
                      <p className="text-xs text-[#526987]">Patient ID {patientProfile.id || 'NC-PAT-4921'}</p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#526987]"><Mail className="h-4 w-4" />Email</dt><dd className="font-semibold text-[#14213D]">{patientProfile.email || 'Not provided'}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#526987]"><Phone className="h-4 w-4" />Phone</dt><dd className="font-semibold text-[#14213D]">{patientProfile.phone || 'Not provided'}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#526987]"><MapPin className="h-4 w-4" />City</dt><dd className="font-semibold text-[#14213D]">{patientProfile.city || 'Chennai'}</dd></div>
                    <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-2 text-[#526987]"><Calendar className="h-4 w-4" />Member since</dt><dd className="font-semibold text-[#14213D]">{patientProfile.joinedDate || 'November 2026'}</dd></div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <h3 className="text-base font-extrabold text-[#0B3B82]">Display preferences</h3>
                  <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-[#E1E7EF] p-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#0B3B82]"><EyeOff className="h-4 w-4 text-[#16A34A]" />Anonymous alias</p>
                      <p className="mt-1 text-xs text-[#526987]">Show "Private Patient #4921" instead of your real name.</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useAnonymousAlias}
                      aria-label="Anonymous alias mode"
                      onClick={() => setUseAnonymousAlias(!useAnonymousAlias)}
                      className={`toggle-switch relative h-6 w-12 shrink-0 rounded-full transition-colors flex items-center ${useAnonymousAlias ? 'bg-[#16A34A]' : 'bg-slate-300'}`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${useAnonymousAlias ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-[#E1E7EF] p-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-[#0B3B82]"><Lock className="h-4 w-4 text-[#0B3B82]" />Stealth mode</p>
                      <p className="mt-1 text-xs text-[#526987]">Blur the whole dashboard when someone is nearby.</p>
                    </div>
                    <button type="button" onClick={() => setIsStealthMode(true)} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white">Enable</button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-5">
              <SectionIntro title="Privacy & Security" copy="Nayacura keeps sexual health records encrypted and hidden from onlookers." />
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><ShieldCheck className="h-5 w-5 text-[#16A34A]" />Anonymous Patient Alias</h3>
                  <p className="mt-2 text-sm text-[#526987]">Replace your name with "Private Patient #4921" everywhere in the portal.</p>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F8FBFF] p-4">
                    <span className="text-sm font-semibold text-[#31466A]">{useAnonymousAlias ? 'Alias mode is on' : 'Alias mode is off'}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={useAnonymousAlias}
                      aria-label="Anonymous alias mode"
                      onClick={() => setUseAnonymousAlias(!useAnonymousAlias)}
                      className={`toggle-switch relative h-6 w-12 shrink-0 rounded-full transition-colors flex items-center ${useAnonymousAlias ? 'bg-[#16A34A]' : 'bg-slate-300'}`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${useAnonymousAlias ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-[#0B3B82]"><Lock className="h-5 w-5 text-[#0B3B82]" />Stealth Mode</h3>
                  <p className="mt-2 text-sm text-[#526987]">Instantly covers your dashboard with a privacy screen. Resume any time with one tap.</p>
                  <button type="button" onClick={() => setIsStealthMode(true)} className="mt-4 w-full rounded-xl bg-[#0B3B82] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#082B5E]">Enable Stealth Mode</button>
                </section>

                <section className="rounded-2xl border border-[#DCE7F6] bg-white p-5 shadow-sm xl:col-span-2">
                  <h3 className="text-base font-extrabold text-[#0B3B82]">How your data is protected</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-[#31466A] sm:grid-cols-2">
                    <li className="flex items-start gap-2 rounded-xl bg-[#F8FBFF] p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />Records encrypted at rest with a per-platform key.</li>
                    <li className="flex items-start gap-2 rounded-xl bg-[#F8FBFF] p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />No third-party ad tracking on portal pages.</li>
                    <li className="flex items-start gap-2 rounded-xl bg-[#F8FBFF] p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />Deliveries always ship in plain packaging.</li>
                    <li className="flex items-start gap-2 rounded-xl bg-[#F8FBFF] p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" /><span>You can request record deletion or report an issue via <a href="mailto:support@nayacura.com" className="font-bold text-[#0B3B82] hover:underline">support@nayacura.com</a>.</span></li>
                  </ul>
                </section>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <SectionIntro title="Notifications" copy="Appointment reminders and report updates appear here." />
              <section className="rounded-2xl border border-dashed border-[#DCE7F6] bg-white p-8 text-center shadow-sm">
                <Bell className="mx-auto h-7 w-7 text-[#9AB5DF]" />
                <p className="mt-3 text-base font-bold text-[#0B3B82]">No new notifications</p>
                <p className="mt-1 text-sm text-[#526987]">You will be notified here before every consultation.</p>
              </section>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: OFFICIAL E-PRESCRIPTION VIEWER */}
        {/* ========================================================================= */}
        {selectedRx && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-7 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold">Rx</span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3B82]">Nayacura Telehealth Prescription</h3>
                    <p className="text-xs text-slate-400">Prescription ID: {selectedRx.id}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedRx(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">✕</button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-[#0B3B82] text-sm">{selectedRx.doctor}</p>
                <p>{selectedRx.specialty}</p>
                <p>Prescribed to: <strong>{displayName}</strong> • Date: {selectedRx.date}</p>
                <p>Clinical Indication: <strong>{selectedRx.diagnosis}</strong></p>
              </div>

              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Formulations:</h4>
                {selectedRx.medicines.map((medicine, index) => (
                  <div key={index} className="p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B3B82]">{index + 1}. {medicine.name}</span>
                      <span className="text-emerald-700 font-semibold">{medicine.duration}</span>
                    </div>
                    <p className="text-slate-700 mt-1"><strong>Dosage:</strong> {medicine.dosage}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5"><em>Instructions:</em> {medicine.instructions}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-600 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                <strong>Clinical Advice:</strong> {selectedRx.clinicalNotes}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Digitally Verified & Encrypted</p>
                  <p className="font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Certified Medical Tele-Rx</p>
                </div>
                <button type="button" onClick={() => window.print?.()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#082b5e] transition">
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: LAB DIAGNOSTICS DETAILED BREAKDOWN */}
        {/* ========================================================================= */}
        {selectedLabReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-7 sm:p-8 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold"><FlaskConical className="h-4 w-4" /></span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0B3B82]">{selectedLabReport.title}</h3>
                    <p className="text-xs text-slate-400">Report ID: {selectedLabReport.id}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedLabReport(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">✕</button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between">
                <div>
                  <p>Patient: <strong>{displayName}</strong></p>
                  <p>Laboratory: {selectedLabReport.labPartner}</p>
                </div>
                <div className="text-right">
                  <p>Sample Date: {selectedLabReport.sampleDate}</p>
                  <p>Status: <strong className="text-emerald-700">{selectedLabReport.status}</strong></p>
                </div>
              </div>

              <div className="mt-5 border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Test Investigation</th>
                      <th className="p-3">Patient Value</th>
                      <th className="p-3">Biological Reference</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedLabReport.parameters.map((parameter, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-[#0B3B82]">{parameter.test}</td>
                        <td className="p-3 font-bold text-slate-800">{parameter.result}</td>
                        <td className="p-3 text-slate-500">{parameter.reference}</td>
                        <td className="p-3 text-right"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#15803D] text-[10px] font-bold">{parameter.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-xs text-emerald-900 border border-emerald-200">
                <strong>Pathology Summary:</strong> {selectedLabReport.summary}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">Verified by: <strong>{selectedLabReport.pathologist}</strong></span>
                <button type="button" onClick={() => window.print?.()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#082b5e] transition">
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download Encrypted PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {callAppointment && (
          <VideoCallRoom
            roomCode={roomCodeFor(callAppointment.doctorName)}
            role="patient"
            selfName={displayName}
            peerName={callAppointment.doctorName}
            appointment={callAppointment}
            onClose={() => setCallAppointment(null)}
          />
        )}
      </div>
    </div>
  );
}
