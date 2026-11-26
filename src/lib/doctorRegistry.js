const APPLICATIONS_KEY = 'nayacura_doctor_applications_v1';
const ACCOUNTS_KEY = 'nayacura_doctor_accounts_v1';
const PATIENT_ACCOUNTS_KEY = 'nayacura_patient_accounts_v1';
const MAIL_KEY = 'nayacura_mail_outbox_v1';
const EVENT = 'nayacura:doctor-registry';

export const HELLO_EMAIL = 'hello@nayacura.com';

const rawNotifyBase = import.meta.env?.VITE_NOTIFY_URL || import.meta.env?.VITE_ROOM_API_URL || '';
const NOTIFY_BASE = rawNotifyBase
  ? (/^https?:\/\//i.test(rawNotifyBase) ? rawNotifyBase : `https://${rawNotifyBase}`).replace(/\/+$/, '')
  : '/api/demo-rooms';
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

export function listPatientAccounts() {
  return read(PATIENT_ACCOUNTS_KEY, []);
}

export function listMail() {
  return read(MAIL_KEY, []);
}

function appendMail(items) {
  write(MAIL_KEY, [...items, ...listMail()].slice(0, 60));
}

export function updateMailDelivery(mailIds, status) {
  const ids = Array.isArray(mailIds) ? mailIds.filter(Boolean) : [mailIds].filter(Boolean);
  if (!ids.length) return;
  const deliveryStatus = status?.sent
    ? 'sent'
    : status?.previewUrl
      ? 'preview'
      : 'outbox-only';
  write(
    MAIL_KEY,
    listMail().map((item) => (ids.includes(item.id)
      ? {
          ...item,
          deliveryStatus,
          deliveryReason: status?.reason || (status?.sent ? 'SMTP_SENT' : 'SMTP_NOT_CONFIGURED'),
          previewUrl: status?.previewUrl || item.previewUrl || null,
        }
      : item)),
  );
}

export async function dispatchWelcomeEmail({ to, name, role, applicationId, mailId }) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (NOTIFY_TOKEN) headers['X-Notify-Token'] = NOTIFY_TOKEN;
    const response = await fetch(`${NOTIFY_BASE}/notify/welcome`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, name, role, applicationId }),
    });
    if (!response.ok) {
      const fallback = { sent: false, reason: 'not-configured', mode: 'skipped', previewUrl: null };
      updateMailDelivery(mailId, fallback);
      return fallback;
    }
    const data = await response.json().catch(() => ({}));
    const result = {
      sent: Boolean(data?.sent),
      reason: data?.sent ? 'sent' : (data?.reason || 'not-configured'),
      mode: data?.mode || (data?.sent ? 'smtp' : 'skipped'),
      previewUrl: data?.previewUrl || null,
      from: data?.from || HELLO_EMAIL,
    };
    updateMailDelivery(mailId, result);
    return result;
  } catch {
    const fallback = { sent: false, reason: 'unreachable', mode: 'skipped', previewUrl: null };
    updateMailDelivery(mailId, fallback);
    return fallback;
  }
}

export function registerPatient({ name, email, password }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanName) throw new Error('Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const existing = listPatientAccounts().find(
    (item) => item.email?.toLowerCase() === cleanEmail,
  );
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const now = new Date();
  const patient = {
    id: newId('NC-PAT'),
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    role: 'patient',
    city: 'Chennai',
    createdAt: now.toISOString(),
  };

  const welcomeMail = {
    id: newId('MAIL'),
    type: 'patient-welcome',
    from: HELLO_EMAIL,
    to: cleanEmail,
    subject: 'Welcome to Nayacura — Your Confidential Wellness Space',
    sentAt: now.toISOString(),
    body: `Dear ${cleanName},

Welcome to Nayacura! Your confidential patient account has been created using ${cleanEmail}.

Patient ID: ${patient.id}
Sign-in email: ${cleanEmail}

You can now book private sexologist consultations, ask anonymous sexual health doubts, book discreet at-home lab tests, and track plain-box wellness orders.

If you ever need assistance, write to support@nayacura.com.

Warm regards,
Nayacura Care Team (${HELLO_EMAIL})`,
  };

  write(PATIENT_ACCOUNTS_KEY, [patient, ...listPatientAccounts()]);
  appendMail([welcomeMail]);

  return { patient, welcomeMail };
}

export function findPatientByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return listPatientAccounts().find((item) => item.email?.toLowerCase() === normalized) || null;
}

export function submitApplication(input, options = {}) {
  const now = new Date();
  const application = {
    id: newId('DOC-REQ'),
    status: 'pending',
    submittedAt: now.toISOString(),
    ...input,
  };

  const welcomeMail = {
    id: newId('MAIL'),
    type: 'doctor-welcome',
    from: HELLO_EMAIL,
    to: application.email,
    subject: 'Welcome to Nayacura — Clinician Application Received',
    sentAt: now.toISOString(),
    body: `Dear ${application.fullName},

Welcome to Nayacura! Thank you for registering as a clinician on our confidential sexual wellness platform.

Application ID: ${application.id}
Registered Email: ${application.email}
Council Registration: ${application.regNo} (${application.council})

Our clinical governance team is reviewing your credentials. Once approved by the administrator, your User ID (Doctor ID), login email, and temporary password will be sent to ${application.email} from ${HELLO_EMAIL}.

Warm regards,
Nayacura Clinician Onboarding (${HELLO_EMAIL})`,
  };

  write(APPLICATIONS_KEY, [application, ...listApplications()]);
  appendMail([welcomeMail]);
  if (!options?.deferDispatch) {
    void dispatchWelcomeEmail({
      to: application.email,
      name: application.fullName,
      role: 'doctor',
      applicationId: application.id,
      mailId: welcomeMail.id,
    });
  }

  return { ...application, welcomeMailId: welcomeMail.id };
}

export function findApplicationByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return listApplications().find((application) => application.email?.toLowerCase() === normalized) || null;
}

export function findAccountByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  return listAccounts().find((account) => account.email?.toLowerCase() === normalized) || null;
}

function buildApprovalBundle(account) {
  const approvedAt = new Date();
  const approvedLabel = approvedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const mails = [
    {
      id: newId('MAIL'),
      type: 'thank-you',
      from: HELLO_EMAIL,
      to: account.email,
      subject: 'Welcome & Approval — Thank you for joining Nayacura',
      sentAt: approvedAt.toISOString(),
      body: `Dear ${account.name},

Thank you for applying to practise on Nayacura. Our clinical governance team has verified your council registration (${account.regNo}) and approved your application on ${approvedLabel}.

We are grateful that you have chosen to offer confidential, stigma-free sexual wellness care with us. Your private clinician suite is now active.

A separate email with your login credentials follows this message.

Warm regards,
Nayacura Clinical Governance Team (${HELLO_EMAIL})`,
    },
    {
      id: newId('MAIL'),
      type: 'credentials',
      from: HELLO_EMAIL,
      to: account.email,
      subject: 'Your Nayacura clinician login email & password',
      sentAt: new Date(approvedAt.getTime() + 1000).toISOString(),
      body: `Dear ${account.name},

Your Nayacura clinician account is approved and ready.

Doctor ID: ${account.id}
Login Email: ${account.email}
Temporary Password: ${account.password}

Sign in at /doctor-login using your Login Email and Temporary Password, then update your password from Profile & Security after your first login.

For clinical governance queries write to support@nayacura.com.

Warm regards,
Nayacura Clinician Onboarding (${HELLO_EMAIL})`,
    },
  ];
  return mails;
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

  const mails = buildApprovalBundle(account);

  write(ACCOUNTS_KEY, [account, ...listAccounts()]);
  appendMail(mails);
  write(
    APPLICATIONS_KEY,
    applications.map((item) => (item.id === applicationId
      ? { ...item, status: 'approved', doctorId: account.id, approvedAt: account.approvedAt }
      : item)),
  );

  return { account, mails };
}

export function approveDirectDoctor(doc) {
  if (!doc || !doc.email) return null;
  const account = {
    id: newId('NC-DOC'),
    applicationId: doc.id || newId('DOC-REQ'),
    name: doc.name,
    email: doc.email,
    password: newPassword(),
    regNo: doc.regNo || 'NMC-VERIFIED',
    council: doc.council || 'Medical Council',
    specialty: doc.specialty || 'Clinical Sexologist',
    qualifications: doc.degrees || '',
    experience: doc.experience || '',
    city: doc.city || 'Chennai',
    role: 'doctor',
    approvedAt: new Date().toISOString(),
  };

  const mails = buildApprovalBundle(account);
  write(ACCOUNTS_KEY, [account, ...listAccounts()]);
  appendMail(mails);
  return { account, mails };
}

/**
 * Sends the two approval emails from hello@nayacura.com through the configured relay.
 */
export async function sendApprovalEmails(account, mailIds = []) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (NOTIFY_TOKEN) headers['X-Notify-Token'] = NOTIFY_TOKEN;
    const response = await fetch(`${NOTIFY_BASE}/notify/doctor-approved`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: account.email,
        name: account.name,
        doctorId: account.id,
        password: account.password,
        regNo: account.regNo,
      }),
    });
    if (!response.ok) {
      const fallback = { sent: false, reason: 'not-configured', previewUrl: null };
      updateMailDelivery(mailIds, fallback);
      return fallback;
    }
    const data = await response.json().catch(() => ({}));
    const result = {
      sent: Boolean(data?.sent),
      reason: data?.sent ? 'sent' : (data?.reason || 'not-configured'),
      previewUrl: data?.previewUrl || null,
    };
    updateMailDelivery(mailIds, result);
    return result;
  } catch {
    const fallback = { sent: false, reason: 'unreachable', previewUrl: null };
    updateMailDelivery(mailIds, fallback);
    return fallback;
  }
}

export function rejectApplication(applicationId) {
  write(
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
