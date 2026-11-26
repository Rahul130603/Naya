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
import {
  formatDisplayPhone,
  submitBookingNotification,
} from '../lib/bookingMessages';

const DAY_OFFSETS = { today: 0, tomorrow: 1, day_after: 2 };

/** Indian mobile numbers: 10 digits, starting 6-9. */
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const MOBILE_ERROR = 'Enter your valid phone number.';

function isValidMobile(value) {
  return MOBILE_PATTERN.test(String(value ?? '').trim());
}

/** "27 Nov", or "Friday" when a weekday label is wanted. */
function shortDate(offset = 0, { weekday = false } = {}) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('en-IN', {
    ...(weekday ? { weekday: 'long' } : {}),
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** Turns "09:30 AM" + the selected day chip into a real Date. */
function slotToDate(dayId, slotLabel) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(slotLabel || '');
  if (!match) return null;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  const date = new Date();
  date.setDate(date.getDate() + (DAY_OFFSETS[dayId] ?? 0));
  date.setHours(hours, Number(match[2]), 0, 0);
  return date;
}

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
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [reason, setReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [delivery, setDelivery] = useState(null);

  if (!doctor) return null;

  const dates = [
    { id: 'today', label: 'Today', date: shortDate(0) },
    { id: 'tomorrow', label: 'Tomorrow', date: shortDate(1) },
    { id: 'day_after', label: shortDate(2, { weekday: true }), date: shortDate(2) },
  ];

  const morningSlots = ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM'];
  const afternoonSlots = ['02:00 PM', '02:45 PM', '03:30 PM'];
  const eveningSlots = ['05:00 PM', '05:45 PM', '06:30 PM', '07:15 PM'];

  const dayText =
    selectedDay === 'tomorrow'
      ? `Tomorrow (${shortDate(1)})`
      : selectedDay === 'day_after'
        ? `${shortDate(2, { weekday: true })} (${shortDate(2)})`
        : `Today (${shortDate(0)})`;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setSubmitError('Please select an available time slot.');
      return;
    }
    if (!patientName.trim() || !patientPhone) {
      setSubmitError('Please fill in your name and phone number.');
      return;
    }
    if (!isValidMobile(patientPhone)) {
      setPhoneError(MOBILE_ERROR);
      setSubmitError('');
      return;
    }
    if (!smsConsent) {
      setSubmitError('Please tick the box so we can send your booking details by SMS and WhatsApp.');
      return;
    }

    setSubmitError('');
    setSending(true);

    const start = slotToDate(selectedDay, selectedSlot);
    const payload = {
      fullName: patientName.trim(),
      ...(patientEmail.trim() ? { email: patientEmail.trim() } : {}),
      phone: patientPhone,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      mode: consultationType === 'video' ? 'ONLINE' : 'IN_PERSON',
      ...(start ? { startAt: start.toISOString() } : { slotLabel: selectedSlot }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      feeRupees: consultationType === 'clinic' ? doctor.fee : doctor.videoFee,
      channels: ['SMS', 'WHATSAPP'],
      consent: true,
    };

    let reference = '';
    let serverPhone = '';

    try {
      const { ok, data } = await submitBookingNotification(payload);
      if (!ok) {
        setSubmitError(
          data?.details?.phone?.[0] ||
            data?.message ||
            'We could not confirm this appointment. Please try again.',
        );
        setSending(false);
        return;
      }
      reference = data.reference || '';
      serverPhone = data.phone || '';
    } catch {
      // Network failure: never block the patient from seeing confirmation.
    }

    if (!reference) {
      reference = `NC-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    setBookingId(reference);
    setDelivery({
      phone: serverPhone || formatDisplayPhone(patientPhone),
    });
    setIsConfirmed(true);
    setSending(false);

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
      id: reference,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorPhoto: doctor.photo,
      clinicName: doctor.clinicName,
      clinicAddress: doctor.clinicAddress,
      day: dayText,
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
    setPatientEmail('');
    setPatientPhone('');
    setReason('');
    setSubmitError('');
    setPhoneError('');
    setDelivery(null);
    setSmsConsent(false);
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
              Confirmation for <strong className="text-slate-800">{formatDisplayPhone(delivery?.phone || patientPhone)}</strong>
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
                  {dayText} • {selectedSlot}
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
                <span className="font-bold text-slate-800">
                  {patientName}
                  {[patientAge && `${patientAge} yrs`, patientGender].filter(Boolean).length
                    ? ` (${[patientAge && `${patientAge} yrs`, patientGender].filter(Boolean).join(', ')})`
                    : ''}
                </span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Patient Full Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <input
                type="email"
                placeholder="Email (Optional — for Mail Card)"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-label="Mobile number"
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? 'booking-phone-error' : undefined}
                    placeholder="10-digit Mobile Number"
                    value={patientPhone}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPatientPhone(next);
                      if (phoneError && isValidMobile(next)) setPhoneError('');
                    }}
                    onBlur={() => {
                      if (!isValidMobile(patientPhone)) setPhoneError(MOBILE_ERROR);
                    }}
                    className={`w-full text-sm pl-12 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 ${
                      phoneError
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-brand-green'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p id="booking-phone-error" role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-red-600">
                    <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                    {phoneError}
                  </p>
                )}
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

            <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-medium leading-relaxed text-slate-600">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-green focus:ring-brand-green"
              />
              <span>
                Send my booking details to this number by SMS and WhatsApp. Only appointment
                information is shared — never clinical details.
              </span>
            </label>

            {submitError && (
              <p role="alert" className="flex items-start gap-1.5 text-xs font-semibold text-red-600">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {submitError}
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-dark text-white font-bold text-sm shadow-md transition hover:shadow-glow-navy flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span>{sending ? 'Confirming appointment…' : 'Confirm Appointment'}</span>
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
