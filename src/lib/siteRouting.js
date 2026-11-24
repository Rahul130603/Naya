const PORTAL_PATHS = [
  '/ai', '/login', '/doctor', '/admin', '/dashboard', '/consult',
  '/payment', '/book', '/register', '/forgot-password', '/reset-password', '/verify-email',
];

export function isPortalPath(pathname) {
  // Match a complete URL segment: /consult/:id is a portal, while
  // /consult-sexologist must stay in the public doctor directory.
  return PORTAL_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
}
