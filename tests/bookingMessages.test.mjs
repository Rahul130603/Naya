import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBookingMessagePreviews,
  buildChannelActionLinks,
  formatDisplayPhone,
  normalizeIndianPhone,
} from '../src/lib/bookingMessages.js';

test('normalizes Indian mobile numbers including leading zero into E.164', () => {
  assert.equal(normalizeIndianPhone('07548823760'), '+917548823760');
  assert.equal(normalizeIndianPhone('7548823760'), '+917548823760');
  assert.equal(normalizeIndianPhone('917548823760'), '+917548823760');
  assert.equal(formatDisplayPhone('07548823760'), '+91 7548823760');
});

test('builds professional SMS and WhatsApp booking previews and channel links without clinical leaks', () => {
  const previews = buildBookingMessagePreviews({
    reference: 'NC-434893',
    patientName: 'Rahul',
    doctorName: 'Dr. Harish Venkatesh',
    specialty: 'Andrologist & Urologist',
    when: 'Today (26 Nov) • 09:30 AM',
    mode: 'IN_PERSON',
    clinicName: 'Alpha Men Intimacy & Andrology Institute',
    clinicAddress: '100 Feet Road, Indiranagar, Bangalore',
    feeRupees: 900,
  });

  assert.match(previews.sms, /NC-434893/);
  assert.match(previews.sms, /Dr\. Harish Venkatesh/);
  assert.match(previews.whatsapp, /\*Nayacura — Appointment Confirmed\*/);
  assert.match(previews.whatsapp, /support@nayacura\.com/);

  const links = buildChannelActionLinks('07548823760', previews);
  assert.equal(links.e164, '+917548823760');
  assert.ok(links.whatsappUrl.startsWith('https://wa.me/917548823760?text='));
  assert.ok(links.smsUrl.startsWith('sms:+917548823760?body='));
});
