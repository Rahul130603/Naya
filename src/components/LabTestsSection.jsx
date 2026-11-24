import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  FileCheck, 
  Home, 
  Sparkles,
  Percent,
  Calendar,
  Lock,
  Package
} from 'lucide-react';
import { LAB_PACKAGES } from '../data/healthcareData';
import Modal from './ui/Modal';
import confetti from 'canvas-confetti';
import MagneticButton from './ui/MagneticButton';
import ShinyText from './ui/ShinyText';

export default function LabTestsSection({ selectedCity, onTestBooked }) {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [sampleAddress, setSampleAddress] = useState('');
  const [collectionSlot, setCollectionSlot] = useState('07:00 AM - 08:00 AM');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleOpenBooking = (pkg) => {
    setSelectedPkg(pkg);
    setIsModalOpen(true);
    setIsSuccess(false);
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    const id = 'NC-LAB-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(id);
    setIsSuccess(true);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {}

    if (onTestBooked) {
      onTestBooked({
        id,
        packageName: selectedPkg.title,
        price: selectedPkg.price,
        patientName,
        patientPhone,
        address: sampleAddress,
        slot: collectionSlot,
        date: 'Tomorrow Morning',
        status: 'Discreet Sample Pickup Scheduled'
      });
    }
  };

  return (
    <section id="lab-tests" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Lab Tests Banner Card styled with user's mint green wave design */}
        <div 
          className="p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-sm mb-12 relative overflow-hidden transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
              <ShinyText text="100% Confidential & Anonymous Diagnostic Testing" className="text-xs uppercase tracking-wider" />
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3.5 tracking-tight text-[#0B3B82]">
              Discreet At-Home Hormone & STI Testing
            </h2>
            
            <p className="mt-2.5 text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
              Testosterone, hormone panels, and complete STI screening in {selectedCity}. Samples collected in plain unbranded packaging with anonymous barcode tracking and 24-hour digital delivery.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <MagneticButton
                onClick={() => {
                  const el = document.getElementById('lab-packages');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold rounded-2xl shadow-md transition-all text-xs"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Book Diagnostic Test Package</span>
              </MagneticButton>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <Package className="w-4 h-4 text-[#16A34A]" />
                <span>100% Plain Unbranded Outer Box</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>NABL & ICMR Certified Lab Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Package className="w-6 h-6 text-brand-green flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800">100% Plain Packaging</div>
              <div className="text-[11px] text-slate-500">No medical labels on kit</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Lock className="w-6 h-6 text-brand-navy flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800">Anonymous Barcoding</div>
              <div className="text-[11px] text-slate-500">Your name is hidden</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800">Private Report in 12-24 Hrs</div>
              <div className="text-[11px] text-slate-500">Encrypted PDF download</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-800">Free Doctor Review</div>
              <div className="text-[11px] text-slate-500">Follow-up with Sexologist</div>
            </div>
          </div>
        </div>

        {/* Lab Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LAB_PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                pkg.popular 
                  ? 'border-brand-green bg-gradient-to-b from-emerald-50/30 to-white shadow-card-soft ring-2 ring-brand-green/20' 
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    pkg.popular ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {pkg.badge}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                    {pkg.discount}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-navy leading-snug">
                  {pkg.title}
                </h3>

                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">
                    {pkg.parameters} Biomarkers Included
                  </span>
                  <span>{pkg.sampleType}</span>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 italic">
                  * {pkg.fastingRequired}
                </div>

                {/* Included Tests List */}
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Key Markers Tested:
                  </div>
                  {pkg.testsIncluded.slice(0, 5).map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-green flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{t}</span>
                    </div>
                  ))}
                  {pkg.testsIncluded.length > 5 && (
                    <div className="text-[11px] font-semibold text-brand-green pl-5">
                      +{pkg.testsIncluded.length - 5} more markers
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-brand-navy">₹{pkg.price}</span>
                  <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(pkg)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                    pkg.popular
                      ? 'bg-brand-green hover:bg-brand-green-dark text-white'
                      : 'bg-brand-navy hover:bg-brand-navy-dark text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Book Discreet Collection</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Lab Booking Modal */}
      {selectedPkg && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isSuccess ? "Discreet Sample Pickup Scheduled!" : "Book At-Home Confidential Testing"}
          subtitle={isSuccess ? `Order Reference: ${orderId}` : selectedPkg.title}
          maxWidth="max-w-lg"
        >
          {isSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-brand-navy">Order Confirmed with 100% Privacy</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Our phlebotomist will arrive in normal plain attire with an unbranded sealed kit during <strong>{collectionSlot}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Panel:</span>
                  <span className="font-bold text-slate-800">{selectedPkg.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Due:</span>
                  <span className="font-bold text-brand-navy">₹{selectedPkg.price} (Pay on sample collection)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Packaging:</span>
                  <span className="font-bold text-emerald-600">100% Plain Unbranded Box</span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-navy text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                <span className="font-bold text-brand-green-dark">Special Package Price:</span>
                <span className="font-extrabold text-base text-brand-navy">₹{selectedPkg.price}</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Patient Name (Or Pseudonym)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number (For encrypted report link)</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Address for Sample Pickup</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Address or private pickup location"
                  value={sampleAddress}
                  onChange={(e) => setSampleAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Preferred Morning Time Slot</label>
                <select
                  value={collectionSlot}
                  onChange={(e) => setCollectionSlot(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option>06:30 AM - 07:30 AM</option>
                  <option>07:30 AM - 08:30 AM</option>
                  <option>08:30 AM - 09:30 AM</option>
                  <option>09:30 AM - 10:30 AM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs shadow-md transition"
              >
                Confirm Confidential Pickup
              </button>

              <p className="text-[10px] text-center text-slate-400">
                Samples are tagged with anonymous barcoded vials. No medical diagnosis printed on box.
              </p>
            </form>
          )}
        </Modal>
      )}

    </section>
  );
}
