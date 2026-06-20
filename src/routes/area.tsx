import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { siteContentQuery, pickString } from "@/lib/content";

const ATTRACTIONS = [
  {
    title: "Cherry Festival",
    distance: "In town · every November",
    body: "South Africa’s longest-running festival celebrates the cherry harvest right here in Ficksburg.",
  },
  {
    title: "Ionia cherry farm tours",
    distance: "Nearby · October–November",
    body: "Pick cherries and tour the orchards during the short cherry season.",
  },
  {
    title: "Lesotho border",
    distance: "2 km away",
    body: "The Maputsoe/Maseru border crossing is a short drive — perfect for a day trip into the Mountain Kingdom.",
  },
  {
    title: "Golden Gate Highlands & Clarens",
    distance: "75 km",
    body: "Sandstone cliffs, scenic drives, and the arts village of Clarens — a comfortable day out.",
  },
  {
    title: "Katse Dam, Lesotho",
    distance: "110 km",
    body: "One of Africa’s great engineering feats, set in the highlands.",
  },
  {
    title: "Golf, tennis & squash",
    distance: "Across the street",
    body: "We’re opposite the Ficksburg Golf Club, tennis courts, and squash courts.",
  },
];

export const Route = createFileRoute("/area")({
  head: () => ({
    meta: [
      { title: "The Area — Woodpecker Guesthouse, Ficksburg" },
      {
        name: "description",
        content:
          "On the Maloti Route in Ficksburg. 2 km from the Lesotho border, near Golden Gate, Clarens, and Katse Dam. Home of the annual Cherry Festival.",
      },
      { property: "og:title", content: "The Area — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content:
          "Cherry Festival, cherry farm tours, the Lesotho border, Katse Dam, Golden Gate, and Clarens.",
      },
    ],
    links: [{ rel: "canonical", href: "/area" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  component: AreaPage,
});

function AreaPage() {
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
  const title = pickString(content, "area_intro", "title", "Things to do in the area");
  const body = pickString(content, "area_intro", "body", "");

  return (
    <Section>
      <SectionHeading eyebrow="Area & things to do" title={title} body={body} />
      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {ATTRACTIONS.map((a) => (
          <li
            key={a.title}
            className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <h3 className="font-serif text-xl text-foreground">{a.title}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-accent">
              {a.distance}
            </p>
            <p className="mt-3 text-sm text-foreground/85">{a.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
