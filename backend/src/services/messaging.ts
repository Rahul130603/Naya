import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * SMS + WhatsApp delivery for booking confirmations.
 *
 * Twilio is used for both channels (one account, two senders), over its plain
 * HTTPS API so no extra SDK ships with the backend. When credentials are absent
 * every channel reports `skipped` instead of pretending a message was sent —
 * callers surface that honestly to the patient.
 */

export type NotificationChannel = 'SMS' | 'WHATSAPP';

export type NotificationResult =
  | { channel: NotificationChannel; delivered: true; mode: 'twilio' | 'fast2sms' | 'meta'; providerId: string | null }
  | { channel: NotificationChannel; delivered: false; mode: 'skipped' | 'failed'; reason: string };

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Normalises the numbers patients type on the booking form into E.164.
 * Handles `9876543210`, `09876543210`, `919876543210`, `+91 98765 43210`
 * and `0091 9876543210`.
 */
export function normalizePhone(raw: string, defaultCountryCode = '91'): string | null {
  const value = String(raw ?? '').trim();
  if (!value) return null;
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;

  let candidate: string;
  if (hasPlus) candidate = `+${digits}`;
  else if (digits.startsWith('00')) candidate = `+${digits.slice(2)}`;
  else if (digits.length === 10) candidate = `+${defaultCountryCode}${digits}`;
  else if (digits.length === 11 && digits.startsWith('0')) candidate = `+${defaultCountryCode}${digits.slice(1)}`;
  else if (digits.length === 12 && digits.startsWith(defaultCountryCode)) candidate = `+${digits}`;
  else candidate = `+${digits}`;

  return E164.test(candidate) ? candidate : null;
}

function upperMeridiem(value: string) {
  return value.replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase());
}

/** "Wed, 25 Nov 2026, 9:30 AM" in the clinic's timezone. */
export function formatWhen(iso: string, timezone = 'Asia/Kolkata'): string {
  try {
    const formatted = new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(new Date(iso));
    // en-IN inserts a comma before the year ("Fri, 27 Nov, 2026, 9:30 AM");
    // outgoing messages read better without it.
    return upperMeridiem(formatted.replace(/,\s(\d{4})/, ' $1'));
  } catch {
    return upperMeridiem(new Date(iso).toLocaleString('en-IN'));
  }
}

function rupees(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return `Rs.${value.toLocaleString('en-IN')}`;
}

export type BookingMessageInput = {
  /** Patient's mobile number, in any of the formats normalizePhone accepts. */
  to: string;
  reference: string;
  patientName?: string;
  doctorName: string;
  specialty?: string;
  /** Pre-formatted appointment date & time, e.g. "Wed, 25 Nov 2026, 9:30 AM". */
  when: string;
  mode: 'IN_PERSON' | 'ONLINE';
  clinicName?: string;
  clinicAddress?: string;
  feeRupees?: number;
  channels?: NotificationChannel[];
};

function modeLabel(mode: BookingMessageInput['mode']) {
  return mode === 'ONLINE' ? 'Encrypted Video Consultation' : 'In-Clinic Consultation';
}

function feeDetail(input: BookingMessageInput) {
  const fee = rupees(input.feeRupees);
  if (!fee) return null;
  return input.mode === 'ONLINE' ? `${fee} (Online)` : `${fee} (Pay at Clinic)`;
}

export function buildBookingSms(input: BookingMessageInput): string {
  const firstName = (input.patientName || '').trim().split(/\s+/)[0];
  const lines = [
    `Nayacura: Appointment Confirmed`,
    `Ref: ${input.reference}`,
    ...(firstName ? [`Patient: ${firstName}`] : []),
    `Doctor: ${input.doctorName}${input.specialty ? ` (${input.specialty})` : ''}`,
    `When: ${input.when}`,
    `Mode: ${modeLabel(input.mode)}${input.mode !== 'ONLINE' && input.clinicName ? ` - ${input.clinicName}` : ''}`,
  ];
  const fee = feeDetail(input);
  if (fee) lines.push(`Fee: ${fee}`);
  lines.push(`100% Confidential. Help: ${env.SUPPORT_EMAIL}`);
  return lines.join('\n');
}

export function buildBookingWhatsApp(input: BookingMessageInput): string {
  const firstName = (input.patientName || '').trim().split(/\s+/)[0];
  const fee = feeDetail(input);
  const lines = [
    '*Nayacura — Appointment Confirmed*',
    '',
    firstName ? `Hello ${firstName},` : 'Hello,',
    '',
    'Your confidential consultation has been scheduled. Booking summary:',
    '',
    `*Booking Ref:* ${input.reference}`,
    `*Doctor:* ${input.doctorName}${input.specialty ? ` (${input.specialty})` : ''}`,
    `*Date & Time:* ${input.when}`,
    `*Mode:* ${modeLabel(input.mode)}`,
  ];
  if (input.mode !== 'ONLINE' && input.clinicName) lines.push(`*Clinic:* ${input.clinicName}`);
  if (input.mode !== 'ONLINE' && input.clinicAddress) lines.push(`*Address:* ${input.clinicAddress}`);
  if (input.mode === 'ONLINE') lines.push('*Join Link:* Open My Bookings in your Nayacura Patient Dashboard');
  if (fee) lines.push(`*Consultation Fee:* ${fee}`);
  lines.push(
    '',
    input.mode === 'ONLINE'
      ? 'Please join 5 minutes early from a private space (audio/camera-off mode supported).'
      : 'Please arrive 10 minutes early and carry a valid photo ID.',
    '',
    'For privacy, no clinical details are ever sent over SMS or WhatsApp.',
    `Need assistance or rescheduling? Write to ${env.SUPPORT_EMAIL}`,
    '',
    '— Nayacura Care Team',
  );
  return lines.join('\n');
}

type TwilioInput = {
  channel: NotificationChannel;
  to: string;
  body: string;
};

function channelConfigured(channel: NotificationChannel) {
  return channel === 'SMS' ? env.smsConfigured : env.whatsappConfigured;
}

async function deliverViaFast2Sms(toE164: string, body: string): Promise<NotificationResult> {
  const apiKey = env.FAST2SMS_API_KEY as string;
  // Fast2SMS expects 10-digit Indian mobile numbers (e.g. 9876543210).
  const indian10 = toE164.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
  if (indian10.length !== 10) {
    return { channel: 'SMS', delivered: false, mode: 'failed', reason: 'INVALID_INDIAN_MOBILE' };
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        route: env.FAST2SMS_ROUTE || 'q',
        message: body,
        numbers: indian10,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      return?: boolean;
      status_code?: number;
      request_id?: string;
      message?: string | string[];
    };

    if (!response.ok || payload.return === false) {
      const msgText = Array.isArray(payload.message) ? payload.message.join(', ') : String(payload.message || '');
      logger.warn('notification.fast2sms_failed', {
        status: response.status,
        statusCode: payload.status_code,
        message: msgText,
      });
      return {
        channel: 'SMS',
        delivered: false,
        mode: 'failed',
        reason: msgText ? `FAST2SMS: ${msgText.slice(0, 120)}` : `FAST2SMS_${response.status}`,
      };
    }

    logger.info('notification.sent', { channel: 'SMS', provider: 'fast2sms', providerId: payload.request_id ?? null });
    return { channel: 'SMS', delivered: true, mode: 'fast2sms', providerId: payload.request_id ?? null };
  } catch (error) {
    logger.warn('notification.fast2sms_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { channel: 'SMS', delivered: false, mode: 'failed', reason: 'PROVIDER_UNREACHABLE' };
  }
}

async function deliverViaMetaWhatsApp(
  toE164: string,
  body: string,
  input: BookingMessageInput,
): Promise<NotificationResult> {
  const token = env.WHATSAPP_CLOUD_TOKEN as string;
  const phoneId = env.WHATSAPP_PHONE_NUMBER_ID as string;
  const toDigits = toE164.replace(/\D/g, '');
  const endpoint = `https://graph.facebook.com/v21.0/${encodeURIComponent(phoneId)}/messages`;

  async function postMeta(messagePayload: Record<string, unknown>) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload),
      signal: AbortSignal.timeout(12_000),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number };
    };
    return { response, payload };
  }

  try {
    // Use approved Meta utility template directly if configured (works without 24h user reply).
    if (env.WHATSAPP_TEMPLATE_NAME) {
      const { response, payload } = await postMeta({
        messaging_product: 'whatsapp',
        to: toDigits,
        type: 'template',
        template: {
          name: env.WHATSAPP_TEMPLATE_NAME,
          language: { code: env.WHATSAPP_TEMPLATE_LANG || 'en' },
          ...(env.WHATSAPP_TEMPLATE_NAME !== 'hello_world'
            ? {
                components: [
                  {
                    type: 'body',
                    parameters: [
                      { type: 'text', text: (input.patientName || 'Patient').trim() || 'Patient' },
                      { type: 'text', text: input.reference },
                      { type: 'text', text: input.doctorName },
                      { type: 'text', text: input.when },
                      { type: 'text', text: modeLabel(input.mode) },
                    ],
                  },
                ],
              }
            : {}),
        },
      });
      if (response.ok && payload.messages?.[0]?.id) {
        const msgId = payload.messages[0].id ?? null;
        logger.info('notification.sent', { channel: 'WHATSAPP', provider: 'meta-template', providerId: msgId });
        return { channel: 'WHATSAPP', delivered: true, mode: 'meta', providerId: msgId };
      }
      const tplErr = payload.error?.message || '';
      logger.warn('notification.meta_template_failed', { status: response.status, error: tplErr });
    }

    const { response, payload } = await postMeta({
      messaging_product: 'whatsapp',
      to: toDigits,
      type: 'text',
      text: { preview_url: false, body },
    });

    if (!response.ok || !payload.messages?.[0]?.id) {
      const errMsg = payload.error?.message || '';
      logger.warn('notification.meta_whatsapp_failed', {
        status: response.status,
        error: errMsg,
      });
      return {
        channel: 'WHATSAPP',
        delivered: false,
        mode: 'failed',
        reason: errMsg ? `META: ${errMsg.slice(0, 120)}` : `META_${response.status}`,
      };
    }

    const msgId = payload.messages[0].id ?? null;
    logger.info('notification.sent', { channel: 'WHATSAPP', provider: 'meta', providerId: msgId });
    return { channel: 'WHATSAPP', delivered: true, mode: 'meta', providerId: msgId };
  } catch (error) {
    logger.warn('notification.meta_whatsapp_error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { channel: 'WHATSAPP', delivered: false, mode: 'failed', reason: 'PROVIDER_UNREACHABLE' };
  }
}

/**
 * Twilio's docs print the WhatsApp sender as `whatsapp:+14155238886`, while the
 * SMS sender is a bare number. Accept either form (and stray quotes) so a
 * pasted value never fails with a confusing provider 400.
 */
function senderNumber(channel: NotificationChannel) {
  const raw = String(
    (channel === 'SMS' ? env.TWILIO_SMS_FROM : env.TWILIO_WHATSAPP_FROM) ?? '',
  ).trim();
  return raw
    .replace(/^["']|["']$/g, '')
    .replace(/^whatsapp:/i, '')
    .trim();
}

function skipped(channel: NotificationChannel): NotificationResult {
  logger.info('notification.skipped', { channel, reason: 'PROVIDER_NOT_CONFIGURED' });
  return { channel, delivered: false, mode: 'skipped', reason: 'PROVIDER_NOT_CONFIGURED' };
}

async function deliverViaTwilio({ channel, to, body }: TwilioInput): Promise<NotificationResult> {
  if (!channelConfigured(channel)) return skipped(channel);

  const accountSid = env.TWILIO_ACCOUNT_SID as string;
  const authToken = env.TWILIO_AUTH_TOKEN as string;
  const sender = senderNumber(channel);
  const base = env.TWILIO_API_BASE.replace(/\/+$/, '');
  const url = `${base}/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;

  const params = new URLSearchParams({
    To: channel === 'WHATSAPP' ? `whatsapp:${to}` : to,
    From: channel === 'WHATSAPP' ? `whatsapp:${sender}` : sender,
    Body: body,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      logger.warn('notification.failed', {
        channel,
        status: response.status,
        detail: detail.slice(0, 200),
      });
      return { channel, delivered: false, mode: 'failed', reason: `PROVIDER_${response.status}` };
    }

    const payload = (await response.json().catch(() => ({}))) as { sid?: string };
    logger.info('notification.sent', { channel, providerId: payload.sid ?? null });
    return { channel, delivered: true, mode: 'twilio', providerId: payload.sid ?? null };
  } catch (error) {
    logger.warn('notification.failed', {
      channel,
      error: error instanceof Error ? error.message : String(error),
    });
    return { channel, delivered: false, mode: 'failed', reason: 'PROVIDER_UNREACHABLE' };
  }
}

export type BookingNotificationOutcome = {
  phone: string | null;
  sms: NotificationResult;
  whatsapp: NotificationResult;
};

export async function sendBookingNotifications(
  input: BookingMessageInput,
): Promise<BookingNotificationOutcome> {
  const requested: NotificationChannel[] =
    input.channels && input.channels.length ? input.channels : ['SMS', 'WHATSAPP'];
  const phone = normalizePhone(input.to);

  if (!phone) {
    logger.warn('notification.failed', { reason: 'INVALID_PHONE' });
    const invalid: NotificationResult = {
      channel: 'SMS',
      delivered: false,
      mode: 'failed',
      reason: 'INVALID_PHONE',
    };
    return { phone: null, sms: invalid, whatsapp: { ...invalid, channel: 'WHATSAPP' } };
  }

  const [sms, whatsapp] = await Promise.all([
    requested.includes('SMS')
      ? env.fast2smsConfigured
        ? deliverViaFast2Sms(phone, buildBookingSms(input))
        : deliverViaTwilio({ channel: 'SMS', to: phone, body: buildBookingSms(input) })
      : skipped('SMS'),
    requested.includes('WHATSAPP')
      ? env.metaWhatsappConfigured
        ? deliverViaMetaWhatsApp(phone, buildBookingWhatsApp(input), input)
        : deliverViaTwilio({ channel: 'WHATSAPP', to: phone, body: buildBookingWhatsApp(input) })
      : skipped('WHATSAPP'),
  ]);

  return { phone, sms, whatsapp };
}
