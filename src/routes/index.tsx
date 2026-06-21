import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import {
  roomsQuery,
  siteContentQuery,
  pickString,
  type Room,
} from "@/lib/content";
import { resolveImage, heroGarden } from "@/lib/assets";
import { NIGHTSBRIDGE_BOOKING_URL } from "@/lib/site-config";
import { BookingButton } from "@/components/BookingButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Woodpecker Guesthouse — 4-Star B&B in Ficksburg, Free State" },
      {
        name: "description",
        content:
          "A tranquil 4-star garden guesthouse in Ficksburg on the Maloti Route. Comfortable en-suite rooms, outdoor pool, BBQ area, and a 150KVA backup generator.",
      },
      {
        property: "og:title",
        content: "Woodpecker Guesthouse — Ficksburg, Free State",
      },
      {
        property: "og:description",
        content:
          "Tranquil 4-star garden guesthouse on the Maloti Route. En-suite rooms, pool, and reliable backup power.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery()),
      context.queryClient.ensureQueryData(roomsQuery()),
    ]),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </SiteLayout>
  );
}

function HomeContent() {
  const { data: content } = useSuspenseQuery(siteContentQuery());
  const { data: rooms } = useSuspenseQuery(roomsQuery());

  const eyebrow = pickString(content, "hero", "eyebrow", "4-Star Guesthouse");
  const title = pickString(content, "hero", "title", "Woodpecker Guesthouse");
  const subtitle = pickString(
    content,
    "hero",
    "subtitle",
    "A tranquil garden retreat on the Maloti Route.",
  );
  const primaryCta = pickString(content, "hero", "primary_cta", "Book your stay");
  const secondaryCta = pickString(content, "hero", "secondary_cta", "Explore our rooms");

  const highlightsRaw = (content.home_highlights?.items as
    | { title: string; body: string }[]
    | undefined) ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroGarden}
          alt=""
          width={1920}
          height={1280}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 md:min-h-[82vh] md:pb-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <BookingButton className="inline-flex min-h-11 items-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-lg transition hover:opacity-95">
              {primaryCta}
            </BookingButton>
            <Link
              to="/rooms"
              className="inline-flex min-h-11 items-center rounded-md border border-white/40 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              {secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <Section>
        <SectionHeading
          eyebrow="Why guests return"
          title="A quiet base on the Maloti Route"
          body="Set behind mature trees opposite the Ficksburg Golf Club, Woodpecker is run with care by our hostess Eureka. We’re built for unhurried mornings and easy access to the mountains, the dam, and the Lesotho border."
        />
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {highlightsRaw.map((h) => (
            <li
              key={h.title}
              className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <h3 className="font-serif text-xl text-foreground">{h.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{h.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Rooms preview */}
      <Section className="pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Stay with us"
            title="Comfortable en-suite rooms"
            body="Every room has air conditioning, DStv, en-suite bathroom, free WiFi, and small welcome touches."
          />
          <Link
            to="/rooms"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all rooms →
          </Link>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 3).map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </ul>
      </Section>

      {/* Booking CTA */}
      <Section>
        <div className="overflow-hidden rounded-2xl bg-[image:var(--gradient-warm)] p-8 text-primary-foreground md:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl">Plan your stay</h2>
              <p className="mt-3 max-w-xl text-primary-foreground/85">
                Check live availability and book securely through Nightsbridge — our
                booking partner.
              </p>
            </div>
            <BookingButton className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-7 py-3 text-base font-semibold text-accent-foreground shadow-md transition hover:opacity-95">
              Check availability
            </BookingButton>
          </div>
        </div>
      </Section>
    </>
  );
}

function RoomCard({ room }: { room: Room }) {
  const img = resolveImage(room.image_urls?.[0]);
  return (
    <li className="group overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)]">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={img}
          alt={room.name}
          width={1600}
          height={1067}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-foreground">{room.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {room.bed_configuration} · Sleeps {room.sleeps}
        </p>
        <p className="mt-3 line-clamp-3 text-sm text-foreground/80">{room.description}</p>
        <div className="mt-4">
          <BookingButton className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
            Book this room →
          </BookingButton>
        </div>
      </div>
    </li>
  );
}
