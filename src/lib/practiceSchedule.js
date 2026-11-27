const STORAGE_KEY = 'nayacura_practice_schedule_v2';
const EVENT = 'nayacura:practice-schedule';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SLOT_MINUTES = 30;

export const SCHEMA_VERSION = 3;

export const DEFAULT_SCHEDULE = {
  schemaVersion: SCHEMA_VERSION,
  doctorName: null,
  updatedAt: null,
  slotMinutes: SLOT_MINUTES,
  modes: {
    online: { label: 'Online Consultation (Video & Audio)', start: '09:00', end: '21:30' },
  },
  days: DAYS.reduce((acc, day) => {
    acc[day] = { online: day !== 'Sunday' };
    return acc;
  }, {}),
  // Specific 30-minute slot start minutes chosen by the doctor, keyed by weekday + mode.
  selected: {},
  // Kept for backwards compatibility with older saved payloads.
  extended: DAYS.reduce((acc, day) => {
    acc[day] = { online: [] };
    return acc;
  }, {}),
  // Per-date overrides: { '2026-12-01': { online: { closed: true, disabledSlots: [780] } } }
  overrides: {},
};

const hasWindow = () => typeof window !== 'undefined';

const clone = (value) => JSON.parse(JSON.stringify(value));

function storageKeyFor(doctorName) {
  const normalized = String(doctorName || '').trim().toLowerCase();
  return normalized ? `${STORAGE_KEY}:${normalized}` : STORAGE_KEY;
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

export function formatTime(hhmm) {
  const minutes = toMinutes(hhmm);
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function weekdayName(date) {
  return DAY_NAMES[date.getDay()];
}

/** "Mon, 1 Dec" for a real calendar date. */
export function formatDateLabel(date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

/** Upcoming calendar dates (today onward) that fall on the given weekday. */
export function upcomingDatesFor(weekday, count = 2, from = new Date()) {
  const target = DAY_NAMES.indexOf(weekday);
  if (target < 0) return [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const offset = (target - cursor.getDay() + 7) % 7;
  cursor.setDate(cursor.getDate() + offset);

  const dates = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates;
}

/**
 * Bookable slots for one weekday/mode. When the clinician picks specific slots,
 * only those 30-minute slots are returned unless `includeUnselected` is set for
 * the schedule editor.
 */
export function slotsFor(schedule, day, mode, options = {}) {
  const config = schedule?.modes?.[mode];
  const dayConfig = schedule?.days?.[day];
  if (!config || !dayConfig || !dayConfig[mode]) return [];

  const start = toMinutes(config.start);
  const end = toMinutes(config.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

  const step = schedule.slotMinutes || SLOT_MINUTES;
  const selectedRaw = options.selectedSlots !== undefined
    ? options.selectedSlots
    : schedule?.selected?.[day]?.[mode];
  const hasSelection = Array.isArray(selectedRaw);
  const selectedSet = new Set(hasSelection ? selectedRaw : []);
  const disabledSet = new Set(Array.isArray(options.disabledSlots) ? options.disabledSlots : []);
  const slots = [];

  for (let cursor = start; cursor + step <= end; cursor += step) {
    const isSelected = hasSelection ? selectedSet.has(cursor) : !disabledSet.has(cursor);
    if (!options.includeUnselected && !isSelected) continue;
    const hh = `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`;
    slots.push({
      startMinutes: cursor,
      start: hh,
      endMinutes: cursor + step,
      duration: step,
      label: formatTime(hh),
      extended: false,
      selected: isSelected,
    });
  }

  return slots;
}

/** Slots for a concrete date, honouring per-date overrides (holiday, custom hours, disabled/picked slots). */
export function slotsForDate(schedule, date, mode = 'online', options = {}) {
  const resolvedMode = schedule?.modes?.[mode] ? mode : 'online';
  const key = dateKey(date);
  const override = schedule?.overrides?.[key]?.[resolvedMode];

  if (override?.closed) return [];

  const day = weekdayName(date);
  const openWeekly = schedule?.days?.[day]?.[resolvedMode] !== false;
  if (!openWeekly && !override?.open) return [];

  const base = schedule?.modes?.[resolvedMode];
  if (!base) return [];

  const selectedSlots = Array.isArray(override?.slots)
    ? override.slots
    : schedule?.selected?.[day]?.[resolvedMode];

  const merged = {
    ...schedule,
    days: {
      ...schedule.days,
      [day]: { ...(schedule.days?.[day] || {}), [resolvedMode]: true },
    },
    modes: {
      ...schedule.modes,
      [resolvedMode]: {
        ...base,
        start: override?.start || base.start,
        end: override?.end || base.end,
      },
    },
  };

  return slotsFor(merged, day, resolvedMode, {
    ...options,
    selectedSlots,
    disabledSlots: override?.disabledSlots,
  });
}

/** Stable YYYY-MM-DD key for per-date overrides. */
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function readStoredSchedule(doctorName) {
  if (!hasWindow()) return null;
  const normalized = String(doctorName || '').trim().toLowerCase();
  try {
    const perDoctorRaw = window.localStorage.getItem(storageKeyFor(doctorName));
    if (perDoctorRaw) {
      const parsed = JSON.parse(perDoctorRaw);
      if (!normalized || !parsed.doctorName || parsed.doctorName.trim().toLowerCase() === normalized) {
        return parsed;
      }
    }
    const legacyRaw = window.localStorage.getItem(STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (!normalized || legacyParsed?.doctorName?.trim().toLowerCase() === normalized) {
        return legacyParsed;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeSchedule(parsed) {
  if (!parsed) return clone(DEFAULT_SCHEDULE);
  const isLegacySchema = !parsed.schemaVersion || parsed.schemaVersion < SCHEMA_VERSION;
  const parsedDays = parsed.days || {};
  const sourceMode = isLegacySchema ? {} : (parsed.modes?.online || parsed.modes?.video || {});
  const selected = {};
  if (!isLegacySchema) {
    for (const day of DAYS) {
      const picked = parsed.selected?.[day]?.online ?? parsed.selected?.[day]?.video;
      if (Array.isArray(picked)) selected[day] = { online: picked };
    }
  }
  const overrides = {};
  for (const [key, dayMap] of Object.entries(parsed.overrides || {})) {
    const entry = dayMap?.online || dayMap?.video;
    if (entry && Object.keys(entry).length) {
      overrides[key] = { online: entry };
    }
  }
  return {
    ...clone(DEFAULT_SCHEDULE),
    ...parsed,
    schemaVersion: SCHEMA_VERSION,
    modes: {
      online: {
        ...clone(DEFAULT_SCHEDULE.modes.online),
        ...sourceMode,
        label: DEFAULT_SCHEDULE.modes.online.label,
      },
    },
    days: DAYS.reduce((acc, day) => {
      const saved = parsedDays[day] || {};
      const fallback = day !== 'Sunday';
      acc[day] = {
        online: saved.online ?? saved.video ?? fallback,
      };
      return acc;
    }, {}),
    selected,
    extended: clone(DEFAULT_SCHEDULE.extended),
    overrides,
  };
}

export function loadSchedule(doctorName) {
  return normalizeSchedule(readStoredSchedule(doctorName));
}

/** True when a doctor has saved a schedule (used by the public pages). */
export function hasSavedSchedule(doctorName) {
  const parsed = readStoredSchedule(doctorName);
  return Boolean(parsed?.updatedAt);
}

export function saveSchedule(schedule, doctorName) {
  if (!hasWindow()) return;
  const resolvedDoctor = doctorName ?? schedule.doctorName ?? null;
  const next = {
    ...schedule,
    schemaVersion: SCHEMA_VERSION,
    doctorName: resolvedDoctor,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(storageKeyFor(resolvedDoctor), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  } catch {
    /* storage may be blocked */
  }
}

export function subscribeSchedule(callback) {
  if (!hasWindow()) return () => {};
  const local = (event) => callback(event.detail ? normalizeSchedule(event.detail) : null);
  const storage = (event) => {
    if (event.key === STORAGE_KEY || event.key?.startsWith(`${STORAGE_KEY}:`)) {
      try {
        callback(event.newValue ? normalizeSchedule(JSON.parse(event.newValue)) : null);
      } catch {
        callback(null);
      }
    }
  };
  window.addEventListener(EVENT, local);
  window.addEventListener('storage', storage);
  return () => {
    window.removeEventListener(EVENT, local);
    window.removeEventListener('storage', storage);
  };
}

const inFlightHydrations = new Map();

/**
 * Pulls the doctor's published schedule from the API so every device (patient
 * phones included) sees the same availability. Falls back silently to the local
 * copy when the backend is unreachable.
 */
export async function hydrateSchedule(doctorName) {
  if (!hasWindow() || !doctorName) return null;
  const cacheKey = String(doctorName).trim().toLowerCase();
  if (inFlightHydrations.has(cacheKey)) return inFlightHydrations.get(cacheKey);

  const task = (async () => {
    try {
      const response = await fetch(`/api/practice-schedule/${encodeURIComponent(doctorName)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) return null;
      const data = await response.json();
      const rawRemote = data?.schedule;
      if (!rawRemote?.updatedAt) return null;

      const remote = normalizeSchedule(rawRemote);
      const local = loadSchedule(doctorName);
      if (!local.updatedAt || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
        window.localStorage.setItem(storageKeyFor(doctorName), JSON.stringify(remote));
        window.dispatchEvent(new CustomEvent(EVENT, { detail: remote }));
        return remote;
      }
    } catch {
      /* offline or blocked — the local copy stays authoritative */
    }
    return null;
  })().finally(() => {
    inFlightHydrations.delete(cacheKey);
  });

  inFlightHydrations.set(cacheKey, task);
  return task;
}

const pushTimers = new Map();

/**
 * Publishes the schedule so other devices (patients) can see it.
 * Writes are debounced per doctor so rapid clicks collapse cleanly, while
 * explicit saves pass `{ immediate: true }`.
 */
export function pushSchedule(schedule, doctorName, options = {}) {
  if (!hasWindow() || !doctorName) return Promise.resolve(false);

  const pending = pushTimers.get(doctorName);
  if (pending) {
    clearTimeout(pending);
    pushTimers.delete(doctorName);
  }

  const sendNow = async () => {
    try {
      let token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('nayacura_csrf='))
        ?.split('=')[1];
      if (!token) {
        await fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => null);
        token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('nayacura_csrf='))
          ?.split('=')[1];
      }
      const response = await fetch('/api/practice-schedule', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-CSRF-Token': decodeURIComponent(token) } : {}),
        },
        body: JSON.stringify({ doctorName, schedule }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  if (options.immediate) return sendNow();

  return new Promise((resolve) => {
    const timer = setTimeout(async () => {
      pushTimers.delete(doctorName);
      resolve(await sendNow());
    }, 350);

    pushTimers.set(doctorName, timer);
  });
}
