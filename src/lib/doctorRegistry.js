const APPLICATIONS_KEY = 'nayacura_doctor_applications_v1';
const ACCOUNTS_KEY = 'nayacura_doctor_accounts_v1';
const MAIL_KEY = 'nayacura_mail_outbox_v1';
const EVENT = 'nayacura:doctor-registry';

const rawNotifyBase = import.meta.env?.VITE_NOTIFY_URL || import.meta.env?.VITE_ROOM_API_URL || '';
const NOTIFY_BASE = rawNotifyBase
  ? (/^https?:\/\//i.test(rawNotifyBase) ? rawNotifyBase : `https://${rawNotifyBase}`).replace(/\/+$/, '')
  : '';
const NOTIFY_TOKEN = import.meta.env?.VITE_NOTIFY_TOKEN || '';

const hasWindow = () => typeof window !== 'undefined';

function read(key, fallback) {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be blocked */
  }
  window.dispatchEvent(new Event(EVENT));
}

const newId = (prefix) => {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${random}`;
};

const newPassword = () => `Naya@${Math.floor(100000 + Math.random() * 900000)}`;

export function listApplications() {
  return read(APPLICATIONS_KEY, []);
}

export function listAccounts() {
  return read(ACCOUNTS_KEY, []);
}

export function listMail() {
  return read(MAIL_KEY, []);
}

export function submitApplication(input) {
  const application = {
    id: newId('DOC-REQ'),
    status: 'pending',
    submittedAt: new Date().toISOString(),
    ...input,
  };
  write(APPLICATIONS_KEY, [application, ...listApplications()]);
  return application;
}

export function findApplicationByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return listApplications().find((application) => application.email?.toLowerCase() === normalized) || null;
}

export function findAccountByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return listAccounts().find((account) => account.email?.toLowerCase() === normalized) || null;
}

export function approveApplication(applicationId) {
  const applications = listApplications();
  const application = applications.find((item) => item.id === applicationId);
  if (!application) return null;

  const account = {
    id: newId('NC-DOC'),
    applicationId: application.id,
    name: application.fullName,
    email: application.email,
    password: newPassword(),
    regNo: application.regNo,
    council: application.council,
    specialty: application.specialty,
    qualifications: application.qualification,
    experience: application.experience,
    city: application.city,
    role: 'doctor',
    approvedAt: new Date().toISOString(),
  };

  const approvedAt = new Date();
  const approvedLabel = approvedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const mails = [
    {
      id: newId('MAIL'),
      type: 'thank-you',
      to: account.email,
      subject: 'Thank you for joining Nayacura as a clinician',
      sentAt: approvedAt.toISOString(),
      body: `Dear ${account.name},

Thank you for applying to practise on Nayacura. Our clinical governance team has verified your council registration (${account.regNo}) and approved your application on ${approvedLabel}.

We are grateful that you have chosen to offer confidential, stigma-free sexual wellness care with us. Your private clinician suite is now active.

A separate email with your login credentials follows this message.

Warm regards,
Nayacura Clinical Governance Team`,
    },
    {
      id: newId('MAIL'),
      type: 'credentials',
      to: account.email,
      subject: 'Your Nayacura clinician account credentials',
      sentAt: new Date(approvedAt.getTime() + 1000).toISOString(),
      body: `Dear ${account.name},

Your Nayacura clinician account is ready.

Doctor ID: ${account.id}
Login email: ${account.email}
Temporary password: ${account.password}

Sign in at /doctor-login and change your password from Profile & Security after your first login.

For clinical governance queries write to support@nayacura.example.

Warm regards,
Nayacura Clinician Onboarding`,
    },
  ];

  write(ACCOUNTS_KEY, [account, ...listAccounts()]);
  write(MAIL_KEY, [...mails, ...listMail()]);
  write(
    APPLICATIONS_KEY,
    applications.map((item) => (item.id === applicationId
      ? { ...item, status: 'approved', doctorId: account.id, approvedAt: account.approvedAt }
      : item)),
  );

  return { account, mails };
}

/**
 * Sends the two approval emails from the configured mailbox
 * (supportnayacura@gmail.com) through the rooms service SMTP relay.
 */
export async function sendApprovalEmails(account) {
  if (!NOTIFY_BASE) return { sent: false, reason: 'not-configured' };
  try {
    const response = await fetch(`${NOTIFY_BASE}/notify/doctor-approved`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Notify-Token': NOTIFY_TOKEN,
      },
      body: JSON.stringify({
        to: account.email,
        name: account.name,
        doctorId: account.id,
        password: account.password,
        regNo: account.regNo,
      }),
    });
    if (!response.ok) return { sent: false, reason: 'failed' };
    return { sent: true };
  } catch {
    return { sent: false, reason: 'unreachable' };
  }
}

export function rejectApplication(applicationId) {  write(
    APPLICATIONS_KEY,
    listApplications().map((item) => (item.id === applicationId
      ? { ...item, status: 'rejected', rejectedAt: new Date().toISOString() }
      : item)),
  );
}

export function subscribeRegistry(callback) {
  if (!hasWindow()) return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
