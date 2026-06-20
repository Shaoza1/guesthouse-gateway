import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { Section, SectionHeading } from "@/components/Section";
import { galleryQuery } from "@/lib/content";
import { resolveImage } from "@/lib/assets";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Woodpecker Guesthouse, Ficksburg" },
      {
        name: "description",
        content:
          "See Woodpecker Guesthouse — garden, pool, water features, rooms, and breakfast in Ficksburg, Free State.",
      },
      { property: "og:title", content: "Gallery — Woodpecker Guesthouse" },
      {
        property: "og:description",
        content:
          "Photographs of the garden, pool, water features, rooms, and dining at Woodpecker Guesthouse.",
      },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery()),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <SiteLayout>
      <Section>
        <SectionHeading
          eyebrow="The gallery"
          title="A glimpse of Woodpecker"
          body="Garden, pool, and rooms — photographed across the seasons."
        />
        <Suspense fallback={<p className="mt-8 text-muted-foreground">Loading photos…</p>}>
          <GalleryGrid />
        </Suspense>
      </Section>
    </SiteLayout>
  );
}

function GalleryGrid() {
  const { data: images } = useSuspenseQuery(galleryQuery());
  if (images.length === 0) {
    return <p className="mt-8 text-muted-foreground">No images published yet.</p>;
  }
  return (
    <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
      {images.map((img, i) => (
        <li
          key={img.id}
          className={`group overflow-hidden rounded-xl bg-muted shadow-[var(--shadow-soft)] ${
            i % 5 === 0 ? "col-span-2 sm:row-span-2" : ""
          }`}
        >
          <figure className="m-0">
            <div className="aspect-[4/3]">
              <img
                src={resolveImage(img.image_url)}
                alt={img.alt_text}
                width={1600}
                height={1067}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
            {img.caption && (
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                {img.caption}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
