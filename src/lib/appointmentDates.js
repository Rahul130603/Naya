const MONTH_INDEX = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const isSameDay = (a, b) => Boolean(a && b)
  && a.getFullYear() === b.getFullYear()
  && a.getMonth() === b.getMonth()
  && a.getDate() === b.getDate();

// Created once per page load so demos and calendars stay stable across re-renders.
export const TODAY = startOfDay(new Date());
export const TOMORROW = addDays(TODAY, 1);

// Bookings arrive from several demo flows, so accept an ISO date first and then
// fall back to the human labels those flows use ("Today (23 Nov)", "24 Nov 2026").
export function parseAppointmentDate(appointment) {
  if (!appointment) return null;
  if (appointment.date) {
    const parsed = new Date(appointment.date);
    if (!Number.isNaN(parsed.getTime())) return startOfDay(parsed);
    if (/today/i.test(appointment.date)) return startOfDay(new Date());
    if (/tomorrow/i.test(appointment.date)) return addDays(startOfDay(new Date()), 1);
  }
  const label = String(appointment.day || '');
  if (/today/i.test(label)) return startOfDay(new Date());
  if (/tomorrow/i.test(label)) return addDays(startOfDay(new Date()), 1);
  const match = label.match(/(\d{1,2})\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*(\d{4})?/i);
  if (match) {
    const month = MONTH_INDEX[match[2].slice(0, 3).toLowerCase()];
    const year = match[3] ? Number(match[3]) : new Date().getFullYear();
    return new Date(year, month, Number(match[1]));
  }
  return null;
}

export const formatDayLabel = (date) => (date
  ? date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  : '');

export const formatShortDate = (date) => (date
  ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  : '');
