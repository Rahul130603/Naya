import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HELLO_EMAIL,
  approveApplication,
  approveDirectDoctor,
  findPatientByEmail,
  listMail,
  registerPatient,
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
