import type { Role } from '@/types';

export const dashboardFor = (role: Role) => role === 'PATIENT' ? '/dashboard' : role === 'DOCTOR' ? '/doctor' : '/admin';

export function loginDestination(role: Role, next: string | null) {
  const fallback = dashboardFor(role);
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  const pathname = next.split(/[?#]/)[0];
  if (/^\/(?:login|register|forgot-password|reset-password|verify-email)(?:\/|$)/.test(pathname) || /\/(?:login|register)\/?$/.test(pathname)) return fallback;
  if (pathname === '/dashboard' && role !== 'PATIENT') return fallback;
  if (pathname === '/doctor' && role !== 'DOCTOR') return fallback;
  if (pathname === '/admin' && role !== 'ADMIN') return fallback;
  return next;
}
