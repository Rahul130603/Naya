import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  ChevronDown, 
  FlaskConical, 
  Stethoscope, 
  BriefcaseMedical, 
  ShoppingBag, 
  ShieldCheck, 
  CalendarCheck, 
  Lock, 
  Menu, 
  X,
  Sparkles,
  LogOut
} from 'lucide-react';
import { CITIES } from '../data/healthcareData';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

export default function Navbar({ 
  selectedCity, 
  setSelectedCity, 
  onOpenAuthModal, 
  onOpenAppointmentsModal, 
  onOpenBookingModal,
  user,
  onLogout
}) {
  const location = useLocation();
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { setMobileMenuOpen(false); setCityDropdownOpen(false); }, [location.pathname]);
  useEffect(() => {
    const closeMenu = event => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    if (mobileMenuOpen) window.addEventListener('keydown', closeMenu);
    return () => window.removeEventListener('keydown', closeMenu);
  }, [mobileMenuOpen]);

  const navItems = [
    {
      path: '/consult-sexologist',
      icon: Stethoscope,
      line1: 'Consult',
      line2: 'Sexologist',
    },
    {
      path: '/lab-tests',
      icon: FlaskConical,
      line1: 'Hormone &',
      line2: 'STI Tests',
    },
    {
      path: '/intimate-procedures',
      icon: BriefcaseMedical,
      line1: 'Intimate',
      line2: 'Procedures',
    },
    {
      path: '/wellness-store',
      icon: ShoppingBag,
      line1: 'Wellness',
      line2: 'Store',
    },
    {
      path: '/privacy-standards',
      icon: ShieldCheck,
      line1: 'Nayacura',
      line2: 'Care',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 xl:gap-4">
          
          {/* 1. Logo (shifted right + slightly larger) */}
          <Link 
            to="/" 
            className="flex items-center flex-shrink-0 group focus:outline-none sm:ml-4 lg:ml-10 mr-2 xl:mr-4"
          >
            <img 
              src="/logo.png" 
              alt="nayacura" 
              className="h-11 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center font-black text-3xl tracking-tight">
              <span className="text-[#0B3B82]">naya</span>
              <span className="text-[#16A34A]">cura</span>
            </div>
          </Link>

          {/* 2. Center Navigation Tabs (Exact 2-Line + Icon Design from Screenshot) */}
          <nav aria-label="Main navigation" className="hidden xl:flex items-center space-x-1 xl:space-x-2 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/consult-sexologist' && location.pathname.startsWith('/condition/'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#E8F8EE] text-[#15803D]'
                      : 'text-slate-800 hover:text-[#0B3B82] hover:bg-slate-50'
                  }`}
                >
                  {/* Icon */}
                  <div className={`flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#16A34A]' : 'text-[#0B3B82] group-hover:text-[#16A34A]'
                  }`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* 2-Line Stacked Label */}
                  <div className="flex flex-col text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className={`text-[12px] font-bold ${
                        isActive ? 'text-[#15803D]' : 'text-slate-900 group-hover:text-[#0B3B82]'
                      }`}>
                        {item.line1}
                      </span>
                      {item.badge && (
                        <span className="px-1 py-0.5 rounded bg-emerald-100 text-[#15803D] text-[9px] font-extrabold uppercase tracking-wider leading-none">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[12px] font-bold ${
                      isActive ? 'text-[#15803D]' : 'text-slate-800 group-hover:text-[#0B3B82]'
                    }`}>
                      {item.line2}
                    </span>
                  </div>

                  {/* Solid Green Bottom Underline for Active Item (Exact to Screenshot) */}
                  {isActive && (
                    <span className="absolute -bottom-2.5 left-2 right-2 h-1 bg-[#16A34A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right Action Controls (Pill City Selector + Pill My Bookings + Navy Private Login) */}
          <div className="hidden xl:flex items-center space-x-2.5 xl:space-x-3 flex-shrink-0">
            
            {/* City Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 text-[#0B3B82]" />
                <span>{selectedCity}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {cityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setCityDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl z-40 animate-slide-up">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Select City
                    </div>
                    {CITIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCity(c.name);
                          setCityDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3.5 py-2 text-xs text-left transition ${
                          selectedCity === c.name 
                            ? 'bg-[#E8F8EE] text-[#15803D] font-bold' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.state}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* My Bookings Pill */}
            <button
              onClick={onOpenAppointmentsModal}
              className="flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition shadow-sm"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-[#0B3B82]" />
              <span>My Bookings</span>
            </button>

            {/* Naya AI Direct Header Pill */}
            <Link
              to="/ai"
              className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:shadow-emerald-500/30 transition-all hover:scale-102 group"
              title="Open Naya AI Confidential Chat"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-200 group-hover:rotate-12 transition-transform animate-pulse" />
              <span>AI Chat</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                AI
              </span>
            </Link>

            {/* Private Login Button / User Session */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link 
                  to={user.role === 'doctor' ? '/doctor-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/patient-dashboard'} 
                  title={`Open ${user.role || 'Patient'} Dashboard`}
                  className="flex items-center space-x-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-full pl-1.5 pr-3 py-1 shadow-xs transition"
                >
                  <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                    user.role === 'doctor' ? 'bg-purple-600' : user.role === 'admin' ? 'bg-blue-600' : 'bg-[#16A34A]'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-[#0B3B82] leading-none">{user.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold leading-none mt-0.5">
                      {user.role === 'doctor' ? 'Doctor Suite →' : user.role === 'admin' ? 'Admin Ops →' : 'Dashboard →'}
                    </span>
                  </div>
                </Link>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 rounded-full bg-[#0B3B82] hover:bg-[#072658] px-4 py-2 text-xs font-bold text-white transition shadow-sm hover:shadow-md"
              >
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <ShinyText text="Private Login" variant="white" className="text-xs" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            <button type="button" onClick={() => { setMobileMenuOpen(false); onOpenBookingModal(); }} className="rounded-full bg-brand-navy px-4 py-2 text-sm font-bold text-white">Book</button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-navy"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-slide-up">
          <label className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            <MapPin className="h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
            <span>City</span>
            <select aria-label="Select your city" value={selectedCity} onChange={event => setSelectedCity(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-800">
              {CITIES.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
            </select>
          </label>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-[#E8F8EE] text-[#15803D] font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#16A34A]' : 'text-[#0B3B82]'}`} />
                  <span>{item.line1} {item.line2}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#15803D] text-[10px] font-extrabold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/ai"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Launch Naya AI Chat</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] font-black uppercase">AI</span>
            </Link>
            <button
              onClick={() => {
                onOpenAppointmentsModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700"
            >
              <CalendarCheck className="w-4 h-4 text-[#0B3B82]" />
              <span>My Bookings</span>
            </button>
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <Link
                  to={user.role === 'doctor' ? '/doctor-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/patient-dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-left"
                >
                  <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                    user.role === 'doctor' ? 'bg-purple-600' : user.role === 'admin' ? 'bg-blue-600' : 'bg-[#16A34A]'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B3B82]">{user.name}</p>
                    <p className="text-xs text-emerald-700 font-semibold">
                      Open {user.role === 'doctor' ? 'Doctor Suite' : user.role === 'admin' ? 'Admin Ops' : 'Patient Dashboard'} →
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (onLogout) onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#0B3B82] font-bold text-sm text-white flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Private Login</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
