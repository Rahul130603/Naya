import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { findApplicationByEmail, listAccounts } from '../lib/doctorRegistry';
import { 
  Lock, 
  LockKeyhole, 
  Phone, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  Package, 
  Stethoscope, 
  Bot, 
  LogOut,
  Building2,
  FileText,
  Server,
  Award,
  KeyRound,
  BadgeCheck
} from 'lucide-react';

export default function PatientLoginPage({ onLoginSuccess, currentUser, onLogout, initialRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Role: 'patient' | 'doctor' | 'admin'
  const [selectedRole, setSelectedRole] = useState(() => {
    if (initialRole) return initialRole;
    if (location.pathname.includes('doctor')) return 'doctor';
    if (location.pathname.includes('admin')) return 'admin';
    return 'patient';
  });

  // Tab: 'phone' (Mobile OTP) | 'email' (Email & Password / Reg No)
  const [activeTab, setActiveTab] = useState('phone');

  // Phone OTP Flow State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [phoneError, setPhoneError] = useState('');

  // Email Flow State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [doctorRegNo, setDoctorRegNo] = useState('');

  // General Loading & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState(null);

  // Update role if pathname changes
  useEffect(() => {
    if (location.pathname.includes('doctor')) setSelectedRole('doctor');
    else if (location.pathname.includes('admin')) setSelectedRole('admin');
  }, [location.pathname]);

  // Timer countdown when OTP is sent
  useEffect(() => {
    let interval = null;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Role details configuration
  const roleConfigs = {
    patient: {
      badge: '100% Confidential Patient Sign In',
      badgeIcon: Lock,
      badgeColor: 'text-[#0B3B82] bg-emerald-50 border-emerald-200',
      title: 'Welcome to Nayacura',
      subtitle: 'Sign in to access your confidential doctor appointments, certified prescriptions, lab reports, and discreet orders.',
      demoName: 'Suresh Kumar',
      demoTitle: '1-Click Demo Patient',
      demoUser: {
        name: 'Suresh Kumar',
        phone: '+91 98401 23456',
        email: 'suresh.kumar@nayacura.patient',
        role: 'patient',
        id: 'NC-PAT-4921',
        city: 'Chennai'
      },
      redirectPath: '/patient-dashboard',
      rightBadge: 'Your Private Space, Your Control',
      rightTitle: 'Why Create a Private Patient Account?',
      rightSubtitle: 'Designed from the ground up for compassionate, stigma-free sexual health & intimate wellness care in India.'
    },
    doctor: {
      badge: 'Verified Clinician & Medical Specialist Access',
      badgeIcon: Stethoscope,
      badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
      title: 'Clinician Consultation Portal',
      subtitle: 'Sign in to your private clinician suite. Access today’s patient queue, encrypted HD video rooms, and E-Prescription stamping.',
      demoName: 'Dr. Arvind Swaminathan',
      demoTitle: '1-Click Demo Doctor',
      demoUser: {
        name: 'Dr. Arvind Swaminathan',
        regNo: 'TN-MED-44819',
        specialty: 'Clinical Sexologist & Andrologist',
        email: 'dr.arvind@nayacura.clinic',
        phone: '+91 94440 18291',
        role: 'doctor',
        clinic: 'Nayacura Men & Women Intimate Health Clinic, Chennai'
      },
      redirectPath: '/doctor-dashboard',
      rightBadge: 'MCI & NMC Verified Practice',
      rightTitle: 'Nayacura Clinician Telehealth Suite',
      rightSubtitle: 'High-definition encrypted video teleconsultations, electronic health records (EHR), and automated digital prescription signing.'
    },
    admin: {
      badge: 'Platform Administration & Operations',
      badgeIcon: ShieldCheck,
      badgeColor: 'text-blue-900 bg-blue-50 border-blue-200',
      title: 'Administration Console',
      subtitle: 'Least-privilege operational access for doctor credentialing, plain-box courier dispatch, and platform security auditing.',
      demoName: 'Operations Director',
      demoTitle: '1-Click Demo Admin',
      demoUser: {
        name: 'Platform Operations Admin',
        email: 'admin@nayacura.internal',
        role: 'admin',
        accessLevel: 'SuperAdmin'
      },
      redirectPath: '/admin-dashboard',
      rightBadge: 'HIPAA & ISO 27001 Audited',
      rightTitle: 'Operations & Compliance Engine',
      rightSubtitle: 'Oversee verified clinician onboarding, live courier AWB dispatch, tamper-proof packaging logs, and end-to-end data encryption.'
    }
  };

  const currentConfig = roleConfigs[selectedRole];

  // Handle Mobile Number Submission
  const handleSendOtp = (e) => {
    e?.preventDefault();
    setPhoneError('');
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setResendTimer(30);
      setOtp(['4', '8', '2', '9']);
    }, 600);
  };

  // Handle OTP Verification
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setPhoneError('Please enter the complete 4-digit verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userObj = {
        ...currentConfig.demoUser,
        phone: `+91 ${phone || '9840123456'}`
      };

      if (onLoginSuccess) onLoginSuccess(userObj);
      setLoginSuccessMessage(`Signed in securely as ${userObj.name}! Redirecting...`);
      setTimeout(() => {
        navigate(currentConfig.redirectPath);
      }, 1000);
    }, 700);
  };

  // Handle Email & Password Login
  const handleEmailLogin = (e) => {
    e?.preventDefault();
    setEmailError('');
    const isDoctorIdentifier = selectedRole === 'doctor';
    if (!email || (!email.includes('@') && !isDoctorIdentifier)) {
      setEmailError('Please enter a valid email address or your Doctor ID.');
      return;
    }
    if (!password || password.length < 6) {
      setEmailError('Password must be at least 6 characters.');
      return;
    }

    if (selectedRole === 'doctor') {
      const identifier = email.trim().toLowerCase();
      const account = listAccounts().find((item) => (
        item.email?.toLowerCase() === identifier
        || item.id?.toLowerCase() === identifier
        || item.regNo?.toLowerCase() === identifier
      ));

      if (account) {
        if (password !== account.password) {
          setEmailError('Incorrect password. Use the temporary password from your credentials email.');
          return;
        }
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          const userObj = {
            name: account.name,
            email: account.email,
            regNo: account.regNo,
            specialty: account.specialty,
            role: 'doctor',
            id: account.id,
            city: account.city,
            clinic: 'Nayacura Clinician Console',
          };
          if (onLoginSuccess) onLoginSuccess(userObj);
          setLoginSuccessMessage(`Signed in as ${userObj.name}! Redirecting...`);
          setTimeout(() => navigate('/doctor-dashboard'), 1000);
        }, 700);
        return;
      }

      const application = findApplicationByEmail(identifier);
      if (application?.status === 'pending') {
        setEmailError('Your clinician application is still under review. Credentials arrive by email after approval.');
        return;
      }
      if (application?.status === 'rejected') {
        setEmailError('This application was not approved. Write to support@nayacura.example for assistance.');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userObj = {
        ...currentConfig.demoUser,
        email: email || currentConfig.demoUser.email
      };

      if (onLoginSuccess) onLoginSuccess(userObj);
      setLoginSuccessMessage(`Signed in securely as ${userObj.name}! Redirecting...`);
      setTimeout(() => {
        navigate(currentConfig.redirectPath);
      }, 1000);
    }, 700);
  };

  // 1-Click Quick Demo Login (Fast, Frictionless)
  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser = currentConfig.demoUser;
      if (onLoginSuccess) onLoginSuccess(demoUser);
      setLoginSuccessMessage(`Signed in as ${demoUser.name} (${selectedRole.toUpperCase()})`);
      setTimeout(() => {
        navigate(currentConfig.redirectPath);
      }, 800);
    }, 400);
  };

  // Handle single digit OTP box change
  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);

    if (digit && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Brand Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-100/50 via-blue-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link to="/" className="hover:text-[#0B3B82] transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-[#0B3B82] font-bold capitalize">{selectedRole} Sign In</span>
        </nav>

        {/* ROLE SELECTOR TABS (Patient | Doctor | Admin) */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/70 shadow-xs max-w-md w-full">
            <button
              type="button"
              onClick={() => { setSelectedRole('patient'); setOtpSent(false); setLoginSuccessMessage(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'patient'
                  ? 'bg-white text-[#0B3B82] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B3B82]'
              }`}
            >
              <UserCheck className="h-4 w-4 text-[#16A34A]" />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('doctor'); setOtpSent(false); setLoginSuccessMessage(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'doctor'
                  ? 'bg-white text-[#0B3B82] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B3B82]'
              }`}
            >
              <Stethoscope className="h-4 w-4 text-purple-600" />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setOtpSent(false); setLoginSuccessMessage(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#0B3B82] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B3B82]'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="max-w-xl mx-auto rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-lg shadow-emerald-950/5">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mb-4">
              <UserCheck className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0B3B82]">You are signed in!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Logged in as <strong className="text-[#0B3B82]">{currentUser.name}</strong> ({currentUser.role?.toUpperCase()}).
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to={currentUser.role === 'doctor' ? '/doctor-dashboard' : currentUser.role === 'admin' ? '/admin-dashboard' : '/patient-dashboard'} 
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B3B82] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#072658] transition"
              >
                Go to {currentUser.role === 'doctor' ? 'Doctor' : currentUser.role === 'admin' ? 'Admin' : 'Patient'} Dashboard →
              </Link>
              <button 
                type="button" 
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Main 2-Column Split Layout */
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Role Sign In Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden relative">
              {/* Brand Accent Top Stripe */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${
                selectedRole === 'doctor' ? 'from-[#0B3B82] via-purple-600 to-[#16A34A]' :
                selectedRole === 'admin' ? 'from-blue-700 via-indigo-600 to-[#0B3B82]' :
                'from-[#0B3B82] via-[#16A34A] to-[#0B3B82]'
              }`} />

              <div className="p-7 sm:p-10">
                {/* Role Badge */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-5 ${currentConfig.badgeColor}`}>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <currentConfig.badgeIcon className="h-3.5 w-3.5" />
                  <span>{currentConfig.badge}</span>
                </div>

                {/* Heading */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B82] tracking-tight">
                  {currentConfig.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {currentConfig.subtitle}
                </p>

                {selectedRole === 'doctor' && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50/60 px-4 py-3 text-xs font-semibold text-purple-900">
                    <Stethoscope className="h-4 w-4 text-purple-700" />
                    <span>New to Nayacura?</span>
                    <Link to="/doctor-register" className="font-bold underline hover:text-[#0B3B82]">Apply as a clinician →</Link>
                  </div>
                )}

                {/* Success Notification */}
                {loginSuccessMessage && (
                  <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />
                    <span>{loginSuccessMessage}</span>
                  </div>
                )}

                {/* 1-Click Quick Demo Sign In Button (Role-Specific) */}
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3B82]">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Fast Evaluation Shortcut
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Test the <strong>{selectedRole}</strong> experience instantly as <strong>{currentConfig.demoName}</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B3B82] to-[#114ba3] hover:from-[#082b5e] hover:to-[#0B3B82] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition shrink-0 active:scale-95"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>{currentConfig.demoTitle}</span>
                    </button>
                  </div>
                </div>

                {/* Login Method Segmented Control / Tabs */}
                <div className="mt-7 flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('phone'); setPhoneError(''); }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'phone'
                        ? 'bg-white text-[#0B3B82] shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-[#0B3B82]'
                    }`}
                  >
                    <Phone className={`h-4 w-4 ${activeTab === 'phone' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                    <span>Mobile OTP</span>
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-[#15803D] font-extrabold uppercase tracking-wide">
                      Instant
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('email'); setEmailError(''); }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      activeTab === 'email'
                        ? 'bg-white text-[#0B3B82] shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-[#0B3B82]'
                    }`}
                  >
                    <Mail className={`h-4 w-4 ${activeTab === 'email' ? 'text-[#16A34A]' : 'text-slate-400'}`} />
                    <span>Email & Credentials</span>
                  </button>
                </div>

                {/* Form Body */}
                <div className="mt-6">
                  {/* TAB 1: MOBILE OTP FLOW */}
                  {activeTab === 'phone' && (
                    <div>
                      {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                              Registered Mobile Number (India)
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-3.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 pr-2 border-r border-slate-200">
                                🇮🇳 +91
                              </span>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="Enter 10-digit mobile number"
                                value={phone}
                                onChange={(e) => {
                                  setPhone(e.target.value.replace(/\D/g, ''));
                                  if (phoneError) setPhoneError('');
                                }}
                                className="w-full pl-20 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all bg-slate-50/50 focus:bg-white"
                                required
                              />
                            </div>
                            {phoneError && (
                              <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> {phoneError}
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B3B82] hover:bg-[#082b5e] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-950/10 transition active:scale-[0.99] disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                            ) : (
                              <>
                                <span>Send Secure OTP</span>
                                <ArrowRight className="h-4 w-4 text-emerald-400" />
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        /* OTP Verification Screen */
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#0B3B82]">
                                OTP sent to +91 {phone || '9840123456'}
                              </p>
                              <p className="text-[11px] text-emerald-700">Enter code to enter {selectedRole} portal.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="text-xs font-bold text-[#16A34A] hover:underline px-2 py-1"
                            >
                              Edit
                            </button>
                          </div>

                          {/* 4 Digit Boxes */}
                          <div>
                            <div className="flex justify-center gap-3 sm:gap-4">
                              {otp.map((digit, idx) => (
                                <input
                                  key={idx}
                                  id={`otp-input-${idx}`}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                                  className="w-13 h-14 sm:w-14 sm:h-14 text-center text-xl font-extrabold text-[#0B3B82] rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-all shadow-xs"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-center gap-2 pt-1">
                            <span className="text-xs text-slate-500">Demo Code:</span>
                            <button
                              type="button"
                              onClick={() => setOtp(['4', '8', '2', '9'])}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-[#15803D] text-xs font-bold hover:bg-emerald-200 transition"
                            >
                              <Sparkles className="h-3 w-3" /> Auto-fill 4829
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-950/10 transition active:scale-[0.99] disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            ) : (
                              <>
                                <span>Verify & Access {selectedRole.toUpperCase()} Console</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB 2: EMAIL & PASSWORD / CREDENTIALS FLOW */}
                  {activeTab === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      {selectedRole === 'doctor' && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Medical Council Registration Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. TN-MED-44819"
                            value={doctorRegNo}
                            onChange={(e) => setDoctorRegNo(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all bg-slate-50/50 focus:bg-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          {selectedRole === 'admin' ? 'Administrator Email' : 'Professional Email Address'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            placeholder={selectedRole === 'admin' ? 'admin@nayacura.internal' : 'dr.arvind@nayacura.clinic'}
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all bg-slate-50/50 focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          {selectedRole === 'admin' ? 'Security Master Password' : 'Password'}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all bg-slate-50/50 focus:bg-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {emailError && (
                          <p className="mt-1.5 text-xs font-bold text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> {emailError}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B3B82] hover:bg-[#082b5e] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-950/10 transition active:scale-[0.99] disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                        ) : (
                          <>
                            <span>Sign In to {selectedRole.toUpperCase()} Console</span>
                            <ArrowRight className="h-4 w-4 text-emerald-400" />
                          </>
                        )}
                      </button>

                      {selectedRole === 'doctor' && (
                        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
                          New clinician?{' '}
                          <Link to="/doctor-register" className="font-bold text-[#0B3B82] underline hover:text-[#16A34A]">
                            Apply for credentials →
                          </Link>
                        </p>
                      )}
                    </form>
                  )}
                </div>

                {/* Privacy Standards Callout Inside Card */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                    <span>256-Bit HIPAA Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                    <span>NMC Verified Protocol</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <LockKeyhole className="h-4 w-4 text-[#16A34A]" />
                    <span>Least Privilege Access</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Role Dignity & Operational Showcase (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div 
                className="p-7 sm:p-8 rounded-3xl border border-emerald-200/90 shadow-sm relative overflow-hidden bg-cover bg-center transition-all"
                style={{ 
                  backgroundImage: `url('/condition-banner-bg.png')`,
                  backgroundColor: '#F3FAF4'
                }}
              >
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-xs mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
                    {currentConfig.rightBadge}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B3B82] tracking-tight">
                    {currentConfig.rightTitle}
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {currentConfig.rightSubtitle}
                  </p>

                  {/* Dynamic Role Feature Items */}
                  <div className="mt-6 space-y-4">
                    {selectedRole === 'doctor' ? (
                      <>
                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Encrypted Telehealth Consultation Suite</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Conduct 1-on-1 private video calls with camera, microphone, and patient queue controls.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#16A34A] flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Digital Tele-Prescription Stamping</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Issue tamper-proof doctor-signed digital prescriptions directly fulfilled by Nayacura Wellness Store.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#0B3B82] flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Confidential EMR & Lab Diagnostics</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Direct access to 7-Panel STI and hormone biomarker reports verified by certified pathology labs.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : selectedRole === 'admin' ? (
                      <>
                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#0B3B82] flex items-center justify-center shrink-0">
                            <Server className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Live Telehealth Session Infrastructure</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Monitor real-time room capacity, WebRTC network latency, and doctor online availability.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#16A34A] flex items-center justify-center shrink-0">
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Clinician Credentialing & Verification</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Audit medical registrations (MCI/NMC) and activate doctor profiles with strict clinical governance.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Plain-Box Logistics & Courier AWB Dispatch</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Track 100% plain corrugated box compliance and Blue Dart API fulfillment in real time.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-[#16A34A] flex items-center justify-center shrink-0">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Private Doctor Consultations</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Connect with verified senior sexologists & counselors over encrypted video calls or in-clinic visits.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#0B3B82] flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Discreet Wellness Store Orders</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Track orders in real-time with 100% plain unbranded brown cardboard box delivery. Zero brand names exterior.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/80 border border-emerald-100 shadow-xs">
                          <div className="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-[#0B3B82]">Certified Digital Reports & Rx</h3>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              Access confidential 7-panel STI results, hormone reports, and doctor-signed e-prescriptions anytime.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Trust Footer Badges */}
                  <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-around text-center">
                    <div>
                      <p className="text-xs font-extrabold text-[#0B3B82]">100%</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Confidential</p>
                    </div>
                    <div className="h-6 w-px bg-emerald-200" />
                    <div>
                      <p className="text-xs font-extrabold text-[#0B3B82]">HIPAA</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Audited</p>
                    </div>
                    <div className="h-6 w-px bg-emerald-200" />
                    <div>
                      <p className="text-xs font-extrabold text-[#0B3B82]">Zero</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Stigma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
