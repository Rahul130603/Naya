import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Video as VideoIcon,
  VideoOff,
  X,
} from 'lucide-react';
import useVideoRoom from '../hooks/useVideoRoom';
import {
  completeRoom,
  fetchSignals,
  getRoomApiOnline,
  heartbeatRoom,
  joinRoom,
  leaveRoom,
  sendSignal,
  subscribeRoomApi,
} from '../lib/videoRoom';

const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];
const TURN_URL = import.meta.env?.VITE_TURN_URL;
if (TURN_URL) {
  ICE_SERVERS.push({
    urls: TURN_URL,
    username: import.meta.env?.VITE_TURN_USERNAME || '',
    credential: import.meta.env?.VITE_TURN_CREDENTIAL || '',
  });
}
const HEARTBEAT_MS = 4000;
const SIGNAL_POLL_MS = 800;

const formatDuration = (totalSeconds) => {
  const pad = (value) => String(value).padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
};

export default function VideoCallRoom({
  roomCode,
  role,
  selfName,
  peerName,
  appointment,
  defaultCamOn = true,
  onClose,
}) {
  const { room, bothPresent } = useVideoRoom(roomCode);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(defaultCamOn);
  const [mediaError, setMediaError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tick, setTick] = useState(0);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [pcState, setPcState] = useState('idle');
  const [roomApiOnline, setRoomApiOnline] = useState(() => getRoomApiOnline());

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const pendingCandidates = useRef([]);
  const lastSignalId = useRef(0);
  const offerSent = useRef(false);

  const peer = role === 'doctor' ? room?.patient : room?.doctor;
  const peerLabel = role === 'doctor' ? 'patient' : 'doctor';
  const remoteName = peer?.name || peerName || (role === 'doctor' ? 'Patient' : 'Doctor');
  const roomCompleted = room?.status === 'completed' && !bothPresent;

  useEffect(() => subscribeRoomApi(setRoomApiOnline), []);

  const handleEndCall = useCallback(() => {
    if (bothPresent) completeRoom(roomCode);
    onClose?.();
  }, [bothPresent, roomCode, onClose]);

  // Publish presence (and keep it fresh) for as long as this room is open.
  useEffect(() => {
    joinRoom(roomCode, role, selfName);
    const heartbeat = window.setInterval(() => heartbeatRoom(roomCode, role, selfName), HEARTBEAT_MS);
    const release = () => leaveRoom(roomCode, role);
    window.addEventListener('beforeunload', release);
    window.addEventListener('pagehide', release);
    return () => {
      window.clearInterval(heartbeat);
      release();
      window.removeEventListener('beforeunload', release);
      window.removeEventListener('pagehide', release);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [roomCode, role, selfName]);

  // Local camera + microphone preview.
  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError('This browser cannot open a camera. The room still tracks both participants.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
        setMediaError('');
      } catch {
        if (!cancelled) setMediaError('Camera and microphone are blocked. Allow access in the browser, then rejoin the room.');
      }
    };
    start();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = micOn;
    });
  }, [micOn]);

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = camOn;
    });
  }, [camOn]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  const ensurePeer = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    if (typeof RTCPeerConnection === 'undefined') return null;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const stream = streamRef.current;
    if (stream) stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (event.streams?.[0]) setRemoteStream(event.streams[0]);
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) sendSignal(roomCode, role, 'candidate', event.candidate.toJSON());
    };
    pc.onconnectionstatechange = () => setPcState(pc.connectionState);

    pcRef.current = pc;
    return pc;
  }, [roomCode, role]);

  // Patient is the caller: create the offer once both people are in the room.
  useEffect(() => {
    if (!bothPresent || role !== 'patient' || offerSent.current) return undefined;
    if (!localStream && !mediaError) return undefined;

    offerSent.current = true;
    let cancelled = false;
    const start = async () => {
      const pc = ensurePeer();
      if (!pc || cancelled) return;
      const offer = await pc.createOffer();
      if (cancelled) return;
      await pc.setLocalDescription(offer);
      await sendSignal(roomCode, role, 'offer', { type: offer.type, sdp: offer.sdp });
    };
    start().catch(() => setMediaError('Could not start the video connection. Close and rejoin the room.'));

    return () => {
      cancelled = true;
    };
  }, [bothPresent, role, ensurePeer, localStream, mediaError, roomCode]);

  // Exchange WebRTC offers, answers and ICE candidates through the room API.
  useEffect(() => {
    if (!bothPresent) return undefined;

    let cancelled = false;
    let timer = 0;

    const pollSignals = async () => {
      const messages = await fetchSignals(roomCode, role, lastSignalId.current);
      for (const message of messages) {
        if (cancelled) return;
        lastSignalId.current = Math.max(lastSignalId.current, message.id);
        const pc = ensurePeer();
        if (!pc) break;

        try {
          if (message.type === 'offer') {
            await pc.setRemoteDescription(message.payload);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await sendSignal(roomCode, role, 'answer', { type: answer.type, sdp: answer.sdp });
          } else if (message.type === 'answer') {
            if (pc.signalingState === 'have-local-offer') await pc.setRemoteDescription(message.payload);
          } else if (message.type === 'candidate' && message.payload) {
            if (pc.remoteDescription) await pc.addIceCandidate(message.payload);
            else pendingCandidates.current.push(message.payload);
          }

          if (pc.remoteDescription && pendingCandidates.current.length) {
            const queued = pendingCandidates.current.splice(0);
            for (const candidate of queued) await pc.addIceCandidate(candidate).catch(() => {});
          }
        } catch {
          /* a duplicate or stale signal should not stop the poll loop */
        }
      }
      if (!cancelled) timer = window.setTimeout(pollSignals, SIGNAL_POLL_MS);
    };

    timer = window.setTimeout(pollSignals, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [bothPresent, roomCode, role, ensurePeer]);

  // Closing or losing the peer resets the peer connection but keeps the room open.
  useEffect(() => {
    if (bothPresent) return undefined;
    pcRef.current?.close();
    pcRef.current = null;
    pendingCandidates.current = [];
    lastSignalId.current = 0;
    offerSent.current = false;
    return undefined;
  }, [bothPresent]);

  // Call timer starts only when both participants are inside the room.
  useEffect(() => {
    if (!bothPresent) return undefined;
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [bothPresent]);

  const connectedSince = bothPresent
    ? Math.max(room?.doctor?.joinedAt || 0, room?.patient?.joinedAt || 0)
    : 0;
  const seconds = connectedSince ? Math.max(0, Math.floor((tick - connectedSince) / 1000)) : 0;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleEndCall();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleEndCall]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard?.writeText(roomCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code stays visible on screen */
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex w-full flex-col overflow-hidden bg-[#050B18] text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#16A34A]/15 text-[#4ADE80]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">Secure consultation room</p>
            <p className="text-[11px] text-slate-400">
              Room #{roomCode}
              {appointment?.timeSlot ? ` · ${appointment.timeSlot}` : ''} · End-to-end encrypted
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
            bothPresent
              ? 'bg-emerald-500/15 text-emerald-300'
              : roomCompleted
                ? 'bg-slate-500/20 text-slate-300'
                : 'bg-amber-500/15 text-amber-300'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${bothPresent ? 'bg-emerald-400' : roomCompleted ? 'bg-slate-400' : 'bg-amber-400 animate-pulse'}`} />
            {bothPresent ? `Connected · ${formatDuration(seconds)}` : roomCompleted ? 'Consultation completed' : `Waiting for ${peerLabel}`}
          </span>
          <button
            type="button"
            onClick={copyRoomCode}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-slate-200 transition hover:bg-white/10"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy room code'}
          </button>
          <button type="button" aria-label="Close room" onClick={handleEndCall} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-slate-300 transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {roomApiOnline === false && (
        <div className="shrink-0 border-b border-amber-400/30 bg-amber-500/15 px-3 py-1.5 text-center text-[11px] font-semibold text-amber-200 sm:px-4 sm:py-2 sm:text-xs">
          Video room server is unreachable. Deploy the rooms service and set VITE_ROOM_API_URL before building.
        </div>
      )}

      <main className="flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4">
        <div className="relative flex h-full min-h-0 w-full max-w-[1400px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1B3A] via-[#0A1526] to-[#06101F] sm:rounded-3xl">
          {remoteStream ? (
            <>
              <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 h-full w-full bg-black object-contain" />
              <span className="absolute bottom-3 left-3 z-10 max-w-[45%] truncate rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white sm:bottom-4 sm:left-4">
                {remoteName}
              </span>
            </>
          ) : bothPresent ? (
            <div className="relative z-10 flex max-h-full flex-col items-center gap-3 overflow-y-auto px-4 py-6 text-center sm:px-6">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-[#16A34A]/20 text-3xl font-extrabold text-[#4ADE80] ring-4 ring-[#16A34A]/20 sm:h-24 sm:w-24">
                {remoteName.charAt(0).toUpperCase()}
              </span>
              <p className="text-lg font-bold sm:text-xl">{remoteName}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {pcState === 'connected' ? 'Starting video…' : 'Connecting video…'}
              </span>
              <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                You are both in the room. If the video does not appear, check camera permissions on both devices.
              </p>
            </div>
          ) : roomCompleted ? (
            <div className="relative z-10 flex max-h-full flex-col items-center gap-3 overflow-y-auto px-4 py-6 text-center sm:px-6">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-[#4ADE80] sm:h-20 sm:w-20">
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <p className="text-base font-bold sm:text-lg">Consultation completed</p>
              <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                This session is marked as completed for both {role === 'doctor' ? 'you and the patient' : 'you and the doctor'}. Rejoin any time if you need to continue.
              </p>
            </div>
          ) : (
            <div className="relative z-10 flex max-h-full flex-col items-center gap-3 overflow-y-auto px-4 py-6 text-center sm:px-6">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/5 sm:h-20 sm:w-20">
                <Loader2 className="h-7 w-7 animate-spin text-[#4ADE80] sm:h-8 sm:w-8" />
              </span>
              <p className="text-base font-bold sm:text-lg">Waiting for the {peerLabel} to join</p>
              <p className="max-w-sm text-xs leading-relaxed text-slate-400">
                Keep this tab open. {remoteName} will appear here the moment they join the room.
              </p>
            </div>
          )}

          <div className="absolute bottom-3 right-3 z-20 h-24 w-36 overflow-hidden rounded-xl border border-white/15 bg-black/60 sm:bottom-4 sm:right-4 sm:h-40 sm:w-60 sm:rounded-2xl">
            <video ref={videoRef} autoPlay playsInline muted className={`h-full w-full object-cover ${camOn ? '' : 'opacity-0'}`} />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400">
                <VideoOff className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">Camera off</span>
              </div>
            )}
            <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-200">You</span>
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-white/10 px-3 py-3 sm:px-6 sm:py-4">
        {mediaError && (
          <p className="mb-2 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-amber-300 sm:mb-3 sm:text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />{mediaError}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setMicOn((value) => !value)}
            aria-pressed={micOn}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${micOn ? 'border-white/15 bg-white/10 text-white hover:bg-white/15' : 'border-red-400/40 bg-red-500/20 text-red-300'}`}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setCamOn((value) => !value)}
            aria-pressed={camOn}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${camOn ? 'border-white/15 bg-white/10 text-white hover:bg-white/15' : 'border-red-400/40 bg-red-500/20 text-red-300'}`}
            aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={handleEndCall}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-red-500 px-6 text-sm font-bold text-white transition hover:bg-red-600"
          >
            <PhoneOff className="h-5 w-5" /> {bothPresent ? 'End & complete' : 'End call'}
          </button>
        </div>
        <p className="mt-2 hidden text-center text-[11px] text-slate-500 sm:mt-3 sm:block">
          {pcState === 'connected'
            ? 'Live peer-to-peer video · encrypted media · nothing is recorded.'
            : 'Both devices connect through the room server; video starts automatically once both cameras are available.'}
        </p>
      </footer>
    </div>
  );
}
