import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSameDay, TODAY } from '../lib/appointmentDates';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const monthLabel = (date) => date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export default function PatientCalendar({ markedDates = [], selectedDate, onSelectDate }) {
  const today = TODAY;
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];

  const markCount = (date) => markedDates.reduce(
    (total, marked) => total + (isSameDay(marked, date) ? 1 : 0),
    0,
  );

  const shiftMonth = (delta) => setViewMonth(
    (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1),
  );

  const jumpToToday = () => {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate?.(today);
  };

  return (
    <section aria-label="Appointment calendar" className="rounded-2xl border border-[#DCE7F6] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-[#0B3B82]">{monthLabel(viewMonth)}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#DCE7F6] text-[#0B3B82] transition-colors hover:bg-[#F0F6FF]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={jumpToToday}
            className="rounded-lg border border-[#DCE7F6] px-2.5 py-1.5 text-xs font-bold text-[#0B3B82] transition-colors hover:bg-[#F0F6FF]"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#DCE7F6] text-[#0B3B82] transition-colors hover:bg-[#F0F6FF]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {WEEK_DAYS.map((label, index) => (
          <span key={`${label}-${index}`} className="py-1">{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;
          const marks = markCount(date);
          const selected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const label = `${date.getDate()} ${monthLabel(date)}${marks ? `, ${marks} appointment${marks > 1 ? 's' : ''}` : ''}`;
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate?.(date)}
              aria-pressed={selected}
              aria-label={label}
              className={`relative flex h-11 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-[#0B3B82] text-white shadow-sm'
                  : marks
                    ? 'text-[#0B3B82] hover:bg-emerald-50'
                    : 'text-slate-600 hover:bg-[#F0F6FF]'
              } ${isToday && !selected ? 'ring-1 ring-inset ring-[#16A34A]' : ''}`}
            >
              <span>{date.getDate()}</span>
              {marks > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${selected ? 'bg-emerald-300' : 'bg-[#16A34A]'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E1E7EF] pt-3 text-[11px] font-semibold text-[#526987]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />Appointment booked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full ring-1 ring-[#16A34A]" />Today
        </span>
      </div>
    </section>
  );
}
