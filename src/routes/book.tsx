import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { NIGHTSBRIDGE_BOOKING_URL } from "@/lib/site-config";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book — Woodpecker Guesthouse, Ficksburg" },
      {
        name: "description",
        content:
          "Check availability and book your stay at Woodpecker Guesthouse in Ficksburg through our booking partner, Nightsbridge.",
      },
      { property: "og:title", content: "Book — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content: "Check live availability and book your stay through Nightsbridge.",
      },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

function BookPage() {
  // Lazy: do NOT load the booking iframe until the visitor clicks.
  const [showIframe, setShowIframe] = useState(false);

  return (
    <SiteLayout>
      <Section>
        <SectionHeading
          eyebrow="Reservations"
          title="Book your stay"
          body="Live availability and secure booking via our partner, Nightsbridge."
        />

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={NIGHTSBRIDGE_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow transition hover:opacity-95"
          >
            Open booking in new tab
          </a>
          {!showIframe && (
            <button
              type="button"
              onClick={() => setShowIframe(true)}
              className="inline-flex min-h-11 items-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground hover:bg-secondary"
            >
              Show booking widget here
            </button>
          )}
        </div>

        {showIframe && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border shadow-[var(--shadow-soft)]">
            <iframe
              title="Nightsbridge booking widget for Woodpecker Guesthouse"
              src={NIGHTSBRIDGE_BOOKING_URL}
              loading="lazy"
              className="block h-[820px] w-full border-0 bg-background"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => window.open(NIGHTSBRIDGE_BOOKING_URL, "_blank", "noopener,noreferrer")}
            />
            <p className="border-t border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
              If the booking form doesn’t load,{" "}
              <a
                href={NIGHTSBRIDGE_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                open it in a new tab
              </a>
              .
            </p>
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}
