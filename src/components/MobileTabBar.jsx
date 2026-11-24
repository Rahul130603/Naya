import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarPlus, Home, ShoppingBag, Stethoscope, UserRound } from 'lucide-react';

/**
 * Phone-app style bottom navigation for the public website.
 * Hidden on tablets/desktop and inside the dashboards/portal.
 */
export default function MobileTabBar({ user, onBook }) {
  const location = useLocation();
  const pathname = location.pathname;

  const accountTarget = user
    ? user.role === 'doctor'
      ? '/doctor-dashboard'
      : user.role === 'admin'
        ? '/admin-dashboard'
        : '/patient-dashboard'
    : '/login';

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const itemClass = (active) => `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-bold transition-colors ${
    active ? 'text-[#0B3B82]' : 'text-slate-500'
  }`;

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(15,23,42,0.06)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch px-2">
        <Link to="/" className={itemClass(isActive('/'))} aria-current={isActive('/') ? 'page' : undefined}>
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>Home</span>
        </Link>

        <Link to="/consult-sexologist" className={itemClass(isActive('/consult-sexologist'))} aria-current={isActive('/consult-sexologist') ? 'page' : undefined}>
          <Stethoscope className="h-5 w-5" aria-hidden="true" />
          <span>Doctors</span>
        </Link>

        <button type="button" onClick={onBook} className="flex flex-1 flex-col items-center justify-center text-[10px] font-bold text-[#0B3B82]">
          <span className="-mt-4 grid h-11 w-11 place-items-center rounded-full bg-[#0B3B82] text-white shadow-lg ring-4 ring-white">
            <CalendarPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="mt-0.5">Book</span>
        </button>

        <Link to="/wellness-store" className={itemClass(isActive('/wellness-store'))} aria-current={isActive('/wellness-store') ? 'page' : undefined}>
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          <span>Store</span>
        </Link>

        <Link to={accountTarget} className={itemClass(isActive(accountTarget))} aria-current={isActive(accountTarget) ? 'page' : undefined}>
          <UserRound className="h-5 w-5" aria-hidden="true" />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
