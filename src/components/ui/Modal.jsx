import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = panelRef.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`app-modal relative min-w-0 w-full ${maxWidth} transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl transition-all border border-slate-100 max-h-[90dvh] flex flex-col z-10 animate-slide-up`}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-6 py-4 bg-slate-50/50">
          <div className="min-w-0">
            <h3 id={titleId} className="text-lg sm:text-xl font-bold text-brand-navy">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="shrink-0 rounded-full p-3 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
