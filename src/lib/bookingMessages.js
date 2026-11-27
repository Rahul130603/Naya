/**
 * Shared client helpers for normalizing Indian phone numbers, dispatching
 * /api/booking-requests, and formatting professional SMS / WhatsApp previews
 * and deep-links for confirmed doctor appointments.
 */

export function normalizeIndianPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return digits.length >= 8 ? `+${digits}` : null;
}

export function formatDisplayPhone(raw) {
  const normalized = normalizeIndianPhone(raw);
  if (normalized && normalized.startsWith('+91') && normalized.length === 13) {
    return `+91 ${normalized.slice(3)}`;
  }
  return normalized || `+91 ${String(raw || '').trim()}`;
}

async function readCsrfToken() {
  const read = () =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('nayacura_csrf='))
      ?.split('=')[1];
  let token = read();
  if (!token) {
    await fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => null);
    token = read();
  }
  return token ? decodeURIComponent(token) : '';
}

export async function submitBookingNotification(payload) {
  const token = await readCsrfToken();
  const response = await fetch('/api/booking-requests', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-CSRF-Token': token } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export function buildBookingMessagePreviews({
  reference,
  patientName,
  doctorName,
  specialty,
  when,
  mode = 'ONLINE',
  feeRupees,
  supportEmail = 'support@nayacura.com',
}) {
  const firstName = String(patientName || '').trim().split(/\s+/)[0] || 'Patient';
  const modeLabel = 'Online Consultation (Video & Audio)';
  const feeText = typeof feeRupees === 'number' && Number.isFinite(feeRupees)
    ? `Rs.${feeRupees.toLocaleString('en-IN')} (Online)`
    : null;

  const smsLines = [
    'Nayacura: Appointment Confirmed',
    `Ref: ${reference}`,
    `Patient: ${firstName}`,
    `Doctor: ${doctorName}${specialty ? ` (${specialty})` : ''}`,
    `When: ${when}`,
    `Mode: ${modeLabel}`,
  ];
  if (feeText) smsLines.push(`Fee: ${feeText}`);
  smsLines.push(`100% Confidential. Help: ${supportEmail}`);

  const waLines = [
    '*Nayacura — Appointment Confirmed*',
    '',
    `Hello ${firstName},`,
    '',
    'Your confidential online consultation has been scheduled. Booking summary:',
    '',
    `*Booking Ref:* ${reference}`,
    `*Doctor:* ${doctorName}${specialty ? ` (${specialty})` : ''}`,
    `*Date & Time:* ${when}`,
    `*Mode:* ${modeLabel}`,
    '*Join Link:* Open My Bookings in your Nayacura Patient Dashboard',
  ];
  if (feeText) waLines.push(`*Consultation Fee:* ${feeText}`);
  waLines.push(
    '',
    'Please join 5 minutes early from a private space (audio/camera-off mode supported).',
    '',
    'For privacy, no clinical details are ever sent over SMS or WhatsApp.',
    `Need assistance or rescheduling? Write to ${supportEmail}`,
    '',
    '— Nayacura Care Team',
  );

  return {
    sms: smsLines.join('\n'),
    whatsapp: waLines.join('\n'),
  };
}

export function buildChannelActionLinks(rawPhone, previews) {
  const e164 = normalizeIndianPhone(rawPhone);
  const waDigits = e164 ? e164.replace(/\D/g, '') : '';
  return {
    e164,
    whatsappUrl: waDigits ? `https://wa.me/${waDigits}?text=${encodeURIComponent(previews.whatsapp)}` : null,
    smsUrl: e164 ? `sms:${e164}?body=${encodeURIComponent(previews.sms)}` : null,
  };
}
