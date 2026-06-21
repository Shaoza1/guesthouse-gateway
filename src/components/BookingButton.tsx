import { useState, useEffect, useRef, type ReactNode } from "react";

const MESSAGE =
  "Live booking connects straight to your existing Nightsbridge account once confirmed — this button is ready to go.";

interface BookingButtonProps {
  className?: string;
  children: ReactNode;
}

export function BookingButton({ className, children }: BookingButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button type="button" onClick={() => setOpen((o) => !o)} className={className}>
        {children}
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-[var(--shadow-lift)]"
        >
          {MESSAGE}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
          <div className="absolute left-1/2 top-full -translate-x-1/2 translate-y-[-1px] border-4 border-transparent border-t-card" />
        </div>
      )}
    </div>
  );
}
