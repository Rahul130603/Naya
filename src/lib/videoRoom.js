const RAW_API_BASE = import.meta.env?.VITE_ROOM_API_URL || '/api/demo-rooms';
const API_BASE = /^https?:\/\//i.test(RAW_API_BASE)
  ? RAW_API_BASE.replace(/\/+$/, '')
  : RAW_API_BASE.startsWith('/')
    ? RAW_API_BASE.replace(/\/+$/, '')
    : `https://${RAW_API_BASE.replace(/\/+$/, '')}`;
const STORAGE_KEY = 'nayacura_video_rooms_v2';
const LOCAL_EVENT = 'nayacura:video-room';
const API_EVENT = 'nayacura:room-api';
const POLL_MS = 1500;

const EMPTY_ROOM = { doctor: null, patient: null };
const hasWindow = () => typeof window !== 'undefined';

let apiRetryAt = 0;
let apiOnline = null;

function setApiOnline(value) {
  if (apiOnline === value) return;
  apiOnline = value;
  if (hasWindow()) window.dispatchEvent(new CustomEvent(API_EVENT, { detail: { online: value } }));
}

export function getRoomApiOnline() {
  return apiOnline;
}

export function subscribeRoomApi(callback) {
  if (!hasWindow()) return () => {};
  const handler = (event) => callback(event.detail?.online === true);
  window.addEventListener(API_EVENT, handler);
  return () => window.removeEventListener(API_EVENT, handler);
}

/**
 * Both portals need the same room for the same clinician. Dr. Arvind's room keeps
 * the code already printed in the doctor suite (#NC-ROOM-9410).
 */
export function roomCodeFor(doctorName = '') {
  const name = String(doctorName || '').trim();
  if (!name || /arvind/i.test(name)) return 'NC-ROOM-9410';
  const slug = name
    .replace(/^dr\.?\s*/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
  return slug ? `NC-ROOM-${slug.slice(0, 10)}` : 'NC-ROOM-9410';
}

const normalize = (room) => ({
  doctor: room?.doctor ? { name: room.doctor.name, joinedAt: room.doctor.joinedAt } : null,
  patient: room?.patient ? { name: room.patient.name, joinedAt: room.patient.joinedAt } : null,
});

function readCache(roomCode) {
  if (!hasWindow()) return { ...EMPTY_ROOM };
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${roomCode}`);
    return raw ? { ...EMPTY_ROOM, ...JSON.parse(raw) } : { ...EMPTY_ROOM };
  } catch {
    return { ...EMPTY_ROOM };
  }
}

function sameRoom(a, b) {
  return JSON.stringify([
    a?.doctor?.name, a?.doctor?.joinedAt, a?.patient?.name, a?.patient?.joinedAt,
  ]) === JSON.stringify([
    b?.doctor?.name, b?.doctor?.joinedAt, b?.patient?.name, b?.patient?.joinedAt,
  ]);
}

function applyRoom(roomCode, room, { force = false } = {}) {
  const next = normalize(room);
  const current = readCache(roomCode);
  if (!force && sameRoom(current, next)) return current;

  if (hasWindow()) {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:${roomCode}`, JSON.stringify(next));
    } catch {
      /* storage blocked: keep going with in-memory listeners */
    }
    window.dispatchEvent(new CustomEvent(LOCAL_EVENT, { detail: { roomCode, room: next } }));
  }
  return next;
}

export function readRoom(roomCode) {
  return readCache(roomCode);
}

async function request(path, options) {
  if (!hasWindow() || Date.now() < apiRetryAt) return null;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    setApiOnline(false);
    apiRetryAt = Date.now() + 15_000;
    return null;
  }

  if (!response.ok) {
    // 404 / gateway errors usually mean the rooms service is not deployed.
    setApiOnline(false);
    apiRetryAt = Date.now() + 15_000;
    return null;
  }

  setApiOnline(true);
  try {
    return await response.json();
  } catch {
    setApiOnline(false);
    apiRetryAt = Date.now() + 15_000;
    return null;
  }
}

export async function joinRoom(roomCode, role, name) {
  const current = readCache(roomCode);
  applyRoom(roomCode, {
    ...current,
    [role]: { name, joinedAt: current[role]?.joinedAt || Date.now() },
  }, { force: true });

  const data = await request(`/${encodeURIComponent(roomCode)}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify({ role, name }),
  });
  if (data?.room) applyRoom(roomCode, data.room, { force: true });
  return readRoom(roomCode);
}

export async function heartbeatRoom(roomCode, role, name) {
  const data = await request(`/${encodeURIComponent(roomCode)}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify({ role, name }),
  });
  if (data?.room) applyRoom(roomCode, data.room);
}

export async function leaveRoom(roomCode, role) {
  applyRoom(roomCode, { ...readCache(roomCode), [role]: null }, { force: true });
  await request(`/${encodeURIComponent(roomCode)}/leave`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function sendSignal(roomCode, from, type, payload) {
  await request(`/${encodeURIComponent(roomCode)}/signal`, {
    method: 'POST',
    body: JSON.stringify({ from, type, payload }),
  });
}

export async function fetchSignals(roomCode, role, after) {
  const data = await request(`/${encodeURIComponent(roomCode)}/signals?role=${role}&after=${after}`);
  return data?.signals ?? [];
}

/**
 * Live presence for one room. The Express API keeps both devices (laptop + phone)
 * in sync; localStorage events keep multiple tabs of the same browser instant.
 */
export function subscribeRoom(roomCode, onChange) {
  if (!hasWindow()) return () => {};

  onChange(readCache(roomCode));

  const onLocal = (event) => {
    if (event.detail?.roomCode !== roomCode) return;
    onChange(event.detail.room);
  };
  const onStorage = (event) => {
    if (event.key !== `${STORAGE_KEY}:${roomCode}`) return;
    onChange(readCache(roomCode));
  };

  window.addEventListener(LOCAL_EVENT, onLocal);
  window.addEventListener('storage', onStorage);

  let cancelled = false;
  let timer = 0;
  const poll = async () => {
    const data = await request(`/${encodeURIComponent(roomCode)}`);
    if (!cancelled && data?.room) applyRoom(roomCode, data.room);
    if (!cancelled) timer = window.setTimeout(poll, POLL_MS);
  };
  timer = window.setTimeout(poll, 0);

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
    window.removeEventListener(LOCAL_EVENT, onLocal);
    window.removeEventListener('storage', onStorage);
  };
}
