import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { NIGHTSBRIDGE_BOOKING_URL, SITE_NAME } from "@/lib/site-config";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/gallery", label: "Gallery" },
  { to: "/amenities", label: "Amenities" },
  { to: "/area", label: "Area" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2" aria-label={`${SITE_NAME} home`}>
            <WoodpeckerMark />
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Woodpecker
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={NIGHTSBRIDGE_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95 sm:inline-flex"
            >
              Book Now
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-secondary md:hidden"
            >
              {open ? <X aria-hidden /> : <Menu aria-hidden />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            aria-label="Mobile primary"
            className="border-t border-border bg-background md:hidden"
          >
            <ul className="mx-auto flex max-w-6xl flex-col px-2 py-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                    activeProps={{ className: "bg-secondary" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="px-3 py-2">
                <a
                  href={NIGHTSBRIDGE_BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full justify-center rounded-md bg-accent px-4 py-3 text-base font-semibold text-accent-foreground"
                >
                  Book Now
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <WoodpeckerMark />
            <span className="font-serif text-lg font-semibold">Woodpecker Guesthouse</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A tranquil 4-star garden guesthouse in Ficksburg, on the Maloti Route — warm
            hospitality, comfortable en-suite rooms, and reliable backup power.
          </p>
        </div>
        <div className="text-sm">
          <h3 className="font-serif text-base font-semibold text-foreground">Visit</h3>
          <address className="mt-2 not-italic text-muted-foreground">
            Kort Street 4
            <br />
            Ficksburg, Free State
            <br />
            South Africa
          </address>
        </div>
        <div className="text-sm">
          <h3 className="font-serif text-base font-semibold text-foreground">Quick links</h3>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <Link to="/rooms" className="hover:text-foreground">
                Rooms
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <a
                href={NIGHTSBRIDGE_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Book on Nightsbridge
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Woodpecker Guesthouse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function WoodpeckerMark() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 4c2 0 4 2 4 4 0 1.5-1 3-2.5 3.5L18 18l-3-1-2 4-2-7-4 1L4 9c1.5-2 5-3 7-3 0-1 1-2 3-2z" />
        <circle cx="14" cy="7" r=".7" fill="currentColor" />
      </svg>
    </span>
  );
}
