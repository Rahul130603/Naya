import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from './ui/Modal';

export default function BookingModal({ 
  isOpen, 
  onClose, 
  doctor, 
  onBookingSuccess,
  consultationType = 'clinic' // 'clinic' | 'video'
}) {
  const [selectedDay, setSelectedDay] = useState('today'); // 'today' | 'tomorrow' | 'day_after'
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [reason, setReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');

  if (!doctor) return null;

  const dates = [
    { id: 'today', label: 'Today', date: '23 Nov' },
    { id: 'tomorrow', label: 'Tomorrow', date: '24 Nov' },
    { id: 'day_after', label: 'Wednesday', date: '25 Nov' },
  ];

  const morningSlots = ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM'];
  const afternoonSlots = ['02:00 PM', '02:45 PM', '03:30 PM'];
  const eveningSlots = ['05:00 PM', '05:45 PM', '06:30 PM', '07:15 PM'];

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select an available time slot.');
      return;
    }
    if (!patientName || !patientPhone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    const randomId = 'NC-' + Math.floor(100000 + Math.random() * 900000);
    setBookingId(randomId);
    setIsConfirmed(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti not available', err);
    }

    const newBooking = {
      id: randomId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorPhoto: doctor.photo,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      day: selectedDay === 'today' ? 'Today (23 Nov)' : selectedDay === 'tomorrow' ? 'Tomorrow (24 Nov)' : '25 Nov',
      timeSlot: selectedSlot,
      patientName,
      patientPhone,
      fee: consultationType === 'clinic' ? doctor.fee : doctor.videoFee,
      type: consultationType,
      status: 'Confirmed'
    };

    onBookingSuccess(newBooking);
  };

  const handleResetAndClose = () => {
    setIsConfirmed(false);
    setSelectedSlot('');
    setPatientName('');
    setPatientPhone('');
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isConfirmed ? "Appointment Confirmed!" : `Book ${consultationType === 'clinic' ? 'In-Clinic Visit' : 'Video Consult'}`}
      subtitle={isConfirmed ? "Your appointment has been registered with the doctor." : `With ${doctor.name}`}
      maxWidth="max-w-xl"
    >
      {isConfirmed ? (
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Reference</span>
            <div className="text-2xl font-black text-brand-navy tracking-tight mt-0.5">{bookingId}</div>
            <p className="text-xs text-slate-500 mt-1">
              Confirmation SMS & WhatsApp details sent to <strong className="text-slate-800">+91 {patientPhone}</strong>
            </p>
          </div>

          {/* Booking Summary Ticket */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <img src={doctor.photo} alt={doctor.name} className="w-12 h-12 rounded-full object-cover border" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{doctor.name}</h4>
                <p className="text-xs text-brand-green font-semibold">{doctor.specialty}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Date & Time</span>
                <span className="font-bold text-slate-800">
                  {selectedDay === 'today' ? 'Today (23 Nov)' : 'Tomorrow (24 Nov)'} • {selectedSlot}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Consultation Fee</span>
                <span className="font-bold text-brand-navy">
                  ₹{consultationType === 'clinic' ? doctor.fee : doctor.videoFee} (Pay at Clinic)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Patient Name</span>
                <span className="font-bold text-slate-800">{patientName} ({patientAge} yrs, {patientGender})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Consultation Mode</span>
                <span className="font-bold text-emerald-600 capitalize">{consultationType} Consultation</span>
              </div>
            </div>

            {consultationType === 'clinic' && (
              <div className="pt-2 text-xs border-t border-slate-200 text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-800">{doctor.clinicName}</strong>
                  <p className="text-slate-500">{doctor.clinicAddress}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-sm shadow-md transition"
            >
              Done & Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-6">
          
          {/* Doctor Brief Card */}
          <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <img src={doctor.photo} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover border" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-900 text-sm truncate">{doctor.name}</h4>
              <p className="text-xs text-brand-green font-semibold">{doctor.specialty}</p>
              <p className="text-xs text-slate-500 truncate">{doctor.clinicName} • ₹{consultationType === 'clinic' ? doctor.fee : doctor.videoFee}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-brand-green-dark">
                Verified
              </span>
            </div>
          </div>

          {/* 1. Select Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Select Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dates.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => {
                    setSelectedDay(d.id);
                    setSelectedSlot('');
                  }}
                  className={`p-3 rounded-2xl border text-center transition ${
                    selectedDay === d.id
                      ? 'border-brand-navy bg-brand-navy/5 text-brand-navy font-bold ring-2 ring-brand-navy/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-semibold">{d.label}</div>
                  <div className="text-sm font-extrabold mt-0.5">{d.date}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Select Time Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Select Time Slot
            </label>
            
            {/* Morning */}
            <div className="mb-3">
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Morning</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {morningSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedSlot === slot
                        ? 'bg-brand-green text-white border-brand-green shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Evening</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {eveningSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      selectedSlot === slot
                        ? 'bg-brand-green text-white border-brand-green shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {selectedSlot && (
              <p className="mt-2 text-xs text-brand-green font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Selected Slot: {selectedSlot} ({selectedDay.toUpperCase()})
              </p>
            )}
          </div>

          {/* 3. Patient Details Form */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Patient Details
            </label>

            <div>
              <input
                type="text"
                required
                placeholder="Patient Full Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                <input
                  type="tel"
                  required
                  placeholder="10-digit Mobile Number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full text-sm pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Age (e.g. 28)"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <input
              type="text"
              placeholder="Reason for visit / Symptom (Optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-sm shadow-md transition hover:shadow-glow-navy flex items-center justify-center gap-2"
          >
            <span>Confirm Appointment</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            No advance payment needed. Pay ₹{consultationType === 'clinic' ? doctor.fee : doctor.videoFee} directly at clinic.
          </p>
        </form>
      )}
    </Modal>
  );
}
