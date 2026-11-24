import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard,
  ShieldCheck, 
  Users, 
  Package, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Search, 
  FileCheck, 
  LogOut, 
  ChevronRight, 
  Eye, 
  X, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  UserRound,
  Menu,
  Building,
  RefreshCw,
  ShoppingBag,
  Settings,
  Phone,
  Mail,
  Lock,
  Database
} from 'lucide-react';

const SECTION_TITLES = {
  overview: 'Dashboard Overview',
  doctors: 'Clinician Credential Approvals',
  logistics: 'Plain-Box Courier Logistics',
  telehealth: 'Telehealth Traffic & Telemetry',
  security: 'HIPAA Compliance & Security',
  orders: 'Wellness Store Orders Ledger',
  settings: 'System Configuration'
};

export default function AdminDashboardPage({ user, onLogout }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [internalSection, setInternalSection] = useState(section || 'overview');
  const activeSection = (section && SECTION_TITLES[section]) ? section : internalSection;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedDoctorForReview, setSelectedDoctorForReview] = useState(null);
  const [adminToast, setAdminToast] = useState(null);

  const handleNavClick = (key) => {
    setInternalSection(key);
    navigate(key === 'overview' ? '/admin-dashboard' : `/admin-dashboard/${key}`);
    setSidebarOpen(false);
  };

  // Doctors awaiting NMC verification
  const [pendingDoctors, setPendingDoctors] = useState([
    {
      id: 'DOC-REQ-1082',
      name: 'Dr. K. Annamalai',
      regNo: 'TN-MED-84920',
      council: 'Tamil Nadu Medical Council',
      degrees: 'MBBS, MS (General Surgery), MCh (Urology & Andrology)',
      specialty: 'Clinical Andrologist & Male Fertility Specialist',
      experience: '12 Years',
      city: 'Chennai',
      email: 'dr.annamalai@medtrust.org',
      appliedDate: '23 Nov 2026',
      status: 'Awaiting NMC Audit',
      docsUploaded: ['Degree_MBBS.pdf', 'Degree_MCh_Uro.pdf', 'Council_Reg_2024.pdf']
    },
    {
      id: 'DOC-REQ-1085',
      name: 'Dr. Sneha Raghavan',
      regNo: 'TN-MED-77214',
      council: 'Tamil Nadu Medical Council',
      degrees: 'MBBS, DGO, Fellowship in Sexual Medicine (FECSM)',
      specialty: 'Female Sexual Wellness & Pelvic Health Consultant',
      experience: '9 Years',
      city: 'Coimbatore',
      email: 'dr.sneha@vitalityclinic.in',
      appliedDate: '24 Nov 2026',
      status: 'Awaiting NMC Audit',
      docsUploaded: ['Degree_MBBS.pdf', 'Fellowship_FECSM.pdf', 'NMC_License.pdf']
    }
  ]);

  // Approved doctors list
  const [approvedDoctors, setApprovedDoctors] = useState([
    {
      id: 'DOC-VER-4481',
      name: 'Dr. Arvind Swaminathan',
      regNo: 'TN-MED-44819',
      specialty: 'Clinical Sexologist & Andrologist',
      status: 'VERIFIED & ACTIVE',
      consultsToday: 4,
      satisfaction: '99.4%'
    }
  ]);

  // Plain-Box Logistics Orders
  const [logisticsOrders, setLogisticsOrders] = useState([
    {
      awb: 'BLUEDART-NY-98214X',
      recipientCode: 'PT-9410 (Chennai Central)',
      item: 'Tadalafil Daily Care 5mg (30 Tablets)',
      packaging: '100% Unbranded Plain Brown Corrugated Box',
      compliance: 'AUDITED & SECURE',
      courier: 'Blue Dart Express',
      time: '18 mins ago',
      status: 'In Transit'
    },
    {
      awb: 'BLUEDART-NY-98215Y',
      recipientCode: 'PT-8812 (Coimbatore North)',
      item: 'Pure Himalayan Shilajit Gold Resin',
      packaging: '100% Unbranded Plain Brown Corrugated Box',
      compliance: 'AUDITED & SECURE',
      courier: 'Blue Dart Express',
      time: '34 mins ago',
      status: 'Out for Delivery'
    },
    {
      awb: 'BLUEDART-NY-98216Z',
      recipientCode: 'PT-9104 (Madurai East)',
      item: 'Nayacura Pro-Delay Care Spray',
      packaging: '100% Unbranded Plain Brown Corrugated Box',
      compliance: 'AUDITED & SECURE',
      courier: 'Blue Dart Express',
      time: '1 hour ago',
      status: 'Delivered'
    }
  ]);

  // Security audit trail events
  const [auditEvents] = useState([
    { id: 'SEC-LOG-9921', time: '10:14:02 AM', event: 'AES-256 Automated Key Rotation', actor: 'System Daemon', ip: '10.0.4.12 (VPC)', status: 'Success' },
    { id: 'SEC-LOG-9920', time: '09:42:15 AM', event: 'Doctor Credential Verification Check', actor: 'SuperAdmin Ops', ip: '192.168.1.45 (Masked)', status: 'Authorized' },
    { id: 'SEC-LOG-9919', time: '08:15:30 AM', event: 'Patient Data PII Detachment Validation', actor: 'Anonymity Engine', ip: '10.0.8.2 (VPC)', status: 'Verified' },
    { id: 'SEC-LOG-9918', time: '07:00:00 AM', event: 'Vulnerability Port Scan (ISO 27001)', actor: 'Cloudflare Sentinel', ip: 'Edge Gateway', status: '0 Vulnerabilities' }
  ]);

  const handleApproveDoctor = (doc) => {
    setPendingDoctors(pendingDoctors.filter(d => d.id !== doc.id));
    setApprovedDoctors([{
      id: doc.id,
      name: doc.name,
      regNo: doc.regNo,
      specialty: doc.specialty,
      status: 'VERIFIED & ACTIVE',
      consultsToday: 0,
      satisfaction: '100%'
    }, ...approvedDoctors]);
    setSelectedDoctorForReview(null);
    setAdminToast(`Doctor ${doc.name} (${doc.regNo}) successfully verified and activated!`);
    setTimeout(() => setAdminToast(null), 4000);
  };

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'doctors', label: 'Clinician Approvals', icon: UserCheck },
    { key: 'logistics', label: 'Plain-Box Logistics', icon: Package },
    { key: 'telehealth', label: 'Telehealth Traffic', icon: Activity },
    { key: 'security', label: 'HIPAA & Security', icon: ShieldCheck },
    { key: 'orders', label: 'Store Orders Ledger', icon: ShoppingBag },
  ];

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
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-[#E1E7EF] bg-white transition-transform duration-200 h-screen sticky top-0 shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Top: Logo & Main Navigation Links */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex h-[74px] items-center justify-between border-b border-[#E1E7EF] px-6 shrink-0">
            <Link to="/" aria-label="Nayacura home">
              <img src="/logo.png" alt="Nayacura" className="h-9 w-auto object-contain cursor-pointer hover:opacity-85 transition" />
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

          <nav aria-label="Admin portal" className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">Admin Portal</p>
            
            <div className="space-y-1">
              {navItems.map(({ key, label, icon: Icon }) => (
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
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* SuperAdmin Access Footnote - Pinned to the VERY BOTTOM */}
        <div className="mt-auto shrink-0 border-t border-[#E1E7EF] p-4 bg-slate-50/80">
          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-3 w-full text-left group hover:opacity-90 transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#0B3B82] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-[#16A34A] transition">
              P
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0B3B82] truncate group-hover:text-[#16A34A] transition">Platform Operations Admin</p>
              <p className="text-[11px] text-slate-500 truncate">SuperAdmin • Least Privilege</p>
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
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Admin Portal</p>
              <h2 className="truncate text-xl font-extrabold text-[#0B3B82] sm:text-2xl">
                {SECTION_TITLES[activeSection] || 'Dashboard Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>AES-256 Encrypted</span>
            </div>

            <span className="hidden h-7 w-px bg-[#E1E7EF] sm:block" />

            {/* Round Avatar Icon with Dropdown Menu & Sign Out */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#0B3B82] font-bold text-white text-sm hover:ring-2 hover:ring-[#16A34A] hover:ring-offset-2 transition cursor-pointer shadow-xs"
                aria-label="Admin Account Menu"
                title="Account Menu & Sign Out"
              >
                P
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
                      <p className="font-extrabold text-[#0B3B82] text-sm truncate">Platform Operations Admin</p>
                      <p className="text-[11px] text-slate-500 truncate">SuperAdmin Access</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          Least Privilege
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B3B82]">
                          Admin Portal
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
                          handleNavClick('settings');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium text-left transition"
                      >
                        <Settings className="h-4 w-4 text-[#0B3B82]" />
                        <span>System Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('security');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium text-left transition"
                      >
                        <ShieldCheck className="h-4 w-4 text-[#0B3B82]" />
                        <span>Security & Audit Logs</span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                          navigate('/admin-login');
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
        {adminToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0B3B82] text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{adminToast}</span>
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#0B3B82]" />
                    <span>ISO 27001 & HIPAA Audited • Platform Operations Hub</span>
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3B82] sm:text-3xl">
                    Welcome back, <span className="text-[#128D28]">Operations Director</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#334B73]">
                    Monitor live telehealth traffic, verify clinician credentialing queues, and audit 100% plain-box courier fulfillment.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavClick('doctors')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E] transition"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      Review Doctor Approvals ({pendingDoctors.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('logistics')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16A34A] bg-emerald-50 px-5 py-2 text-sm font-bold text-[#128D28] hover:bg-emerald-100 transition"
                    >
                      <Package className="h-4 w-4" />
                      Fulfillment Center ({logisticsOrders.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('security')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-[#0B3B82] hover:bg-blue-100 transition"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      HIPAA Audit Log
                    </button>
                  </div>
                </div>
              </section>

              {/* 4 Summary Stat Cards in a Row */}
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
                {[
                  { key: 'telehealth', label: 'Total Consults', count: '42', note: 'Completed today', icon: Activity, tone: 'bg-blue-50 text-[#0B3B82]' },
                  { key: 'doctors', label: 'Doctor Approvals', count: pendingDoctors.length, note: 'Awaiting NMC audit', icon: UserCheck, tone: 'bg-purple-50 text-purple-700' },
                  { key: 'logistics', label: 'Plain-Box Dispatch', count: '18', note: 'In transit Blue Dart', icon: Package, tone: 'bg-emerald-50 text-[#128D28]' },
                  { key: 'security', label: 'Security Health', count: '100%', note: 'AES-256 Audited', icon: ShieldCheck, tone: 'bg-amber-50 text-amber-700' },
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

              {/* Balanced 2x2 Grid of Operational Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                
                {/* Card 1: Telehealth Traffic & Consultations */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-[#16A34A]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Telehealth Traffic & Consultations</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                        Today
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-500 block">Total Consults</span>
                        <span className="text-xl font-black text-[#0B3B82]">42</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">28 Clinic • 14 Video</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-500 block">Active Doctors</span>
                        <span className="text-xl font-black text-[#16A34A]">8</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Online & Available</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[11px] font-bold text-slate-500 block">Patient Rating</span>
                        <span className="text-xl font-black text-amber-600">99.2%</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Zero Stigma Score</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600">
                      <p>Average patient wait time: <strong>4.2 minutes</strong>. Video server packet loss: <strong>0.01% (LiveKit HD)</strong>.</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Real-time WebRTC Session Telemetry</span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('telehealth')}
                      className="font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      All 8 Rooms Active →
                    </button>
                  </div>
                </div>

                {/* Card 2: Clinician Credential Verification */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-purple-600" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Clinician Credential Verification</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
                        {pendingDoctors.length} Awaiting Verification
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {pendingDoctors.map((doc) => (
                        <div key={doc.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{doc.name} <span className="text-[10px] text-slate-500 font-normal">({doc.specialty})</span></p>
                            <p className="text-[11px] text-slate-500">Reg: <strong>{doc.regNo}</strong> • {doc.experience}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedDoctorForReview(doc)}
                            className="px-3 py-1.5 rounded-xl bg-[#0B3B82] hover:bg-[#072658] text-white text-[11px] font-bold transition shadow-xs"
                          >
                            Verify Credentials
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">National Medical Commission (NMC) Verification</span>
                    <span className="font-bold text-[#16A34A]">Auto-Audit Protocol Active</span>
                  </div>
                </div>

                {/* Card 3: Plain-Box Logistics & Courier Dispatch */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#16A34A]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Plain-Box Logistics & Courier Dispatch</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                        18 Dispatched Today
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <p className="font-bold text-slate-700">Discreet Fulfillment Status:</p>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Blue Dart Express Courier API</span>
                          <span className="text-[#16A34A] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">CONNECTED</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Live AWB generation with anonymous address masking</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">100% Plain Packaging Compliance</span>
                          <span className="text-[#16A34A] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">100% AUDITED</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Zero brand names or medication terms on outer cartons</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Avg Packaging & Dispatch SLA: <strong>18 Minutes</strong></span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('logistics')}
                      className="font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      Inspect Dispatch Ledger →
                    </button>
                  </div>
                </div>

                {/* Card 4: HIPAA Security & Encryption Health */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">HIPAA Security & Encryption Health</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                        AES-256
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-slate-700 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#0B3B82]">Patient Data Anonymity Engine</p>
                          <p className="text-[11px] text-slate-500">PII detached from medical diagnostic records</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">Right to be Forgotten Requests</p>
                          <p className="text-[11px] text-slate-500">0 pending medical data deletion tickets</p>
                        </div>
                        <span className="text-xs font-bold text-slate-600">0 Pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Last automated vulnerability scan: <strong>Today 06:00 AM</strong></span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('security')}
                      className="font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      View System Audit Log →
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ==================== B. CLINICIAN APPROVALS ==================== */}
          {activeSection === 'doctors' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Clinician Credential Verification Queue</h3>
                  <p className="text-xs text-slate-500 mt-1">Review NMC/MCI registration, medical degrees, and approve doctor practice privileges.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
                  {pendingDoctors.length} Awaiting Verification
                </span>
              </div>

              {/* Pending Doctors List */}
              <div className="space-y-3">
                {pendingDoctors.map((doc) => (
                  <div key={doc.id} className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#16A34A] transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-[#0B3B82]">{doc.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B3B82] border border-blue-200">
                          {doc.regNo}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {doc.specialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Qualifications:</strong> {doc.degrees} ({doc.experience} Clinical Experience)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Council: <strong>{doc.council}</strong> • Applied: <strong>{doc.appliedDate}</strong> • City: <strong>{doc.city}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorForReview(doc)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Inspect Certificates
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveDoctor(doc)}
                        className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs"
                      >
                        Approve & Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Approved Specialists Table */}
              <div className="mt-8 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  Active & Verified Specialist Clinicians ({approvedDoctors.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {approvedDoctors.map((doc) => (
                    <div key={doc.id} className="p-4 text-xs flex items-center justify-between hover:bg-slate-50/60 transition">
                      <div>
                        <p className="font-extrabold text-slate-800">{doc.name} <span className="text-[11px] text-slate-500 font-normal">({doc.regNo})</span></p>
                        <p className="text-[11px] text-slate-500">{doc.specialty}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== C. PLAIN-BOX LOGISTICS ==================== */}
          {activeSection === 'logistics' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Plain-Box Logistics & Courier Dispatch</h3>
                  <p className="text-xs text-slate-500 mt-1">Discreet fulfillment ledger powered by Blue Dart API with 100% anonymous packaging.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-extrabold border border-emerald-200">
                  Blue Dart API: Connected
                </span>
              </div>

              {/* Courier Dispatch Table */}
              <div className="rounded-2xl bg-white border border-[#DCE7F6] shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 grid grid-cols-12 gap-2">
                  <span className="col-span-3">AWB & Tracking</span>
                  <span className="col-span-3">Recipient Anonymity Code</span>
                  <span className="col-span-3">Product Item</span>
                  <span className="col-span-3 text-right">Packaging Audit</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {logisticsOrders.map((order, idx) => (
                    <div key={idx} className="p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition">
                      <div className="col-span-3">
                        <p className="font-extrabold text-[#0B3B82]">{order.awb}</p>
                        <p className="text-[11px] text-slate-500">{order.courier} • {order.time}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="font-bold text-slate-800">{order.recipientCode}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="font-medium text-slate-700">{order.item}</p>
                      </div>
                      <div className="col-span-3 text-right space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          {order.compliance}
                        </span>
                        <p className="text-[10px] text-slate-400">100% Plain Brown Box</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== D. TELEHEALTH TRAFFIC ==================== */}
          {activeSection === 'telehealth' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Real-Time Telehealth Session Telemetry</h3>
                  <p className="text-xs text-slate-500 mt-1">LiveKit HD WebRTC consultation traffic and network QoS parameters.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-extrabold border border-emerald-200">
                  All 8 Video Rooms Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs text-center">
                  <p className="text-xs font-bold text-slate-500">Live Server Latency</p>
                  <p className="text-2xl font-black text-[#0B3B82] mt-1">24 ms</p>
                  <p className="text-[11px] text-emerald-600 mt-1">Chennai Edge Point of Presence</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs text-center">
                  <p className="text-xs font-bold text-slate-500">WebRTC Packet Loss</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">0.01%</p>
                  <p className="text-[11px] text-slate-500 mt-1">Zero Audio Jitter Detected</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs text-center">
                  <p className="text-xs font-bold text-slate-500">Patient Satisfaction Score</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">99.2%</p>
                  <p className="text-[11px] text-slate-500 mt-1">Based on 1,420 anonymous ratings</p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== E. HIPAA & SECURITY ==================== */}
          {activeSection === 'security' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">HIPAA & ISO 27001 Security Audit Log</h3>
                  <p className="text-xs text-slate-500 mt-1">Immutable cryptographic event stream and patient anonymity verification.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-extrabold border border-emerald-200">
                  AES-256 Engine Active
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-[#DCE7F6] shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 grid grid-cols-12 gap-2">
                  <span className="col-span-3">Timestamp & Log ID</span>
                  <span className="col-span-4">Security Event</span>
                  <span className="col-span-3">Actor / Origin</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {auditEvents.map((evt) => (
                    <div key={evt.id} className="p-4 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50/60 transition">
                      <div className="col-span-3">
                        <p className="font-extrabold text-slate-800">{evt.time}</p>
                        <p className="text-[11px] text-slate-500">{evt.id}</p>
                      </div>
                      <div className="col-span-4">
                        <p className="font-bold text-[#0B3B82]">{evt.event}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="font-medium text-slate-700">{evt.actor}</p>
                        <p className="text-[11px] text-slate-500">{evt.ip}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                          {evt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== F. STORE ORDERS LEDGER ==================== */}
          {activeSection === 'orders' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Wellness Store Orders Ledger</h3>
                  <p className="text-xs text-slate-500 mt-1">Daily intimate wellness and prescription order shipments with privacy packaging check.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0B3B82] text-xs font-extrabold border border-blue-200">
                  18 Orders Dispatched
                </span>
              </div>

              <div className="space-y-3">
                {logisticsOrders.map((ord, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-800">{ord.item}</p>
                      <p className="text-xs text-slate-500">AWB: {ord.awb} • Customer: {ord.recipientCode}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold border border-emerald-200">
                      Dispatched
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== G. SYSTEM SETTINGS ==================== */}
          {activeSection === 'settings' && (
            <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-[#0B3B82] text-white text-2xl font-bold flex items-center justify-center">
                  P
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#0B3B82]">Platform Operations Configuration</h3>
                  <p className="text-xs text-slate-500">Nayacura Intimate Health Telehealth Platform</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> ISO 27001 Certified • HIPAA Compliant
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Logistics API Gateway</p>
                  <p className="font-extrabold text-slate-800 mt-1">Blue Dart Express (v2.4 Production)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">WebRTC Infrastructure</p>
                  <p className="font-extrabold text-slate-800 mt-1">LiveKit HD Cloud Edge (Chennai Node)</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== DOCTOR CREDENTIAL REVIEW MODAL ==================== */}
      {selectedDoctorForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <h3 className="font-extrabold text-[#0B3B82] text-base">
                  Verify Credentials — {selectedDoctorForReview.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctorForReview(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p><strong>Council Registration:</strong> {selectedDoctorForReview.regNo} ({selectedDoctorForReview.council})</p>
                <p><strong>Degrees:</strong> {selectedDoctorForReview.degrees}</p>
                <p><strong>Clinical Experience:</strong> {selectedDoctorForReview.experience}</p>
                <p><strong>Practice City:</strong> {selectedDoctorForReview.city}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1.5">Submitted Official Certificates:</h4>
                <div className="space-y-1">
                  {selectedDoctorForReview.docsUploaded.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px]">
                      <span className="font-medium text-[#0B3B82]">{file}</span>
                      <span className="text-emerald-700 font-bold">✓ NMC Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDoctorForReview(null)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApproveDoctor(selectedDoctorForReview)}
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition shadow-xs"
              >
                Approve & Grant Practice Privileges
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}