import { createServer } from 'node:http';

/**
 * Minimal, dependency-free presence + WebRTC signaling relay for the Nayacura
 * demo video room. State is in memory: a room lives for six hours and is
 * recreated on demand, which is all the patient/doctor dashboards need.
 */

const PORT = Number(process.env.PORT || 8080);
const PRESENCE_TTL_MS = 12_000;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_SIGNALS = 300;

const ROOM_CODE = /^[A-Z0-9-]{3,32}$/;
const ROLES = new Set(['doctor', 'patient']);
const SIGNAL_TYPES = new Set(['offer', 'answer', 'candidate']);

const rooms = new Map();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(res, status, payload) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function getRoom(code) {
  const now = Date.now();
  for (const [key, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS) rooms.delete(key);
  }

  let room = rooms.get(code);
  if (!room) {
    room = { code, participants: { doctor: null, patient: null }, signals: [], seq: 0, lastActivity: now };
    rooms.set(code, room);
  }
  return room;
}

function prune(room) {
  const now = Date.now();
  for (const role of ['doctor', 'patient']) {
    const participant = room.participants[role];
    if (participant && now - participant.lastSeen > PRESENCE_TTL_MS) room.participants[role] = null;
  }
  if (room.signals.length > MAX_SIGNALS) room.signals.splice(0, room.signals.length - MAX_SIGNALS);
}

function snapshot(room) {
  prune(room);
  return {
    code: room.code,
    doctor: room.participants.doctor,
    patient: room.participants.patient,
    updatedAt: room.lastActivity,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'health') {
    json(res, 200, { status: 'ok', service: 'nayacura-rooms', rooms: rooms.size });
    return;
  }

  const [code, action] = parts;
  if (!ROOM_CODE.test(code)) {
    json(res, 400, { message: 'Invalid room code.' });
    return;
  }

  if (parts.length > 2) {
    json(res, 404, { message: 'Unknown room endpoint.' });
    return;
  }

  const room = getRoom(code);

  if (req.method === 'GET' && !action) {
    json(res, 200, { room: snapshot(room) });
    return;
  }

  if (req.method === 'GET' && action === 'signals') {
    const role = url.searchParams.get('role');
    const after = Number(url.searchParams.get('after') || 0);
    if (!ROLES.has(role) || !Number.isFinite(after)) {
      json(res, 400, { message: 'Invalid signal query.' });
      return;
    }
    const signals = room.signals.filter((signal) => signal.from !== role && signal.id > after);
    json(res, 200, { signals, lastId: room.seq });
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { message: 'Method not allowed.' });
    return;
  }

  const body = await readBody(req);
  if (!body) {
    json(res, 400, { message: 'Invalid JSON body.' });
    return;
  }

  if (action === 'heartbeat') {
    const role = body.role;
    const name = String(body.name || '').trim().slice(0, 80);
    if (!ROLES.has(role)) {
      json(res, 400, { message: 'Invalid role.' });
      return;
    }

    const now = Date.now();
    const existing = room.participants[role];
    const stillFresh = existing && now - existing.lastSeen <= PRESENCE_TTL_MS;
    if (!stillFresh) room.signals = [];

    room.participants[role] = {
      name: name || existing?.name || role,
      joinedAt: stillFresh ? existing.joinedAt : now,
      lastSeen: now,
    };
    room.lastActivity = now;
    json(res, 200, { room: snapshot(room) });
    return;
  }

  if (action === 'leave') {
    if (!ROLES.has(body.role)) {
      json(res, 400, { message: 'Invalid role.' });
      return;
    }
    room.participants[body.role] = null;
    room.signals = room.signals.filter((signal) => signal.from === body.role);
    room.lastActivity = Date.now();
    json(res, 200, { room: snapshot(room) });
    return;
  }

  if (action === 'signal') {
    if (!ROLES.has(body.from) || !SIGNAL_TYPES.has(body.type) || body.payload === undefined) {
      json(res, 400, { message: 'Invalid signal payload.' });
      return;
    }
    room.seq += 1;
    room.signals.push({ id: room.seq, from: body.from, type: body.type, payload: body.payload });
    room.lastActivity = Date.now();
    prune(room);
    json(res, 200, { id: room.seq });
    return;
  }

  json(res, 404, { message: 'Unknown room endpoint.' });
});

server.listen(PORT, () => {
  console.log(`nayacura-rooms listening on :${PORT}`);
});
