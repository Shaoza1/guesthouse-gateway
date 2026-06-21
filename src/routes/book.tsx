import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { BookingButton } from "@/components/BookingButton";

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
  return (
    <SiteLayout>
      <Section>
        <SectionHeading
          eyebrow="Reservations"
          title="Book your stay"
          body="Live availability and secure booking via our partner, Nightsbridge."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <BookingButton className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow transition hover:opacity-95">
            Book now
          </BookingButton>
        </div>
      </Section>
    </SiteLayout>
  );
}
