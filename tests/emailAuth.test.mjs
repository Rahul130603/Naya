import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMAIL_ALREADY_USED_MESSAGE,
  HELLO_EMAIL,
  approveApplication,
  approveDirectDoctor,
  changeDoctorPassword,
  findPatientByEmail,
  getDoctorProfileOverride,
  listMail,
  loginDoctorAccount,
  registerPatient,
  saveDoctorProfileLocal,
  submitApplication,
} from '../src/lib/doctorRegistry.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
  };
}

function installMockWindow() {
  const listeners = new Map();
  const storage = createMemoryStorage();
  globalThis.window = {
    localStorage: storage,
    addEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, [...list, fn]);
    },
    removeEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((item) => item !== fn));
    },
    dispatchEvent: (event) => {
      const list = listeners.get(event.type) || [];
      for (const fn of list) fn(event);
    },
  };
  globalThis.Event = class MockEvent {
    constructor(type) {
      this.type = type;
    }
  };
}

test('patient email registration sends welcome mail from hello@nayacura.com without phone number', () => {
  installMockWindow();

  const { patient, welcomeMail } = registerPatient({
    name: 'Karthik S.',
    email: 'karthik@example.com',
    password: 'Password123',
  });

  assert.equal(patient.email, 'karthik@example.com');
  assert.equal(patient.phone, undefined);
  assert.equal(welcomeMail.from, HELLO_EMAIL);
  assert.equal(welcomeMail.to, 'karthik@example.com');
  assert.match(welcomeMail.subject, /Welcome to Nayacura/i);
  assert.equal(findPatientByEmail('karthik@example.com')?.id, patient.id);
});

test('doctor registration sends welcome mail and admin approval sends email & password credentials from hello@nayacura.com', () => {
  installMockWindow();

  const app = submitApplication({
    fullName: 'Dr. Maya Sharma',
    email: 'maya.sharma@hospital.org',
    city: 'Chennai',
    languages: 'English, Tamil',
    specialty: 'Clinical Sexology',
    qualification: 'MBBS, MD',
    university: 'Madras Medical College',
    graduationYear: '2018',
    experience: '8',
    council: 'TNMC',
    regNo: 'TNMC-88120',
    certificateName: 'cert.pdf',
  });

  const welcomeMail = listMail().find((m) => m.to === 'maya.sharma@hospital.org' && m.type === 'doctor-welcome');
  assert.ok(welcomeMail);
  assert.equal(welcomeMail.from, HELLO_EMAIL);

  const approved = approveApplication(app.id);
  assert.equal(approved.account.email, 'maya.sharma@hospital.org');
  assert.ok(approved.account.password.startsWith('Naya@'));

  const credMail = approved.mails.find((m) => m.type === 'credentials');
  assert.ok(credMail);
  assert.equal(credMail.from, HELLO_EMAIL);
  assert.equal(credMail.to, 'maya.sharma@hospital.org');
  assert.ok(credMail.body.includes(approved.account.email));
  assert.ok(credMail.body.includes(approved.account.password));

  const direct = approveDirectDoctor({
    id: 'DOC-REQ-1082',
    name: 'Dr. K. Annamalai',
    email: 'dr.annamalai@medtrust.org',
    regNo: 'TN-MED-84920',
    council: 'TNMC',
    specialty: 'Clinical Andrologist',
  });
  assert.equal(direct.account.email, 'dr.annamalai@medtrust.org');
  assert.equal(direct.mails[1].from, HELLO_EMAIL);
  assert.ok(direct.mails[1].body.includes(direct.account.password));
});

test('rejects already registered, cross-role, and reserved emails with an already-used error', () => {
  installMockWindow();

  registerPatient({
    name: 'First Patient',
    email: 'Repeat.User@Example.com',
    password: 'Password123',
  });

  assert.throws(
    () =>
      registerPatient({
        name: 'Second Patient',
        email: 'repeat.user@example.com',
        password: 'Password456',
      }),
    (err) => err?.message === EMAIL_ALREADY_USED_MESSAGE && /already used/i.test(err.message),
  );

  assert.throws(
    () =>
      registerPatient({
        name: 'Doctor Overlap',
        email: 'dr.arvind@nayacura.clinic',
        password: 'Password123',
      }),
    /already used/i,
  );

  submitApplication({
    fullName: 'Dr. Priya Nair',
    email: 'priya.nair@clinic.org',
    city: 'Chennai',
    languages: 'English, Tamil',
    specialty: 'Clinical Sexology',
    qualification: 'MBBS, MD',
    university: 'Madras Medical College',
    graduationYear: '2016',
    experience: '10',
    council: 'TNMC',
    regNo: 'TNMC-99110',
    certificateName: 'cert.pdf',
  });

  assert.throws(
    () =>
      submitApplication({
        fullName: 'Dr. Priya Duplicate',
        email: 'PRIYA.NAIR@clinic.org',
        city: 'Chennai',
        languages: 'English',
        specialty: 'Clinical Sexology',
        qualification: 'MBBS, MD',
        university: 'Madras Medical College',
        graduationYear: '2016',
        experience: '10',
        council: 'TNMC',
        regNo: 'TNMC-99110',
        certificateName: 'cert.pdf',
      }),
    /already used/i,
  );
});

test('clinician profile/photo edits persist and password changes update login verification', async () => {
  installMockWindow();

  const { account } = approveDirectDoctor({
    id: 'DOC-REQ-2099',
    name: 'Dr. Meera Test',
    email: 'meera.test@clinic.org',
    regNo: 'TN-MED-2099',
    council: 'TNMC',
    specialty: 'Clinical Sexologist',
  });

  saveDoctorProfileLocal({
    id: account.id,
    email: account.email,
    name: 'Dr. Meera Updated',
    clinic: 'Nayacura Women & Intimate Wellness Clinic',
    photoUrl: 'data:image/jpeg;base64,ZmFrZQ==',
  });

  const saved = getDoctorProfileOverride(account.email, 'Dr. Meera Updated');
  assert.equal(saved?.clinic, 'Nayacura Women & Intimate Wellness Clinic');
  assert.equal(saved?.photoUrl, 'data:image/jpeg;base64,ZmFrZQ==');

  const wrongPw = await changeDoctorPassword({
    id: account.id,
    email: account.email,
    currentPassword: 'WrongPassword',
    newPassword: 'Updated@999',
  });
  assert.equal(wrongPw.ok, false);
  assert.match(wrongPw.message, /incorrect/i);

  const okPw = await changeDoctorPassword({
    id: account.id,
    email: account.email,
    currentPassword: account.password,
    newPassword: 'Updated@999',
  });
  assert.equal(okPw.ok, true);

  const oldLogin = await loginDoctorAccount(account.email, account.password);
  assert.equal(oldLogin.status, 'invalid_password');

  const newLogin = await loginDoctorAccount(account.email, 'Updated@999');
  assert.equal(newLogin.status, 'ok');
  assert.equal(newLogin.account.name, 'Dr. Meera Updated');
  assert.equal(newLogin.account.photoUrl, 'data:image/jpeg;base64,ZmFrZQ==');
});
