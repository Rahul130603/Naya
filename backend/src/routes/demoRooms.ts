import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

type Role = 'doctor' | 'patient';
type SignalType = 'offer' | 'answer' | 'candidate';

type Participant = { name: string; joinedAt: number; lastSeen: number };
type Signal = { id: number; from: Role; type: SignalType; payload: unknown };
type Room = {
  code: string;
  participants: Record<Role, Participant | null>;
  signals: Signal[];
  seq: number;
  status: 'waiting' | 'completed';
  completedAt: number | null;
  lastActivity: number;
};

const PRESENCE_TTL_MS = 12_000;
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_SIGNALS = 300;
const ROOM_CODE = /^[A-Z0-9-]{3,32}$/;
const ROLES: Role[] = ['doctor', 'patient'];
const SIGNAL_TYPES: SignalType[] = ['offer', 'answer', 'candidate'];

const rooms = new Map<string, Room>();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { message: 'Video room is receiving too many requests.', code: 'ROOM_RATE_LIMITED' },
});

function prune(room: Room) {
  const now = Date.now();
  for (const role of ROLES) {
    const participant = room.participants[role];
    if (participant && now - participant.lastSeen > PRESENCE_TTL_MS) {
      room.participants[role] = null;
    }
  }
  if (room.signals.length > MAX_SIGNALS) {
    room.signals.splice(0, room.signals.length - MAX_SIGNALS);
  }
}

function cleanupRooms() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS) rooms.delete(code);
  }
}

function snapshot(room: Room) {
  prune(room);
  const bothPresent = Boolean(room.participants.doctor && room.participants.patient);
  return {
    code: room.code,
    doctor: room.participants.doctor,
    patient: room.participants.patient,
    status: bothPresent ? 'live' : room.status,
    completedAt: room.completedAt,
    updatedAt: room.lastActivity,
  };
}

function getRoom(code: string) {
  cleanupRooms();
  let room = rooms.get(code);
  if (!room) {
    room = {
      code,
      participants: { doctor: null, patient: null },
      signals: [],
      seq: 0,
      status: 'waiting',
      completedAt: null,
      lastActivity: Date.now(),
    };
    rooms.set(code, room);
  }
  return room;
}

function readRole(value: unknown): Role | null {
  return typeof value === 'string' && ROLES.includes(value as Role) ? (value as Role) : null;
}

export const demoRoomsRouter = Router();

demoRoomsRouter.get('/:code', limiter, (req, res) => {
  const { code } = req.params;
  if (!ROOM_CODE.test(code)) {
    res.status(400).json({ message: 'Invalid room code.' });
    return;
  }
  res.json({ room: snapshot(getRoom(code)) });
});

demoRoomsRouter.post('/:code/heartbeat', limiter, (req, res) => {
  const { code } = req.params;
  const role = readRole(req.body?.role);
  const name = String(req.body?.name ?? '').trim().slice(0, 80);
  if (!ROOM_CODE.test(code) || !role) {
    res.status(400).json({ message: 'Invalid room or role.' });
    return;
  }

  const room = getRoom(code);
  const now = Date.now();
  const existing = room.participants[role];
  const stillFresh = existing && now - existing.lastSeen <= PRESENCE_TTL_MS;

  if (!stillFresh) {
    // A fresh join starts a new call: drop signals from the previous session.
    room.signals = [];
  }

  room.participants[role] = {
    name: name || existing?.name || role,
    joinedAt: stillFresh ? existing.joinedAt : now,
    lastSeen: now,
  };
  room.lastActivity = now;
  res.json({ room: snapshot(room) });
});

demoRoomsRouter.post('/:code/leave', limiter, (req, res) => {
  const { code } = req.params;
  const role = readRole(req.body?.role);
  if (!ROOM_CODE.test(code) || !role) {
    res.status(400).json({ message: 'Invalid room or role.' });
    return;
  }
  const room = getRoom(code);
  room.participants[role] = null;
  room.signals = room.signals.filter((signal) => signal.from === role);
  room.lastActivity = Date.now();
  res.json({ room: snapshot(room) });
});

demoRoomsRouter.post('/:code/complete', limiter, (req, res) => {
  const { code } = req.params;
  if (!ROOM_CODE.test(code)) {
    res.status(400).json({ message: 'Invalid room code.' });
    return;
  }
  const room = getRoom(code);
  room.status = 'completed';
  room.completedAt = Date.now();
  room.lastActivity = Date.now();
  res.json({ room: snapshot(room) });
});

demoRoomsRouter.post('/:code/signal', limiter, (req, res) => {
  const { code } = req.params;
  const from = readRole(req.body?.from);
  const type = SIGNAL_TYPES.includes(req.body?.type) ? (req.body.type as SignalType) : null;
  if (!ROOM_CODE.test(code) || !from || !type || req.body?.payload === undefined) {
    res.status(400).json({ message: 'Invalid signal payload.' });
    return;
  }

  const room = getRoom(code);
  const signal: Signal = { id: room.seq + 1, from, type, payload: req.body.payload };
  room.seq = signal.id;
  room.signals.push(signal);
  room.lastActivity = Date.now();
  prune(room);
  res.json({ id: signal.id });
});

demoRoomsRouter.get('/:code/signals', limiter, (req, res) => {
  const { code } = req.params;
  const role = readRole(req.query.role);
  const after = Number(req.query.after ?? 0);
  if (!ROOM_CODE.test(code) || !role || !Number.isFinite(after)) {
    res.status(400).json({ message: 'Invalid signal query.' });
    return;
  }

  const room = getRoom(code);
  const signals = room.signals.filter((signal) => signal.from !== role && signal.id > after);
  res.set('Cache-Control', 'no-store').json({ signals, lastId: room.seq });
});
