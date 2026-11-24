import test from 'node:test';
import assert from 'node:assert/strict';
import { isPortalPath } from '../src/lib/siteRouting.js';

test('doctor-directory links stay in the public website', () => {
  for (const path of ['/consult-sexologist', '/consult-sexologist/', '/video-consult', '/wellness-store', '/', '/condition/erectile-dysfunction']) {
    assert.equal(isPortalPath(path), false, path);
  }
});
test('consultation rooms and existing account routes still reach the portal', () => {
  for (const path of ['/consult/appointment-123', '/ai', '/doctor/login', '/doctor/register', '/admin/login', '/dashboard', '/payment/order-1', '/book', '/register', '/forgot-password', '/reset-password', '/verify-email']) {
    assert.equal(isPortalPath(path), true, path);
  }
});
test('similar URL prefixes cannot accidentally select the portal', () => {
  for (const path of ['/consult-sexologist', '/booking-guide', '/ai-guide', '/payment-options', '/doctor-directory']) assert.equal(isPortalPath(path), false, path);
});
