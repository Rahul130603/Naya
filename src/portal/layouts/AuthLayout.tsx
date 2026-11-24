import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { RouteEffects } from '@/components/layout/RouteEffects';

export function AuthLayout() {
  const { pathname } = useLocation();
  const wide = pathname === '/doctor/register';
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <RouteEffects />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" aria-label="Nayacura home"><img src="/logo.png" alt="nayacura" className="h-11 sm:h-14 w-auto object-contain" /></Link>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-royal hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
        </div>
      </header>
      <main id="auth-content" className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-14">
        <div className={`w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 ${wide ? 'max-w-6xl' : 'max-w-[560px]'}`}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-lavender"><LockKeyhole className="h-3.5 w-3.5" /> Your private Nayacura space</div>
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-5 text-xs text-mauve sm:px-8">
          <p>© {new Date().getFullYear()} Nayacura · Development demo</p>
          <nav aria-label="Account support" className="flex gap-5"><Link to="/privacy-standards">Privacy</Link><Link to="/legal/terms">Terms</Link><Link to="/contact">Support</Link></nav>
        </div>
      </footer>
    </div>
  );
}
