import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-foreground">This page didn’t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#2d5440" },
      { title: "Woodpecker Guesthouse — 4-Star B&B in Ficksburg, Free State" },
      {
        name: "description",
        content:
          "Woodpecker Guesthouse — a tranquil 4-star bed and breakfast in Ficksburg on the Maloti Route. Garden setting, outdoor pool, en-suite rooms, generator backup power, 2 km from the Lesotho border.",
      },
      { name: "author", content: "Woodpecker Guesthouse" },
      { property: "og:site_name", content: "Woodpecker Guesthouse" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Woodpecker Guesthouse — Ficksburg, Free State" },
      {
        property: "og:description",
        content:
          "A tranquil 4-star garden guesthouse in Ficksburg on the Maloti Route. Comfortable en-suite rooms, pool, BBQ, and reliable backup power.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "canonical", href: "/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: "Woodpecker Guesthouse",
          description:
            "4-star bed and breakfast in Ficksburg, Free State, South Africa — garden setting on the Maloti Route, 2 km from the Lesotho border.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Kort Street 4",
            addressLocality: "Ficksburg",
            addressRegion: "Free State",
            addressCountry: "ZA",
          },
          starRating: { "@type": "Rating", ratingValue: "4" },
          amenityFeature: [
            "Outdoor swimming pool",
            "Free WiFi",
            "Free parking",
            "Backup generator",
            "En-suite bathrooms",
            "Air conditioning",
            "DStv",
            "Breakfast included",
            "BBQ facilities",
            "Wheelchair-friendly access",
            "Pet-friendly",
          ],
          checkinTime: "14:00",
          checkoutTime: "10:00",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    import("../lib/pwa-register").then((m) => m.registerPWA()).catch(() => {});
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
