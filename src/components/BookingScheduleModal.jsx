import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AppointmentScheduler from './AppointmentScheduler';

export default function BookingScheduleModal({ onClose, onBookingSuccess }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Book Appointment"
      className="booking-schedule-dialog m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-7xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-2 sm:px-6 sm:py-3">
        <span className="text-sm font-semibold text-brand-navy">Schedule your consultation</span>
        <button type="button" autoFocus onClick={onClose} aria-label="Close booking" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy"><X className="h-5 w-5" /></button>
      </div>
      <AppointmentScheduler onClose={onClose} onBookingSuccess={onBookingSuccess} />
    </dialog>
  );
}
