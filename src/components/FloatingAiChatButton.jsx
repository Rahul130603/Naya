import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function FloatingAiChatButton() {
  const location = useLocation();

  // Don't display floating launcher when already inside full AI chat page
  if (location.pathname === '/ai') {
    return null;
  }

  return (
    <aside
      aria-label="Naya AI Chat Assistant"
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 z-40 md:bottom-6 md:right-6 print:hidden"
    >
      <Link
        to="/ai"
        aria-label="Open Naya AI chat"
        className="grid h-14 w-14 place-items-center rounded-full border-2 border-emerald-300 bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3B82] active:scale-95"
        title="Open Naya AI chat"
      >
        <Sparkles className="h-6 w-6" aria-hidden="true" />
      </Link>
    </aside>
  );
}
