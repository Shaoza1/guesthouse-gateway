import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { roomsQuery } from "@/lib/content";
import { resolveImage } from "@/lib/assets";
import { NIGHTSBRIDGE_BOOKING_URL } from "@/lib/site-config";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — Woodpecker Guesthouse, Ficksburg" },
      {
        name: "description",
        content:
          "En-suite double, twin, and family rooms at Woodpecker Guesthouse in Ficksburg. Air conditioning, DStv, free WiFi, garden views.",
      },
      { property: "og:title", content: "Rooms — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content:
          "Comfortable en-suite rooms with garden views, air conditioning, DStv, and free WiFi.",
      },
    ],
    links: [{ rel: "canonical", href: "/rooms" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(roomsQuery()),
  component: RoomsPage,
});

function RoomsPage() {
  return (
    <SiteLayout>
      <Section>
        <SectionHeading
          eyebrow="Where you’ll stay"
          title="Rooms at Woodpecker"
          body="Each room is en-suite, with air conditioning, DStv, free WiFi, a minibar fridge, and warm in-room touches. Some rooms open onto the garden or a terrace."
        />
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading rooms…</p>}>
          <RoomList />
        </Suspense>
      </Section>
    </SiteLayout>
  );
}

function RoomList() {
  const { data: rooms } = useSuspenseQuery(roomsQuery());
  if (rooms.length === 0) {
    return <p className="mt-8 text-muted-foreground">No rooms published yet.</p>;
  }
  return (
    <ul className="mt-10 space-y-10">
      {rooms.map((room, idx) => (
        <li
          key={room.id}
          className={`grid items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] md:grid-cols-2 ${
            idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
          }`}
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={resolveImage(room.image_urls?.[0])}
              alt={`${room.name} — ${room.bed_configuration}`}
              width={1600}
              height={1067}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="p-6 md:p-8">
            <h3 className="font-serif text-2xl text-foreground md:text-3xl">{room.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {room.bed_configuration} · Sleeps {room.sleeps}
              {room.price_indicator ? ` · ${room.price_indicator}` : ""}
            </p>
            <p className="mt-4 text-foreground/85">{room.description}</p>
            {room.amenities.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {room.amenities.map((a) => (
                  <li
                    key={a}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            )}
            <a
              href={NIGHTSBRIDGE_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow transition hover:opacity-95"
            >
              Book this room
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
