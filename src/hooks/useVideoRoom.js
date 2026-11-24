import { useEffect, useState } from 'react';
import { readRoom, subscribeRoom } from '../lib/videoRoom';

/**
 * Live presence for one consultation room. Works across browser tabs/windows
 * through BroadcastChannel + localStorage, and inside the same tab through a
 * custom event.
 */
export default function useVideoRoom(roomCode) {
  const [room, setRoom] = useState(() => readRoom(roomCode));

  useEffect(() => subscribeRoom(roomCode, setRoom), [roomCode]);

  return {
    room,
    status: room?.status || 'waiting',
    doctorPresent: Boolean(room?.doctor),
    patientPresent: Boolean(room?.patient),
    bothPresent: Boolean(room?.doctor && room?.patient),
  };
}
