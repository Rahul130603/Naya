const APPLICATIONS_KEY = 'nayacura_doctor_applications_v1';
const ACCOUNTS_KEY = 'nayacura_doctor_accounts_v1';
const PUBLIC_DOCTORS_KEY = 'nayacura_public_doctors_v1';
const DOCTOR_PROFILES_KEY = 'nayacura_doctor_profiles_v1';
const PATIENT_ACCOUNTS_KEY = 'nayacura_patient_accounts_v1';
const MAIL_KEY = 'nayacura_mail_outbox_v1';
const EVENT = 'nayacura:doctor-registry';

export const HELLO_EMAIL = 'hello@nayacura.com';
export const EMAIL_ALREADY_USED_MESSAGE =
  'This email is already used. Please sign in or use a different email address.';

const RESERVED_PLATFORM_EMAILS = new Set([
  'dr.arvind@nayacura.clinic',
  'suresh.kumar@nayacura.patient',
  'admin@nayacura.internal',
  'dr.annamalai@medtrust.org',
  'dr.sneha@vitalityclinic.in',
  'hello@nayacura.com',
  'support@nayacura.com',
  'patient@nayacura.demo',
  'doctor@nayacura.demo',
  'admin@nayacura.demo',
  'ishaan.kapoor@nayacura.demo',
]);

export function normalizeEmailValue(email) {
  return String(email || '').trim().toLowerCase();
}

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

export function listPublicDoctors() {
  const cached = read(PUBLIC_DOCTORS_KEY, []);
  const localAccounts = listAccounts().filter((account) => account.role === 'doctor' && account.approvedAt);
  const byKey = new Map();
  for (const item of [...localAccounts, ...cached]) {
    if (!item?.name) continue;
    const key = String(item.id || item.name).trim().toLowerCase();
    if (!byKey.has(key)) {
      const override = getDoctorProfileOverride(item.email, item.name);
      byKey.set(key, override ? { ...item, ...override } : item);
    }
  }
  return [...byKey.values()];
}

function doctorProfileMapKey(email, name) {
  const cleanEmail = normalizeEmailValue(email);
  if (cleanEmail) return cleanEmail;
  const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return cleanName ? `name:${cleanName}` : '';
}

export function getDoctorProfileOverride(email, name) {
  const map = read(DOCTOR_PROFILES_KEY, {});
  const emailKey = doctorProfileMapKey(email, '');
  const nameKey = doctorProfileMapKey('', name);
  return (emailKey && map[emailKey]) || (nameKey && map[nameKey]) || null;
}

export function saveDoctorProfileLocal(profile) {
  if (!profile) return null;
  const map = { ...read(DOCTOR_PROFILES_KEY, {}) };
  const emailKey = doctorProfileMapKey(profile.email, '');
  const nameKey = doctorProfileMapKey('', profile.name);
  const entry = {
    ...profile,
    email: normalizeEmailValue(profile.email || '') || profile.email || '',
    clinicName: profile.clinicName || profile.clinic || 'Nayacura Partner Clinic',
    clinic: profile.clinic || profile.clinicName || 'Nayacura Partner Clinic',
    updatedAt: new Date().toISOString(),
  };
  if (emailKey) map[emailKey] = entry;
  if (nameKey) map[nameKey] = entry;
  write(DOCTOR_PROFILES_KEY, map);

  const accounts = listAccounts();
  let updatedAccounts = false;
  const nextAccounts = accounts.map((acc) => {
    const sameEmail = entry.email && normalizeEmailValue(acc.email) === normalizeEmailValue(entry.email);
    const sameId = profile.id && acc.id === profile.id;
    if (!sameEmail && !sameId) return acc;
    updatedAccounts = true;
    return {
      ...acc,
      name: entry.name || acc.name,
      regNo: entry.regNo ?? acc.regNo,
      council: entry.council ?? acc.council,
      specialty: entry.specialty ?? acc.specialty,
      qualifications: entry.qualifications ?? acc.qualifications,
      experience: entry.experience ?? acc.experience,
      languages: entry.languages ?? acc.languages,
      city: entry.city ?? acc.city,
      clinicName: entry.clinicName ?? acc.clinicName,
      phone: entry.phone ?? acc.phone,
      about: entry.about ?? acc.about,
      fee: entry.fee ?? acc.fee,
      videoFee: entry.videoFee ?? acc.videoFee,
      photoUrl: entry.photoUrl !== undefined ? entry.photoUrl : acc.photoUrl,
    };
  });
  if (updatedAccounts) {
    write(ACCOUNTS_KEY, nextAccounts);
  }
  return entry;
}

export async function syncDoctorProfileToServer(profile) {
  const response = await csrfPost('/api/doctor-registry/profile', profile);
  if (response?.ok) {
    void hydratePublicDoctors();
    return { ok: true };
  }
  return { ok: false };
}

export async function hydrateDoctorProfile({ email, name } = {}) {
  if (!hasWindow() || typeof fetch !== 'function') return getDoctorProfileOverride(email, name);
  if (!email && !name) return null;
  try {
    const params = new URLSearchParams();
    if (email) params.set('email', normalizeEmailValue(email));
    if (name) params.set('name', name);
    const response = await fetch(`/api/doctor-registry/profile?${params.toString()}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return getDoctorProfileOverride(email, name);
    const data = await response.json().catch(() => ({}));
    if (data?.profile) {
      saveDoctorProfileLocal(data.profile);
      return data.profile;
    }
    return getDoctorProfileOverride(email, name);
  } catch {
    return getDoctorProfileOverride(email, name);
  }
}

export async function changeDoctorPassword({
  email,
  id,
  name,
  regNo,
  council,
  specialty,
  city,
  clinicName,
  currentPassword,
  newPassword,
}) {
  const cleanEmail = normalizeEmailValue(email);
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, message: 'A valid doctor email is required to update password.' };
  }
  if (!newPassword || String(newPassword).length < 6) {
    return { ok: false, message: 'New password must be at least 6 characters.' };
  }

  const accounts = listAccounts();
  const localIndex = accounts.findIndex(
    (item) => normalizeEmailValue(item.email) === cleanEmail || (id && item.id === id),
  );
  if (localIndex >= 0) {
    const localAcc = accounts[localIndex];
    if (localAcc.password && localAcc.password !== String(currentPassword || '')) {
      return { ok: false, message: 'Current password is incorrect.' };
    }
  }

  const response = await csrfPost('/api/doctor-registry/change-password', {
    id,
    email: cleanEmail,
    name,
    regNo,
    council,
    specialty,
    city,
    clinicName,
    currentPassword,
    newPassword,
  });

  let serverId = id;
  if (response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, message: data?.message || 'Could not update password.' };
    }
    if (data?.id) serverId = data.id;
  }

  if (localIndex >= 0) {
    const next = [...accounts];
    next[localIndex] = { ...next[localIndex], password: newPassword };
    write(ACCOUNTS_KEY, next);
  } else {
    const newAcc = {
      id: serverId || newId('NC-DOC'),
      name: name || 'Clinician',
      email: cleanEmail,
      password: newPassword,
      regNo: regNo || 'NMC-VERIFIED',
      council: council || 'Medical Council',
      specialty: specialty || 'Clinical Sexologist',
      city: city || 'Chennai',
      clinicName: clinicName || 'Nayacura Partner Clinic',
      role: 'doctor',
    };
    write(ACCOUNTS_KEY, [newAcc, ...accounts]);
  }

  return { ok: true, message: 'Password updated! Use your new password next time you sign in.' };
}

async function csrfPost(url, body) {
  if (!hasWindow() || typeof fetch !== 'function' || typeof document === 'undefined') return null;
  try {
    let token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('nayacura_csrf='))
      ?.split('=')[1];
    if (!token) {
      await fetch('/api/auth/csrf', { credentials: 'include' }).catch(() => null);
      token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('nayacura_csrf='))
        ?.split('=')[1];
    }
    return await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-Token': decodeURIComponent(token) } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

export function isEmailUsedLocally(email, { excludeApplicationId } = {}) {
  const normalized = normalizeEmailValue(email);
  if (!normalized) return false;
  if (RESERVED_PLATFORM_EMAILS.has(normalized)) return true;

  if (listPatientAccounts().some((item) => normalizeEmailValue(item?.email) === normalized)) {
    return true;
  }
  if (listAccounts().some((item) => normalizeEmailValue(item?.email) === normalized)) {
    return true;
  }
  if (
    listApplications().some(
      (item) =>
        normalizeEmailValue(item?.email) === normalized &&
        (!excludeApplicationId || item?.id !== excludeApplicationId),
    )
  ) {
    return true;
  }
  return false;
}

export async function checkEmailAvailability(email) {
  const normalized = normalizeEmailValue(email);
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { available: true };
  }
  if (isEmailUsedLocally(normalized)) {
    return { available: false, message: EMAIL_ALREADY_USED_MESSAGE };
  }
  if (!hasWindow() || typeof fetch !== 'function') {
    return { available: true };
  }
  try {
    const response = await fetch(
      `/api/registry/check-email?email=${encodeURIComponent(normalized)}`,
      { credentials: 'include', cache: 'no-store' },
    );
    if (!response.ok) return { available: true };
    const data = await response.json().catch(() => ({}));
    if (data?.available === false) {
      return {
        available: false,
        message: data.message || EMAIL_ALREADY_USED_MESSAGE,
      };
    }
    return { available: true };
  } catch {
    return { available: true };
  }
}

export async function syncApplicationToServerWithStatus(application) {
  const response = await csrfPost('/api/doctor-registry/applications', application);
  if (!response) return { ok: false, conflict: false };
  if (response.status === 409) {
    const data = await response.json().catch(() => ({}));
    return {
      ok: false,
      conflict: true,
      message: data?.message || EMAIL_ALREADY_USED_MESSAGE,
    };
  }
  return { ok: response.ok, conflict: false };
}

export async function syncApplicationToServer(application) {
  const result = await syncApplicationToServerWithStatus(application);
  return Boolean(result.ok);
}

export async function syncPatientToServer(patient) {
  const response = await csrfPost('/api/patient-registry/accounts', {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    city: patient.city,
    createdAt: patient.createdAt,
  });
  if (!response) return { ok: false, conflict: false };
  if (response.status === 409) {
    const data = await response.json().catch(() => ({}));
    return {
      ok: false,
      conflict: true,
      message: data?.message || EMAIL_ALREADY_USED_MESSAGE,
    };
  }
  return { ok: response.ok, conflict: false };
}

export function rollbackLocalRegistration({ applicationId, patientId, mailId } = {}) {
  if (applicationId) {
    write(
      APPLICATIONS_KEY,
      listApplications().filter((item) => item.id !== applicationId),
    );
  }
  if (patientId) {
    write(
      PATIENT_ACCOUNTS_KEY,
      listPatientAccounts().filter((item) => item.id !== patientId),
    );
  }
  if (mailId) {
    write(
      MAIL_KEY,
      listMail().filter((item) => item.id !== mailId),
    );
  }
}

export async function syncAccountToServer(account) {
  const response = await csrfPost('/api/doctor-registry/accounts', account);
  if (response?.ok) {
    void hydratePublicDoctors();
    return true;
  }
  return false;
}

export async function hydrateApplications() {
  if (!hasWindow() || typeof fetch !== 'function') return listApplications();
  try {
    const response = await fetch('/api/doctor-registry/applications', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return listApplications();
    const data = await response.json();
    const remote = Array.isArray(data?.applications) ? data.applications : [];
    const local = listApplications();
    const merged = new Map();
    for (const item of [...remote, ...local]) {
      if (item?.id && !merged.has(item.id)) merged.set(item.id, item);
    }
    const next = [...merged.values()].sort((a, b) =>
      String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')),
    );
    write(APPLICATIONS_KEY, next);
    return next;
  } catch {
    return listApplications();
  }
}

export async function hydratePublicDoctors() {
  if (!hasWindow() || typeof fetch !== 'function') return listPublicDoctors();
  try {
    const response = await fetch('/api/doctor-registry/public', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return listPublicDoctors();
    const data = await response.json();
    const remote = Array.isArray(data?.doctors) ? data.doctors : [];
    write(PUBLIC_DOCTORS_KEY, remote);
    return listPublicDoctors();
  } catch {
    return listPublicDoctors();
  }
}

export async function loginDoctorAccount(identifier, password) {
  const normalized = String(identifier || '').trim().toLowerCase();
  const localAccount = listAccounts().find((item) => (
    item.email?.toLowerCase() === normalized
    || item.id?.toLowerCase() === normalized
    || item.regNo?.toLowerCase() === normalized
  ));

  if (localAccount) {
    if (localAccount.password !== password) {
      return {
        status: 'invalid_password',
        message: 'Incorrect password. Use the temporary password from your credentials email.',
      };
    }
    const override = getDoctorProfileOverride(localAccount.email, localAccount.name);
    return {
      status: 'ok',
      account: override ? { ...localAccount, ...override, email: localAccount.email } : localAccount,
    };
  }

  const response = await csrfPost('/api/doctor-registry/login', { identifier, password });
  if (response) {
    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.account) {
      const override = getDoctorProfileOverride(data.account.email, data.account.name);
      return {
        status: 'ok',
        account: override ? { ...data.account, ...override, email: data.account.email } : data.account,
      };
    }
    if (data?.status === 'invalid_password' || data?.status === 'pending' || data?.status === 'rejected') {
      return data;
    }
  }

  const application = findApplicationByEmail(normalized);
  if (application?.status === 'pending') {
    return {
      status: 'pending',
      message: 'Your clinician application is still under review. Credentials arrive by email after approval.',
    };
  }
  if (application?.status === 'rejected') {
    return {
      status: 'rejected',
      message: 'This application was not approved. Write to support@nayacura.com for assistance.',
    };
  }

  return { status: 'not_found' };
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
  const cleanEmail = normalizeEmailValue(email);
  const cleanPassword = String(password || '');

  if (!cleanName) throw new Error('Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (isEmailUsedLocally(cleanEmail)) {
    throw new Error(EMAIL_ALREADY_USED_MESSAGE);
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
  const cleanEmail = normalizeEmailValue(input?.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }
  if (isEmailUsedLocally(cleanEmail)) {
    throw new Error(EMAIL_ALREADY_USED_MESSAGE);
  }

  const now = new Date();
  const application = {
    id: newId('DOC-REQ'),
    status: 'pending',
    submittedAt: now.toISOString(),
    ...input,
    email: cleanEmail,
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
  if (!options?.deferSync && !options?.deferDispatch) {
    void syncApplicationToServer(application);
  }
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
    university: application.university,
    experience: application.experience,
    languages: application.languages,
    city: application.city,
    clinicName: application.clinicName,
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
  void syncAccountToServer(account);

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
    languages: doc.languages || '',
    city: doc.city || 'Chennai',
    clinicName: doc.clinicName || '',
    role: 'doctor',
    approvedAt: new Date().toISOString(),
  };

  const mails = buildApprovalBundle(account);
  write(ACCOUNTS_KEY, [account, ...listAccounts()]);
  appendMail(mails);
  void syncAccountToServer(account);
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
  void csrfPost(`/api/doctor-registry/applications/${encodeURIComponent(applicationId)}/reject`, {});
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
