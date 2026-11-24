import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Send, 
  Lock, 
  Package, 
  Sparkles, 
  Wifi, 
  Battery, 
  Video, 
  Bell, 
  ShieldCheck, 
  Clock, 
  FlaskConical, 
  FileText, 
  Home, 
  ShoppingBag, 
  UserCheck 
} from 'lucide-react';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

export default function MobileAppSection() {
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendSMS = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) return;
    setIsSent(true);
    setTimeout(() => setIsSent(false), 4000);
  };

  return (
    <section className="py-14 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="p-8 sm:p-12 lg:p-14 rounded-3xl border border-emerald-200 shadow-sm relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            
            {/* Left Details (7 cols on large screens) */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
                <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                <ShinyText text="100% Confidential Mobile Care" className="text-xs uppercase tracking-wider" />
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 tracking-tight text-[#0B3B82] leading-tight">
                Get the <span className="text-[#0B3B82]">naya</span><span className="text-[#16A34A]">cura</span> Sexual Wellness App
              </h2>

              <p className="mt-3.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed max-w-xl">
                Consult verified clinical sexologists in private audio/video calls, track hormonal vitality reports, and order treatments in 100% plain brown box packaging—all from the complete privacy of your smartphone.
              </p>

              {/* Features checkmarks */}
              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  </div>
                  <span>60-second instant private call with camera-off audio option</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  </div>
                  <span>Encrypted medical records & anonymous lab test result access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  </div>
                  <span>Discreet plain packaging tracking with zero outer brand markings</span>
                </div>
              </div>

              {/* SMS Link Form */}
              <div className="mt-8 max-w-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  Get download link via private SMS
                </span>
                <form onSubmit={handleSendSMS} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-xs text-slate-500 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full text-xs pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-emerald-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] shadow-sm font-medium"
                    />
                  </div>
                  <MagneticButton
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Link</span>
                  </MagneticButton>
                </form>

                {isSent && (
                  <p className="mt-2.5 text-xs text-[#16A34A] font-bold flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Link sent to +91 {phone}! Download securely.
                  </p>
                )}
              </div>

              {/* App Badges */}
              <div className="mt-8 flex items-center gap-4">
                <a 
                  href="#google-play" 
                  onClick={(e) => { e.preventDefault(); alert("Redirecting to Google Play Store..."); }}
                  className="flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="text-[10px] text-slate-300 leading-none">GET IT ON <br /><span className="text-sm font-bold text-white">Google Play</span></div>
                </a>

                <a 
                  href="#app-store" 
                  onClick={(e) => { e.preventDefault(); alert("Redirecting to Apple App Store..."); }}
                  className="flex items-center gap-2.5 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <div className="text-[10px] text-slate-300 leading-none">Download on the <br /><span className="text-sm font-bold text-white">App Store</span></div>
                </a>
              </div>

            </div>

            {/* Right Realistic Life-Sized Smartphone Mockup (5 cols on large screens) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="phone-preview relative">
                
                {/* Outer Hardware Buttons on Phone Frame */}
                <div className="absolute -left-[14px] top-28 w-1 h-6 bg-slate-700 rounded-l-md shadow-xs pointer-events-none" />
                <div className="absolute -left-[14px] top-40 w-1 h-12 bg-slate-700 rounded-l-md shadow-xs pointer-events-none" />
                <div className="absolute -left-[14px] top-56 w-1 h-12 bg-slate-700 rounded-l-md shadow-xs pointer-events-none" />
                <div className="absolute -right-[14px] top-40 w-1 h-16 bg-slate-700 rounded-r-md shadow-xs pointer-events-none" />

                {/* Smartphone Chassis with Real Proportions */}
                <div className="phone-chassis w-[320px] sm:w-[340px] md:w-[350px] h-[670px] sm:h-[700px] rounded-[52px] border-[12px] border-slate-900 bg-slate-950 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.35)] p-2.5 relative flex flex-col justify-between overflow-hidden">
                  
                  {/* Glass Screen Container */}
                  <div className="w-full h-full rounded-[40px] bg-[#F8FAFC] flex flex-col justify-between overflow-hidden text-slate-800 shadow-inner relative border border-slate-200/60">
                    
                    {/* Top Status Bar & Dynamic Island */}
                    <div className="pt-3 px-5 pb-2 bg-white border-b border-slate-100 flex flex-col gap-1 relative z-20">
                      
                      {/* Dynamic Island Pill */}
                      <div className="w-28 h-6 bg-slate-950 rounded-full flex items-center justify-between px-3 mx-auto shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-slate-700" />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>

                      {/* Status Info */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1 pt-1">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span className="text-[10px] font-extrabold text-[#0B3B82]">5G</span>
                          <Wifi className="w-3.5 h-3.5" />
                          <div className="flex items-center">
                            <Battery className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* App Internal Body / Feed */}
                    <div className="flex-1 p-3.5 space-y-3 overflow-y-auto scrollbar-none">
                      
                      {/* App Navbar */}
                      <div className="flex items-center justify-between pb-1">
                        <div className="font-black text-sm tracking-tight">
                          <span className="text-[#0B3B82]">naya</span>
                          <span className="text-[#16A34A]">cura</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-[10px] font-extrabold">
                          <Lock className="w-2.5 h-2.5 text-[#16A34A]" />
                          100% Private
                        </span>
                      </div>

                      {/* 1. Primary Video Consult Card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0B3B82] to-[#072658] text-white shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                            Active Sexologists Online
                          </span>
                          <span className="bg-white/10 px-2 py-0.5 rounded-full text-white">60s Wait</span>
                        </div>

                        <div className="text-sm font-extrabold tracking-tight mt-1">
                          Instant Audio / Video Call
                        </div>
                        <div className="text-[10px] text-slate-200 leading-tight mt-0.5">
                          Camera-off audio option • Zero wait room
                        </div>

                        <button className="mt-3 w-full py-2 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition">
                          <Video className="w-3.5 h-3.5" />
                          <span>Start Confidential Consult</span>
                        </button>
                      </div>

                      {/* 2. Scheduled Patient Session Card */}
                      <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3B82] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          <UserCheck className="w-5 h-5 text-[#0B3B82]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-[#0B3B82] truncate">
                            Dr. Arvind Swaminathan
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#16A34A]" />
                            <span>Today at 6:30 PM • Audio Room</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-[#15803D] rounded-lg text-[10px] font-extrabold flex-shrink-0">
                          Join
                        </span>
                      </div>

                      {/* 3. Quick Medical Feature Grid */}
                      <div className="grid grid-cols-2 gap-2 text-left">
                        
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B3B82]">
                            <FlaskConical className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>At-Home Labs</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            Anonymous Barcoded Kit
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B3B82]">
                            <Package className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>Plain Box Order</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            0 Outer Brand Markings
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B3B82]">
                            <FileText className="w-3.5 h-3.5 text-[#0B3B82]" />
                            <span>Private Rx Vault</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            Encrypted Prescription
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0B3B82]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>ZSR & EDSWT</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            Daycare Clinical Care
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Bottom App Navigation Dock & Home Indicator */}
                    <div className="bg-white border-t border-slate-200/80 px-4 pt-2.5 pb-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex flex-col items-center gap-0.5 text-[#16A34A]">
                          <Home className="w-4 h-4" />
                          <span className="text-[8px] font-extrabold">Home</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Video className="w-4 h-4" />
                          <span className="text-[8px] font-medium">Consult</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <FlaskConical className="w-4 h-4" />
                          <span className="text-[8px] font-medium">Tests</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-[8px] font-medium">Store</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <Lock className="w-4 h-4" />
                          <span className="text-[8px] font-medium">Vault</span>
                        </div>
                      </div>

                      {/* Home Indicator Swipe Bar */}
                      <div className="w-28 h-1 bg-slate-900 rounded-full mx-auto mt-2" />
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
