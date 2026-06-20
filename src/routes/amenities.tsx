import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  Bath,
  Bed,
  Coffee,
  Flame,
  Leaf,
  ParkingCircle,
  Tv,
  Utensils,
  Waves,
  Wifi,
  Zap,
  Accessibility,
} from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { siteContentQuery, pickString } from "@/lib/content";
import pool from "@/assets/pool.jpg";
import braai from "@/assets/braai.jpg";
import breakfast from "@/assets/breakfast.jpg";

const AMENITIES = [
  { icon: Waves, title: "Outdoor pool", body: "Cool off in our garden-side pool." },
  { icon: Flame, title: "BBQ & outdoor fireplace", body: "Braai under the stars in a quiet corner of the garden." },
  { icon: Leaf, title: "Mature garden", body: "Water features, lawns, and indigenous trees — true to our name." },
  { icon: Zap, title: "150KVA backup generator", body: "Reliable power even during load-shedding." },
  { icon: Wifi, title: "Free WiFi", body: "Throughout the property." },
  { icon: ParkingCircle, title: "Free on-site parking", body: "Safe parking inside the property." },
  { icon: Utensils, title: "Full breakfast", body: "Continental and full English / Irish breakfast each morning." },
  { icon: Coffee, title: "Snack bar & packed lunches", body: "Packed lunches available on request." },
  { icon: Bed, title: "En-suite rooms", body: "12–13 rooms with private bathrooms and walk-in showers." },
  { icon: Tv, title: "DStv & air conditioning", body: "In every room." },
  { icon: Bath, title: "Laundry service", body: "Available on request." },
  { icon: Accessibility, title: "Wheelchair-friendly", body: "Accessible access on applicable rooms." },
];

export const Route = createFileRoute("/amenities")({
  head: () => ({
    meta: [
      { title: "Amenities — Woodpecker Guesthouse" },
      {
        name: "description",
        content:
          "Outdoor pool, mature garden with water features, BBQ area, 150KVA backup generator, full breakfast, free WiFi, and en-suite rooms.",
      },
      { property: "og:title", content: "Amenities — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content:
          "Everything you need for a comfortable stay — pool, garden, BBQ, generator backup, full breakfast.",
      },
    ],
    links: [{ rel: "canonical", href: "/amenities" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  component: AmenitiesPage,
});

function AmenitiesPage() {
  return (
    <SiteLayout>
      <Suspense fallback={<Section><p className="text-muted-foreground">Loading…</p></Section>}>
        <Content />
      </Suspense>
    </SiteLayout>
  );
}

function Content() {
  const { data: content } = useSuspenseQuery(siteContentQuery());
  const title = pickString(
    content,
    "amenities_intro",
    "title",
    "Everything you need for a comfortable stay",
  );
  const body = pickString(content, "amenities_intro", "body", "");

  return (
    <>
      <Section>
        <SectionHeading eyebrow="Amenities & facilities" title={title} body={body} />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITIES.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary"
              >
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-serif text-lg text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { src: pool, alt: "Outdoor pool" },
            { src: braai, alt: "Outdoor BBQ and fireplace" },
            { src: breakfast, alt: "Full breakfast" },
          ].map((i) => (
            <div key={i.alt} className="overflow-hidden rounded-xl bg-muted shadow-[var(--shadow-soft)]">
              <div className="aspect-[4/3]">
                <img
                  src={i.src}
                  alt={i.alt}
                  width={1600}
                  height={1067}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
