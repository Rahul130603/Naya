import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets');
const INLINE_ASSETS = [
  { cid: 'nayacura-logo', filename: 'nayacura-logo.png' },
  { cid: 'email-top-wave', filename: 'email-top-wave.png' },
  { cid: 'email-hero-devices', filename: 'email-hero-devices.png' },
  { cid: 'email-footer-wave', filename: 'email-footer-wave.png' },
  { cid: 'icon-consult', filename: 'icon-consult.png' },
  { cid: 'icon-lab', filename: 'icon-lab.png' },
  { cid: 'icon-shield', filename: 'icon-shield.png' },
  { cid: 'icon-box', filename: 'icon-box.png' },
];

function collectInlineAttachments(html) {
  if (!html) return [];
  return INLINE_ASSETS.filter((asset) => html.includes(`cid:${asset.cid}`))
    .map((asset) => {
      const fullPath = path.join(ASSETS_DIR, asset.filename);
      return existsSync(fullPath)
        ? { filename: asset.filename, path: fullPath, cid: asset.cid, contentDisposition: 'inline' }
        : null;
    })
    .filter(Boolean);
}

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
  'Access-Control-Allow-Headers': 'Content-Type,X-Notify-Token',
  'Access-Control-Max-Age': '86400',
};

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'Nayacura <hello@nayacura.com>';
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN || '';
const APP_URL = (process.env.APP_URL || 'https://naya-syft.onrender.com').replace(/\/+$/, '');
const SMTP_CONFIGURED = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && NOTIFY_TOKEN);

let mailTransport = null;
function getMailTransport() {
  if (!mailTransport) {
    mailTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return mailTransport;
}

const notifyHits = new Map();
function notifyRateLimited(ip) {
  const now = Date.now();
  const entry = notifyHits.get(ip);
  if (!entry || now > entry.resetAt) {
    notifyHits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 20;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderCardHtml({
  badge,
  titlePrefix = 'Welcome to ',
  titleAccent = 'Nayacura!',
  greeting,
  intro,
  secondaryText = '',
  details = [],
  showFeatures = true,
  showHeroDevices = true,
  cta,
  note,
  signoff = 'Nayacura Care Team',
}) {
  const detailsHtml = details.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 6px;background:#F8FBFF;border:1px solid #DCE7F6;border-radius:12px;">
        <tr><td style="padding:14px 18px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${details.map((d) => `<tr><td style="padding:6px 0;font-size:12px;color:#526987;font-weight:600;">${escapeHtml(d.label)}</td><td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:${d.accent ? '#16A34A' : '#0F294A'};">${escapeHtml(d.value)}</td></tr>`).join('')}
        </table></td></tr></table>`
    : '';
  const ctaHtml = cta
    ? `<div class="nc-cta-wrap" style="margin:18px 0 4px;"><a class="nc-cta-btn" href="${escapeHtml(cta.url)}" target="_blank" style="display:inline-block;padding:11px 24px;background:#169B24;color:#FFFFFF;font-size:13px;font-weight:700;text-decoration:none;border-radius:999px;">${escapeHtml(cta.label)} &rarr;</a></div>`
    : '';
  const featuresHtml = showFeatures
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 16px;background:#F4F7FA;border:1px solid #E2E8F0;border-radius:14px;border-collapse:separate;">
        <tr class="nc-feat-row">
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;"><table role="presentation"><tr><td width="34"><img src="cid:icon-consult" alt="" width="30" height="30" style="display:block;border:0;" /></td><td style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Book Consultations</div><div style="font-size:10px;color:#475569;margin-top:2px;">Online or In-Clinic</div></td></tr></table></td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;"><table role="presentation"><tr><td width="34"><img src="cid:icon-lab" alt="" width="30" height="30" style="display:block;border:0;" /></td><td style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Lab Tests</div><div style="font-size:10px;color:#475569;margin-top:2px;">At-Home &amp; Discreet</div></td></tr></table></td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;border-right:1px solid #DCE4EE;"><table role="presentation"><tr><td width="34"><img src="cid:icon-shield" alt="" width="30" height="30" style="display:block;border:0;" /></td><td style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Confidential &amp; Private</div><div style="font-size:10px;color:#475569;margin-top:2px;">Your Privacy, Our Priority</div></td></tr></table></td>
          <td class="nc-feat-cell" width="25%" valign="middle" style="padding:14px 10px;"><table role="presentation"><tr><td width="34"><img src="cid:icon-box" alt="" width="30" height="30" style="display:block;border:0;" /></td><td style="padding-left:7px;"><div style="font-size:11px;font-weight:700;color:#0F294A;line-height:1.25;">Wellness Orders</div><div style="font-size:10px;color:#475569;margin-top:2px;">Plain-Box Delivery</div></td></tr></table></td>
        </tr>
      </table>`
    : '';
  const noteHtml = note
    ? `<div style="margin-top:14px;padding:10px 14px;border:1px dashed #CBD5E1;border-radius:10px;background:#F8FAFC;font-size:12px;color:#475569;">${escapeHtml(note)}</div>`
    : '';
  const heroRightHtml = showHeroDevices
    ? `<td class="nc-hero-right" width="248" valign="middle" align="right" style="padding-left:10px;"><img class="nc-hero-img" src="cid:email-hero-devices" alt="Nayacura Care Portal" width="240" style="display:block;width:240px;max-width:100%;height:auto;border:0;" /></td>`
    : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><style>
  @media only screen and (max-width: 600px) {
    .nc-wrap { padding: 12px 6px !important; }
    .nc-hdr-pad { padding: 14px 0 6px 16px !important; }
    .nc-wave-top { width: 108px !important; }
    .nc-logo-img { width: 126px !important; }
    .nc-tagline { padding-left: 10px !important; font-size: 11px !important; }
    .nc-pad { padding: 10px 18px 8px !important; }
    .nc-hero-left { display: block !important; width: 100% !important; padding-right: 0 !important; box-sizing: border-box !important; }
    .nc-hero-right { display: block !important; width: 100% !important; padding: 18px 0 4px !important; text-align: center !important; box-sizing: border-box !important; }
    .nc-hero-img { margin: 0 auto !important; width: 255px !important; max-width: 92% !important; }
    .nc-title { font-size: 24px !important; }
    .nc-cta-wrap { width: 100% !important; }
    .nc-cta-btn { display: block !important; text-align: center !important; }
    .nc-feat-row { display: block !important; width: 100% !important; font-size: 0 !important; }
    .nc-feat-cell { display: inline-block !important; width: 49% !important; vertical-align: top !important; box-sizing: border-box !important; border-right: none !important; padding: 10px 8px !important; }
    .nc-footer-text { font-size: 11px !important; line-height: 1.7 !important; padding: 6px 14px 16px !important; }
  }
</style></head><body style="margin:0;padding:0;background:#EDF2F7;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1E293B;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="nc-wrap" style="background:#EDF2F7;padding:24px 10px;"><tr><td align="center">
      <table role="presentation" width="650" cellpadding="0" cellspacing="0" style="max-width:650px;width:100%;background:#FFFFFF;border:1px solid #DCE7F6;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td class="nc-hdr-pad" valign="middle" style="padding:18px 0 8px 26px;"><table role="presentation"><tr>
            <td style="padding-right:12px;"><img class="nc-logo-img" src="cid:nayacura-logo" alt="nayacura" width="142" style="display:block;width:142px;height:auto;border:0;" /></td>
            <td class="nc-tagline" style="border-left:1px solid #CBD5E1;padding-left:12px;font-size:12px;line-height:1.3;color:#334155;font-weight:600;">Sexual Wellness &amp;<br>Relationship Care</td>
          </tr></table></td>
          <td class="nc-wave-top" width="180" valign="top" align="right"><img class="nc-wave-top" src="cid:email-top-wave" alt="" width="180" style="display:block;width:180px;max-width:100%;height:auto;border:0;" /></td>
        </tr></table></td></tr>
        <tr><td class="nc-pad" style="padding:10px 28px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td class="nc-hero-left" valign="top" style="padding-right:8px;">
              <div style="display:inline-block;background:#E8F8EA;border-radius:999px;padding:4px 12px 4px 6px;margin-bottom:10px;">
                <span style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;border-radius:999px;background:#1EA12B;color:#FFFFFF;font-size:11px;font-weight:800;">&#10003;</span>
                <span style="font-size:11px;font-weight:800;color:#15803D;padding-left:4px;">${escapeHtml(badge)}</span>
              </div>
              <h1 class="nc-title" style="margin:0 0 10px;font-size:25px;line-height:1.18;font-weight:800;color:#0F294A;">${escapeHtml(titlePrefix)}<span style="color:#1EA12B;">${escapeHtml(titleAccent)}</span></h1>
              <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0F294A;">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 10px;font-size:13.5px;line-height:1.55;color:#334155;">${escapeHtml(intro)}</p>
              ${secondaryText ? `<p style="margin:0 0 6px;font-size:13.5px;line-height:1.55;color:#334155;">${escapeHtml(secondaryText)}</p>` : ''}
              ${ctaHtml}
            </td>
            ${heroRightHtml}
          </tr></table>
          ${detailsHtml}${featuresHtml}${noteHtml}
          <p style="margin:14px 0 8px;font-size:12.5px;color:#334155;line-height:1.6;">Need any assistance? We&#39;re here for you.<br><a href="mailto:support@nayacura.com" style="color:#1EA12B;font-weight:700;text-decoration:none;">&#9993;&nbsp; support@nayacura.com</a></p>
          <p style="margin:12px 0 10px;font-size:13px;color:#334155;">Warm regards,<br><strong style="color:#0F294A;font-size:14px;">${escapeHtml(signoff)}</strong></p>
        </td></tr>
        <tr><td style="padding:0;line-height:0;font-size:0;"><img src="cid:email-footer-wave" alt="" width="650" style="display:block;width:100%;height:auto;border:0;" /></td></tr>
        <tr><td class="nc-footer-text" bgcolor="#0C2F58" style="background:#0C2F58;padding:6px 20px 18px;text-align:center;color:#E2E8F0;font-size:11.5px;font-weight:600;">Secure &amp; Confidential &nbsp;&bull;&nbsp; Verified Experts &nbsp;&bull;&nbsp; Holistic Sexual Wellness</td></tr>
      </table>
    </td></tr></table></body></html>`;
}

function approvalMails({ to, name, doctorId, password, regNo }) {
  const loginUrl = `${APP_URL}/doctor-login`;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return [
    {
      subject: 'Welcome & Approval — Thank you for joining Nayacura',
      body: `Dear ${name},

Thank you for applying to practise on Nayacura. Our clinical governance team has verified your council registration (${regNo}) and approved your application on ${today}.

We are grateful that you have chosen to offer confidential, stigma-free sexual wellness care with us. Your private clinician suite is now active.

A separate email with your login credentials follows this message.

Warm regards,
Nayacura Clinical Governance Team (hello@nayacura.com)`,
      html: renderCardHtml({
        badge: 'APPLICATION APPROVED',
        titlePrefix: 'Welcome to ',
        titleAccent: 'Nayacura!',
        greeting: `Dear ${name},`,
        intro: `Our clinical governance team verified your council registration (${regNo}) and approved your application on ${today}.`,
        details: [
          { label: 'Clinician', value: name },
          { label: 'Registration No.', value: regNo },
          { label: 'Status', value: 'Verified & Active', accent: true },
        ],
        showHeroDevices: true,
        showFeatures: false,
        note: 'A separate email with your User ID and temporary password follows this message.',
        signoff: 'Nayacura Clinical Governance Team',
      }),
    },
    {
      subject: 'Your Nayacura clinician User ID, login email & password',
      body: `Dear ${name},

Your Nayacura clinician account is ready.

User ID (Doctor ID): ${doctorId}
Login email: ${to}
Temporary password: ${password}
Sign in: ${loginUrl}

Please change your password from Profile & Security after your first login.

Warm regards,
Nayacura Clinician Onboarding (hello@nayacura.com)`,
      html: renderCardHtml({
        badge: 'CREDENTIALS ISSUED',
        titlePrefix: 'Clinician ',
        titleAccent: 'Login Credentials',
        greeting: `Dear ${name},`,
        intro: 'Your Nayacura clinician account is approved and ready. Sign in using your User ID (Doctor ID) or Login Email and Temporary Password below.',
        details: [
          { label: 'User ID (Doctor ID)', value: doctorId, accent: true },
          { label: 'Login Email', value: to },
          { label: 'Temporary Password', value: password, accent: true },
        ],
        showHeroDevices: false,
        showFeatures: false,
        cta: { label: 'Sign In to Doctor Portal', url: loginUrl },
        note: 'Please change your password from Profile & Security after your first login.',
        signoff: 'Nayacura Clinician Onboarding',
      }),
    },
  ];
}

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
    room = { code, participants: { doctor: null, patient: null }, signals: [], seq: 0, status: 'waiting', completedAt: null, lastActivity: now };
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

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'health') {
    json(res, 200, { status: 'ok', service: 'nayacura-rooms', rooms: rooms.size, email: SMTP_CONFIGURED });
    return;
  }

  if (req.method === 'POST' && parts[0] === 'notify' && parts[1] === 'welcome' && parts.length === 2) {
    const clientIp = req.socket.remoteAddress || 'unknown';
    if (!SMTP_CONFIGURED) {
      json(res, 503, { sent: false, message: 'Email service is not configured on the server.' });
      return;
    }
    if (req.headers['x-notify-token'] !== NOTIFY_TOKEN) {
      json(res, 401, { sent: false, message: 'Invalid notification token.' });
      return;
    }
    if (notifyRateLimited(clientIp)) {
      json(res, 429, { sent: false, message: 'Too many email requests. Try again later.' });
      return;
    }
    const payload = await readBody(req);
    const validEmail = typeof payload?.to === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to);
    if (!payload || !validEmail || !payload.name) {
      json(res, 400, { sent: false, message: 'Invalid welcome notification payload.' });
      return;
    }
    const role = payload.role === 'doctor' ? 'doctor' : 'patient';
    const applicationId = typeof payload?.applicationId === 'string' ? payload.applicationId.trim() : '';
    const subject = role === 'doctor'
      ? 'Welcome to Nayacura — Clinician Application Received'
      : 'Welcome to Nayacura — Your Confidential Wellness Space';
    const text = role === 'doctor'
      ? `Dear ${payload.name},\n\nWelcome to Nayacura! Thank you for registering as a clinician.\n\n${applicationId ? `Application ID: ${applicationId}\n` : ''}Our clinical governance team is reviewing your credentials. Once approved by the administrator, your User ID (Doctor ID), login email, and temporary password will be sent to ${payload.to} from hello@nayacura.com.\n\nWarm regards,\nNayacura Clinician Onboarding (hello@nayacura.com)`
      : `Dear ${payload.name},\n\nWelcome to Nayacura! Your confidential patient account (${payload.to}) is ready.\n\nYou can now book private consultations, ask anonymous sexual health doubts, and track plain-box wellness orders.\n\nFor assistance, write to support@nayacura.com.\n\nWarm regards,\nNayacura Care Team (hello@nayacura.com)`;
    const html = role === 'doctor'
      ? renderCardHtml({
          badge: 'APPLICATION RECEIVED',
          titlePrefix: 'Welcome to ',
          titleAccent: 'Nayacura!',
          greeting: `Dear ${payload.name},`,
          intro: 'Thank you for applying to practise on Nayacura. Our clinical governance team is verifying your medical registration.',
          secondaryText: 'Once approved by the administrator, your User ID (Doctor ID) and temporary password will be sent to this email from hello@nayacura.com.',
          details: [
            ...(applicationId ? [{ label: 'Application ID', value: applicationId, accent: true }] : []),
            { label: 'Registered Email', value: payload.to },
            { label: 'Status', value: 'Pending Admin Approval', accent: true },
          ],
          showHeroDevices: true,
          showFeatures: false,
          cta: { label: 'Doctor Sign In Page', url: `${APP_URL}/doctor-login` },
          signoff: 'Nayacura Clinician Onboarding',
        })
      : renderCardHtml({
          badge: 'ACCOUNT ACTIVATED',
          titlePrefix: 'Welcome to ',
          titleAccent: 'Nayacura!',
          greeting: `Dear ${payload.name},`,
          intro: 'Your confidential patient account has been created successfully and is now ready to use.',
          secondaryText: 'You can now access expert consultations, get sexual health guidance, book lab tests, and manage your wellness journey—all in one place.',
          cta: { label: 'Go to My Account', url: `${APP_URL}/patient-dashboard` },
        });
    try {
      const transport = getMailTransport();
      await transport.sendMail({
        from: SMTP_FROM,
        to: payload.to,
        subject,
        text,
        html,
        attachments: collectInlineAttachments(html),
      });
      json(res, 200, { sent: true, from: SMTP_FROM });
    } catch (error) {
      console.error('welcome email delivery failed:', error?.message || error);
      json(res, 502, { sent: false, message: 'SMTP delivery failed.' });
    }
    return;
  }

  if (req.method === 'POST' && parts[0] === 'notify' && parts[1] === 'doctor-approved' && parts.length === 2) {
    const clientIp = req.socket.remoteAddress || 'unknown';
    if (!SMTP_CONFIGURED) {
      json(res, 503, { sent: false, message: 'Email service is not configured on the server.' });
      return;
    }
    if (req.headers['x-notify-token'] !== NOTIFY_TOKEN) {
      json(res, 401, { sent: false, message: 'Invalid notification token.' });
      return;
    }
    if (notifyRateLimited(clientIp)) {
      json(res, 429, { sent: false, message: 'Too many email requests. Try again later.' });
      return;
    }

    const payload = await readBody(req);
    const validEmail = typeof payload?.to === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to);
    if (!payload || !validEmail || !payload.name || !payload.doctorId || !payload.password) {
      json(res, 400, { sent: false, message: 'Invalid notification payload.' });
      return;
    }

    try {
      const transport = getMailTransport();
      const mails = approvalMails({
        to: payload.to,
        name: String(payload.name).slice(0, 120),
        doctorId: String(payload.doctorId).slice(0, 40),
        password: String(payload.password).slice(0, 60),
        regNo: String(payload.regNo || '').slice(0, 60),
      });
      for (const mail of mails) {
        await transport.sendMail({
          from: SMTP_FROM,
          to: payload.to,
          subject: mail.subject,
          text: mail.body,
          html: mail.html,
          attachments: collectInlineAttachments(mail.html),
        });
      }
      json(res, 200, { sent: true, count: mails.length, from: SMTP_FROM });
    } catch (error) {
      console.error('approval email delivery failed:', error?.message || error);
      json(res, 502, { sent: false, message: 'SMTP delivery failed.' });
    }
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

  if (action === 'complete') {
    room.status = 'completed';
    room.completedAt = Date.now();
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
