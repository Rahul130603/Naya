import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Check, ChevronLeft, ChevronRight, Video, X } from 'lucide-react';
import {
  DAYS,
  SLOT_MINUTES,
  dateKey,
  formatDateLabel,
  hydrateSchedule,
  loadSchedule,
  pushSchedule,
  saveSchedule,
  slotsForDate,
  subscribeSchedule,
  weekdayName,
} from '../lib/practiceSchedule';

const MODE_META = [
  { key: 'online', title: 'Online Consultation (Video & Audio)', Icon: Video },
];

const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const clearExtendedSlots = (sched) => {
  if (!sched) return sched;
  const extended = Object.fromEntries(
    DAYS.map((day) => [day, { online: [] }]),
  );
  const overrides = {};
  for (const [key, dayMap] of Object.entries(sched.overrides || {})) {
    const nextDay = {};
    for (const [mode, override] of Object.entries(dayMap || {})) {
      const rest = { ...(override || {}) };
      delete rest.extended;
      if (Object.keys(rest).length) nextDay[mode] = rest;
    }
    if (Object.keys(nextDay).length) overrides[key] = nextDay;
  }
  return { ...sched, extended, overrides };
};

export default function PracticeScheduleEditor({ onNotify, doctorName }) {
  const [schedule, setSchedule] = useState(() => clearExtendedSlots(loadSchedule(doctorName)));
  const scheduleRef = useRef(schedule);
  scheduleRef.current = schedule;
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = startOfDay(new Date());
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    void hydrateSchedule(doctorName);
    return subscribeSchedule((next) => {
      if (!next) return;
      if (!doctorName || !next.doctorName || next.doctorName.trim().toLowerCase() === doctorName.trim().toLowerCase()) {
        const clean = clearExtendedSlots(next);
        scheduleRef.current = clean;
        setSchedule(clean);
      }
    });
  }, [doctorName]);

  const commit = (updater) => {
    const base = scheduleRef.current;
    const next = typeof updater === 'function' ? updater(base) : updater;
    const clean = clearExtendedSlots(next);
    scheduleRef.current = clean;
    setSchedule(clean);
    saveSchedule(clean, doctorName);
    void pushSchedule(clean, doctorName);
  };

  const selectedKey = dateKey(selectedDate);
  const overrideFor = (mode) => schedule.overrides?.[selectedKey]?.[mode] || {};

  const setOverride = (mode, patch) => {
    commit((prev) => {
      const current = prev.overrides?.[selectedKey]?.[mode] || {};
      const nextOverride = { ...current, ...patch };
      Object.keys(nextOverride).forEach((key) => {
        if (nextOverride[key] === undefined || nextOverride[key] === null || nextOverride[key] === '') {
          delete nextOverride[key];
        }
      });
      const dayOverrides = { ...(prev.overrides?.[selectedKey] || {}) };
      if (Object.keys(nextOverride).length) dayOverrides[mode] = nextOverride;
      else delete dayOverrides[mode];

      const overrides = { ...(prev.overrides || {}) };
      if (Object.keys(dayOverrides).length) overrides[selectedKey] = dayOverrides;
      else delete overrides[selectedKey];

      return { ...prev, overrides };
    });
  };

  const toggleDateSlot = (mode, startMinutes) => {
    const day = weekdayName(selectedDate);
    commit((prev) => {
      const currentOverride = prev.overrides?.[selectedKey]?.[mode] || {};
      const allSlots = slotsForDate(prev, selectedDate, mode, { includeUnselected: true });
      const existingPicked = Array.isArray(currentOverride.slots)
        ? currentOverride.slots
        : Array.isArray(prev.selected?.[day]?.[mode])
          ? prev.selected[day][mode]
          : null;

      const disabled = existingPicked
        ? new Set(allSlots.map((slot) => slot.startMinutes).filter((m) => !existingPicked.includes(m)))
        : new Set(Array.isArray(currentOverride.disabledSlots) ? currentOverride.disabledSlots : []);

      if (disabled.has(startMinutes)) disabled.delete(startMinutes);
      else disabled.add(startMinutes);

      const nextDisabled = [...disabled].sort((a, b) => a - b);
      const nextOverride = { ...currentOverride };
      delete nextOverride.slots;
      if (nextDisabled.length) nextOverride.disabledSlots = nextDisabled;
      else delete nextOverride.disabledSlots;

      const dayOverrides = { ...(prev.overrides?.[selectedKey] || {}) };
      if (Object.keys(nextOverride).length) dayOverrides[mode] = nextOverride;
      else delete dayOverrides[mode];

      const overrides = { ...(prev.overrides || {}) };
      if (Object.keys(dayOverrides).length) overrides[selectedKey] = dayOverrides;
      else delete overrides[selectedKey];

      return { ...prev, overrides };
    });
  };

  const calendar = useMemo(() => {
    const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
    const leading = monthCursor.getDay();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), index + 1),
      ),
    ];
  }, [monthCursor]);

  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const monthTitle = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(monthCursor);
  const selectedWeekday = weekdayName(selectedDate);
  const isToday = selectedDate.getTime() === today.getTime();
  const isTomorrow = selectedDate.getTime() === tomorrow.getTime();
  const dateBadge = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : selectedWeekday;

  const selectedModeSummaries = MODE_META.map((meta) => {
    const mode = schedule.modes?.[meta.key] || { start: '09:00', end: '21:30' };
    const override = overrideFor(meta.key);
    const weeklyOpen = schedule.days?.[selectedWeekday]?.[meta.key] !== false;
    const closed = Boolean(override.closed) || (!weeklyOpen && !override.open);
    const slots = slotsForDate(schedule, selectedDate, meta.key, { includeUnselected: true });
    const activeSlots = slots.filter((slot) => slot.selected);
    const disabledCount = slots.length - activeSlots.length;
    return {
      ...meta,
      mode,
      override,
      slots,
      activeSlots,
      disabledCount,
      totalMinutes: activeSlots.reduce((sum, slot) => sum + slot.duration, 0),
      closed,
    };
  });

  const handlePublish = async () => {
    const clean = clearExtendedSlots(schedule);
    scheduleRef.current = clean;
    setSchedule(clean);
    saveSchedule(clean, doctorName);
    await pushSchedule(clean, doctorName, { immediate: true });
    onNotify?.('Schedule published');
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
      {/* Left rail: Calendar */}
      <section className="rounded-2xl border border-[#DCE7F6] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#DCE7F6] text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-extrabold text-[#0B3B82]">{monthTitle}</span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#DCE7F6] text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {calendar.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;
            const isPast = date < today;
            const isSelected = date.getTime() === selectedDate.getTime();
            const weekday = weekdayName(date);
            const dateOverrides = schedule.overrides?.[dateKey(date)] || {};
            const closedForDate =
              Boolean(dateOverrides.online?.closed) ||
              (schedule.days?.[weekday]?.online === false && !dateOverrides.online?.open);
            const hasOverride = Boolean(dateOverrides.online);

            return (
              <button
                type="button"
                key={date.toISOString()}
                disabled={isPast}
                onClick={() => setSelectedDate(startOfDay(date))}
                aria-pressed={isSelected}
                className={`relative h-9 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-[#0B3B82] text-white shadow-xs'
                    : isPast
                      ? 'cursor-not-allowed text-slate-300'
                      : !closedForDate
                        ? 'text-slate-700 hover:bg-emerald-50 hover:text-[#128D28]'
                        : 'text-slate-400 line-through hover:bg-slate-50'
                }`}
              >
                {date.getDate()}
                {hasOverride && !isSelected && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-3 border-t border-[#EEF3FA] pt-2.5 text-[10px] font-semibold text-slate-500">
          Green dot = custom hours or selected slots
        </p>
      </section>

      {/* Right panel: Today's or chosen calendar date's schedule */}
      <section className="rounded-2xl border border-[#DCE7F6] bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF3FA] px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-[#0B3B82]">{formatDateLabel(selectedDate)}</h4>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0B3B82]">
                {dateBadge}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-[#526987]">
              {selectedWeekday} · availability for this date
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isToday && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(today);
                  setMonthCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#0B3B82] hover:bg-blue-100"
              >
                Jump to Today
              </button>
            )}
            {schedule.overrides?.[selectedKey] && (
              <button
                type="button"
                onClick={() => {
                  const overrides = { ...(schedule.overrides || {}) };
                  delete overrides[selectedKey];
                  commit({ ...schedule, overrides });
                  onNotify?.('Date slots reset to default');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" /> Reset date
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-[#EEF3FA]">
          {selectedModeSummaries.map((item) => {
            const { key, Icon, title, mode, override, slots, activeSlots, disabledCount, totalMinutes, closed } = item;

            return (
              <div key={key} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h5 className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0B3B82]">
                    <Icon className="h-4 w-4 shrink-0 text-[#128D28]" aria-hidden="true" />
                    <span>{title}</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() =>
                      setOverride(
                        key,
                        closed ? { closed: false, open: true } : { closed: true, open: undefined },
                      )
                    }
                    className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                      closed ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-[#128D28] hover:bg-emerald-100'
                    }`}
                  >
                    {closed ? 'Closed on this date — tap to open' : 'Open — tap to close'}
                  </button>
                </div>

                {!closed && (
                  <>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <div className="flex flex-wrap items-end gap-2">
                        <label className="flex flex-col text-[10px] font-bold uppercase tracking-wide text-[#526987]">
                          Opens
                          <input
                            type="time"
                            step={900}
                            value={override.start || mode.start}
                            onChange={(event) => setOverride(key, { start: event.target.value })}
                            className="mt-1 w-[8rem] rounded-lg border border-[#DCE7F6] px-2.5 py-1.5 text-xs font-bold text-[#0B3B82]"
                          />
                        </label>
                        <span className="pb-2 text-xs font-bold text-slate-400">–</span>
                        <label className="flex flex-col text-[10px] font-bold uppercase tracking-wide text-[#526987]">
                          Closes
                          <input
                            type="time"
                            step={900}
                            value={override.end || mode.end}
                            onChange={(event) => setOverride(key, { end: event.target.value })}
                            className="mt-1 w-[8rem] rounded-lg border border-[#DCE7F6] px-2.5 py-1.5 text-xs font-bold text-[#0B3B82]"
                          />
                        </label>
                      </div>
                      <span className="rounded-full border border-[#DCE7F6] bg-[#F8FBFF] px-3 py-1 text-[11px] font-bold text-[#0B3B82]">
                        {activeSlots.length} available
                        {disabledCount > 0 ? ` · ${disabledCount} disabled` : ''}
                        {` · ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                      </span>
                    </div>

                    <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5">
                      {slots.map((slot) => (
                        <button
                          type="button"
                          key={slot.startMinutes}
                          onClick={() => toggleDateSlot(key, slot.startMinutes)}
                          aria-pressed={slot.selected}
                          className={`min-h-11 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition ${
                            slot.selected
                              ? 'border-[#16A34A] bg-emerald-50 text-[#128D28] shadow-2xs hover:bg-emerald-100/70'
                              : 'border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-[#16A34A] hover:text-[#0B3B82]'
                          }`}
                        >
                          <span className={`block leading-tight ${slot.selected ? '' : 'line-through'}`}>
                            {slot.label}
                          </span>
                          <span
                            className={`mt-0.5 block text-[9px] font-semibold ${
                              slot.selected ? 'text-[#128D28]' : 'text-slate-400'
                            }`}
                          >
                            {slot.selected ? `${SLOT_MINUTES} min` : 'Disabled'}
                          </span>
                        </button>
                      ))}
                    </div>

                    {slots.length === 0 && (
                      <p className="mt-2 text-[10px] font-semibold text-slate-400">
                        No slots — check the opening and closing times.
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF3FA] px-5 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#526987]">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#16A34A]" />
            Tap any slot to disable or enable it. Patients see active slots for {formatDateLabel(selectedDate)}.
          </p>
          <button
            type="button"
            onClick={() => void handlePublish()}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#0B3B82] px-3.5 text-xs font-bold text-white transition hover:bg-[#082B5E]"
          >
            <Check className="h-3.5 w-3.5" /> Save schedule
          </button>
        </div>
      </section>
    </div>
  );
}
