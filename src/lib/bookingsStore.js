const STORAGE_KEY = 'nayacura_bookings_v1';
const EVENT = 'nayacura:bookings';

const hasWindow = () => typeof window !== 'undefined';

export const normalizeDoctorName = (name) =>
  String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');

function readStoredBookings() {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredBookings(items) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: items }));
  } catch {
    /* storage may be blocked */
  }
}

function mergeBookings(incoming, existing) {
  const byId = new Map();
  for (const item of [...incoming, ...existing]) {
    const key = String(item?.id || item?.reference || '').trim();
    if (!key) continue;
    const prev = byId.get(key) || {};
    byId.set(key, { ...prev, ...item, id: key, reference: key });
  }
  return [...byId.values()].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function recordBooking(booking) {
  if (!booking) return;
  const id = String(booking.id || booking.reference || '').trim();
  if (!id) return;
  const entry = {
    ...booking,
    id,
    reference: id,
    createdAt: booking.createdAt || new Date().toISOString(),
  };
  const next = mergeBookings([entry], readStoredBookings());
  writeStoredBookings(next);
}

export function listDoctorBookings(doctorName) {
  const target = normalizeDoctorName(doctorName);
  if (!target) return [];
  return readStoredBookings().filter(
    (item) => normalizeDoctorName(item.doctorName) === target,
  );
}

export async function hydrateDoctorBookings(doctorName) {
  if (!hasWindow() || !doctorName) return [];
  try {
    const response = await fetch(
      `/api/booking-requests?doctorName=${encodeURIComponent(doctorName)}`,
      { credentials: 'include', cache: 'no-store' },
    );
    if (!response.ok) return listDoctorBookings(doctorName);
    const data = await response.json();
    const remote = Array.isArray(data?.bookings) ? data.bookings : [];
    const target = normalizeDoctorName(doctorName);
    const otherDoctorItems = readStoredBookings().filter(
      (item) => normalizeDoctorName(item.doctorName) !== target,
    );
    // Keep remote rows authoritative for the queried doctor while preserving any
    // purely offline bookings created in the current browser before remote sync.
    const existingForDoctor = listDoctorBookings(doctorName);
    const mergedForDoctor = mergeBookings(remote, existingForDoctor);
    writeStoredBookings([...mergedForDoctor, ...otherDoctorItems]);
    return mergedForDoctor;
  } catch {
    return listDoctorBookings(doctorName);
  }
}

export function subscribeBookings(callback) {
  if (!hasWindow()) return () => {};
  const local = () => callback();
  const storage = (event) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener(EVENT, local);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(EVENT, local);
    window.removeEventListener('storage', storage);
  };
}

function formatBookingTime(booking) {
  if (booking.when) return booking.when;
  if (booking.startAt) {
    const parsed = new Date(booking.startAt);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(parsed);
    }
  }
  return [booking.dateLabel || booking.day, booking.slotLabel || booking.timeSlot]
    .filter(Boolean)
    .join(' • ') || 'Scheduled';
}

export function toDoctorQueueEntry(booking) {
  return {
    id: booking.id || booking.reference,
    name: booking.patientName || 'Patient',
    gender: booking.gender || '',
    age: booking.age || '',
    phone: booking.phone || booking.patientPhone || '',
    time: formatBookingTime(booking),
    room: 'Encrypted Online Room',
    chiefComplaint: booking.reason || 'Confidential online consultation (Video / Audio)',
    status: booking.status || 'Confirmed',
    type: 'online',
    fee: booking.feeRupees ?? booking.fee ?? 599,
    history: booking.reason || '',
    startAt: booking.startAt || null,
    createdAt: booking.createdAt || null,
  };
}
