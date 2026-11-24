import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Globe2, MapPin, ShieldCheck, Sunrise, Sun, Sunset } from 'lucide-react';
import { DOCTORS } from '../data/healthcareData';
import { BOOKING_SERVICES } from '../data/bookingServices';

const TIME_ZONE = 'Asia/Kolkata';
const dateLabel = date => date.toLocaleDateString('en-IN', { timeZone: TIME_ZONE, day: 'numeric', month: 'short', year: 'numeric' });
const minutes = slot => {
  const [time, period] = slot.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  return (hour % 12 + (period === 'PM' ? 12 : 0)) * 60 + minute;
};
const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-navy';
const focusClass = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2';

export default function AppointmentScheduler({ onBookingSuccess, onClose }) {
  const [serviceId, setServiceId] = useState(BOOKING_SERVICES[0].id);
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [step, setStep] = useState('schedule');
  const [booking, setBooking] = useState(null);
  const [patient, setPatient] = useState({ name: '', phone: '', reason: '' });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const [dates] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const value = type => parts.find(part => part.type === type).value;
    const today = new Date(`${value('year')}-${value('month')}-${value('day')}T12:00:00+05:30`);
    return Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 86400000));
  });
  const service = BOOKING_SERVICES.find(item => item.id === serviceId);
  const doctor = DOCTORS.find(item => item.id === service.doctorId);
  const nowParts = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const currentMinute = Number(nowParts.find(p => p.type === 'hour').value) * 60 + Number(nowParts.find(p => p.type === 'minute').value);
  const availableForDay = index => {
    const slots = index === 0 ? (doctor.availableToday ? doctor.slots.today : []) : index === 1 ? doctor.slots.tomorrow : [];
    return slots.filter(slot => index !== 0 || minutes(slot) > currentMinute);
  };
  const available = availableForDay(dayIndex);
  const allSlots = [...new Set([
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
    ...available,
  ])].sort((a, b) => minutes(a) - minutes(b));
  const groups = [
    { title: 'Morning', Icon: Sunrise, slots: allSlots.filter(slot => minutes(slot) < 720) },
    { title: 'Afternoon', Icon: Sun, slots: allSlots.filter(slot => minutes(slot) >= 720 && minutes(slot) < 1020) },
    { title: 'Evening', Icon: Sunset, slots: allSlots.filter(slot => minutes(slot) >= 1020) },
  ];

  const confirmBooking = event => {
    event.preventDefault();
    if (!available.includes(selectedSlot) || booking) return;
    const newBooking = {
      id: `NC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      doctorName: doctor.name, doctorSpecialty: doctor.specialty, doctorPhoto: doctor.photo,
      serviceId: service.id, serviceName: service.name,
      clinicName: doctor.clinicName, clinicAddress: doctor.clinicAddress,
      day: dateLabel(dates[dayIndex]), timeSlot: selectedSlot, timeZone: TIME_ZONE,
      patientName: patient.name.trim(), patientPhone: patient.phone, reason: patient.reason.trim(),
      fee: doctor.fee, type: 'clinic', status: 'Confirmed',
    };
    onBookingSuccess(newBooking);
    setBooking(newBooking);
    setStep('success');
  };

  return (
    <section className="bg-[#FCFCFD] text-[#25272D]">
      <div className="mx-auto grid min-h-[650px] max-w-[1440px] lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.55fr)]">
        <aside className={`${step === 'schedule' ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col border-b border-slate-200 bg-white px-4 py-5 sm:px-10 sm:py-9 lg:border-b-0 lg:border-r lg:py-12`}>
          <ShieldCheck className="mb-7 hidden sm:block h-12 w-12 fill-blue-100 text-[#1686E8]" aria-hidden="true" />
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Book Appointment</h1>
          <p className="mt-6 hidden sm:block max-w-sm text-lg leading-relaxed text-slate-500">Choose a convenient time for your private consultation with a Nayacura specialist.</p>
          <label className="mt-4 sm:mt-8 text-sm font-medium text-slate-500">
            Services
            <select aria-label="Choose a sexual wellness service" value={serviceId} disabled={step === 'success'} onChange={e => { setServiceId(e.target.value); setSelectedSlot(''); setDayIndex(0); setStep('schedule'); }} className={inputClass}>
              {BOOKING_SERVICES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <p className="mt-3 text-sm font-medium text-brand-navy">{doctor.name}</p>
          <p className="mt-1 text-sm text-slate-500">{doctor.specialty}</p>
          <p className="mt-5 hidden sm:flex items-start gap-2 text-sm leading-relaxed text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{doctor.clinicName}, {doctor.city}</p>
          <details className="mt-3 text-sm text-slate-500 sm:hidden"><summary className="cursor-pointer py-2 font-medium text-brand-navy">View clinic details</summary><p className="mt-1">{doctor.clinicName}</p><p>{doctor.clinicAddress}</p></details>
          <p className="mt-4 font-semibold text-brand-navy">₹{doctor.fee} <span className="text-sm font-normal text-slate-500">· Pay at clinic</span></p>
          <p className="mt-3 sm:mt-6 text-xs leading-relaxed text-slate-400">Demo availability. Bookings are saved for this session only.</p>
          <div className="hidden lg:block mt-8 pt-6 lg:mt-auto">
            {step === 'details' ? <button type="button" onClick={() => setStep('schedule')} className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[#1686E8] ${focusClass}`}><ArrowLeft className="h-4 w-4" /> Back</button>
              : <button type="button" onClick={onClose} className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[#1686E8] ${focusClass}`}><ArrowLeft className="h-4 w-4" /> Back</button>}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col px-4 py-5 sm:px-10 sm:py-9 lg:px-12 lg:py-12">
          {step === 'details' && <button type="button" onClick={() => setStep('schedule')} className={`mb-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-navy lg:hidden ${focusClass}`}><ArrowLeft className="h-4 w-4" /> Change date or time</button>}
          {step === 'schedule' && <>
            <h2 className="text-base text-slate-500">Availability</h2>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-3 sm:gap-5" aria-label="Choose appointment date">
              {dates.map((date, index) => {
                const count = availableForDay(index).length;
                return <div key={date.toISOString()} className="w-[78px] shrink-0 text-center">
                  <button type="button" disabled={!count} aria-pressed={dayIndex === index} aria-label={`${dateLabel(date)}, ${count} slots`} onClick={() => { setDayIndex(index); setSelectedSlot(''); }} className={`flex h-[78px] w-full flex-col items-center justify-center gap-1 rounded-2xl border ${focusClass} ${dayIndex === index ? 'border-[#1686E8] bg-[#1686E8] text-white shadow-md' : 'border-slate-200 bg-white shadow-sm hover:border-blue-400'} disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#F2F3F5] disabled:text-slate-300 disabled:shadow-none`}>
                    <span className="text-xs uppercase">{index === 0 ? 'Today' : date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: TIME_ZONE })}</span>
                    <span className="text-2xl font-semibold">{date.toLocaleDateString('en-IN', { day: 'numeric', timeZone: TIME_ZONE })}</span>
                  </button>
                  <p className="mt-2 text-sm text-slate-400">{count ? `${count} slots` : 'Unavailable'}</p>
                </div>;
              })}
            </div>
            <div className="mb-7 mt-8 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Available Slots</h2>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-base"><Globe2 className="h-5 w-5 text-slate-400" aria-hidden="true" /> Asia/Kolkata</span>
            </div>
            <div className="space-y-7">
              {groups.map(({ title, Icon, slots }) => <fieldset key={title}>
                <legend className="mb-3 flex items-center gap-2 text-base text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" />{title}</legend>
                <div className="flex flex-wrap gap-3">{slots.map(slot => <button key={slot} type="button" disabled={!available.includes(slot)} aria-pressed={selectedSlot === slot} onClick={() => setSelectedSlot(slot)} className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-medium ${focusClass} ${selectedSlot === slot ? 'border-[#1686E8] bg-[#1686E8] text-white shadow-sm' : 'border-slate-200 bg-white shadow-sm hover:border-blue-400'} disabled:cursor-not-allowed disabled:border-transparent disabled:bg-[#F2F3F5] disabled:text-slate-400 disabled:shadow-none`}>{slot}</button>)}</div>
              </fieldset>)}
            </div>
            {!available.length && <p role="status" className="mt-6 text-sm text-slate-500">No slots available for this date. Choose another day or specialist.</p>}
            <div className="mt-auto flex flex-col justify-between gap-5 pt-12 sm:flex-row sm:items-end">
              <p aria-live="polite" className="max-w-xs text-sm leading-relaxed text-slate-500">{selectedSlot ? `${dateLabel(dates[dayIndex])} at ${selectedSlot} · Asia/Kolkata` : 'Select an available date and time to schedule your private consultation.'}</p>
              <button type="button" disabled={!available.includes(selectedSlot)} onClick={() => setStep('details')} className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#1686E8] px-5 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#DFDFDF] disabled:text-[#A0A0A0] ${focusClass}`}>Confirm Schedule <ArrowRight className="h-5 w-5" /></button>
            </div>
          </>}

          {step === 'details' && <form onSubmit={confirmBooking} className="mx-auto w-full max-w-xl space-y-6">
            <div><h2 className="text-2xl font-semibold">Your booking details</h2><p className="mt-3 font-medium text-brand-navy">{service.name}</p><p className="mt-2 text-slate-500">{dateLabel(dates[dayIndex])} · {selectedSlot} · Asia/Kolkata</p></div>
            <label className="block text-sm font-medium">Patient name<input required autoComplete="name" maxLength={100} value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} pattern=".*\S.*" className={inputClass} /></label>
            <label className="block text-sm font-medium">Mobile number (+91)<input required type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[0-9]{10}" title="Enter a 10-digit mobile number" value={patient.phone} onChange={e => setPatient({ ...patient, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} className={inputClass} /></label>
            <label className="block text-sm font-medium">Reason for visit <span className="text-slate-400">(optional)</span><textarea rows={3} maxLength={1000} value={patient.reason} onChange={e => setPatient({ ...patient, reason: e.target.value })} className={inputClass} /></label>
            <p className="text-sm text-slate-500">Consultation fee: ₹{doctor.fee}. Pay at the clinic.</p>
            <button type="submit" className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-brand-navy px-5 py-3 font-semibold text-white hover:bg-brand-navy-dark ${focusClass}`}>Confirm Appointment <ArrowRight className="h-5 w-5" /></button>
          </form>}

          {step === 'success' && <div role="status" className="mx-auto my-auto w-full max-w-xl space-y-6 py-10">
            <CheckCircle2 className="h-14 w-14 text-brand-green" />
            <h2 className="text-3xl font-semibold">Appointment confirmed</h2>
            <p className="text-slate-500">Your demo booking is now in My Bookings.</p>
            <dl className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              {Object.entries({ 'Booking reference': booking.id, Service: booking.serviceName, Specialist: booking.doctorName, Patient: booking.patientName, 'Date & time': `${booking.day} · ${booking.timeSlot}`, 'Time zone': TIME_ZONE, Clinic: booking.clinicAddress, Fee: `₹${booking.fee} · Pay at clinic` }).map(([label, value]) => <div key={label}><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}
            </dl>
            <button type="button" onClick={onClose} className={`inline-flex rounded-xl bg-brand-navy px-5 py-3 font-semibold text-white ${focusClass}`}>Done & Close</button>
          </div>}
        </div>
      </div>
    </section>
  );
}
