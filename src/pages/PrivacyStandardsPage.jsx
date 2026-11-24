import React from 'react';
import { ShieldCheck, Package, Lock, CheckCircle2, EyeOff, Award, FileText } from 'lucide-react';

export default function PrivacyStandardsPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mint Green Wave Hero Banner - Wide Horizontal Rectangle */}
        <div 
          className="w-full p-8 sm:p-10 lg:p-12 rounded-3xl border border-emerald-200/90 shadow-sm mb-10 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-4xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              100% Privacy & Patient Dignity
            </span>
            
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold mt-4 tracking-tight text-[#0B3B82] leading-tight">
              Our Uncompromising Privacy & Discretion Standards
            </h1>
            
            <p className="mt-3 text-slate-700 font-semibold text-sm sm:text-base lg:text-lg leading-relaxed max-w-3xl">
              We understand how personal sexual health is. That's why every interaction on Nayacura is designed to guarantee complete confidentiality, anonymity, and zero judgment.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-xs">
                <Package className="w-4 h-4 text-[#16A34A]" />
                <span>100% Plain Brown Box Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Anonymous Barcodes & 256-Bit Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Privacy */}
        <div className="space-y-5">
          
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft flex items-start gap-5 hover:border-emerald-200 transition-all">
            <div className="p-4 rounded-2xl bg-emerald-50 text-brand-green flex-shrink-0">
              <Package className="w-7 h-7 text-[#16A34A]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#0B3B82]">1. 100% Unbranded Plain Brown Box Packaging</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                All medications, vitality supplements, and home test kits are shipped in completely plain, unbranded brown cardboard boxes. There is no mention of "Nayacura", "Sexual Wellness", "Sexology", or any medication names anywhere on the exterior. Only your delivery address and tracking code appear.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft flex items-start gap-5 hover:border-emerald-200 transition-all">
            <div className="p-4 rounded-2xl bg-blue-50 text-brand-navy flex-shrink-0">
              <Lock className="w-7 h-7 text-[#0B3B82]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#0B3B82]">2. Anonymous Barcoded Diagnostic Testing</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                When you order an at-home testosterone or 7-panel STI test, our phlebotomist arrives in casual plain clothing. Your sample vials are tagged with anonymous barcode numbers—your name is never placed on the collection tubes or visible to lab technicians.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft flex items-start gap-5 hover:border-emerald-200 transition-all">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0">
              <EyeOff className="w-7 h-7 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#0B3B82]">3. Camera-Off Audio Teleconsultation Chamber</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                You have full control over your consultation. By default, your camera remains off for complete privacy. You can discuss your intimate concerns comfortably via secure audio, or toggle video on only if you choose to.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-card-soft flex items-start gap-5 hover:border-emerald-200 transition-all">
            <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 flex-shrink-0">
              <ShieldCheck className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#0B3B82]">4. HIPAA Compliant 256-Bit SSL Data Encryption</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                Medical notes, lab results, and consultation records are stored in ISO 27001 and HIPAA compliant encrypted vaults. Only you and your treating doctor can access your health data. We never sell or share patient records with third parties.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
