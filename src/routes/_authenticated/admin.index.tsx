import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({
    rooms: 0,
    gallery: 0,
    unreadInquiries: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    (async () => {
      const [rooms, gallery, unread, total] = await Promise.all([
        supabase.from("rooms").select("id", { count: "exact", head: true }),
        supabase.from("gallery_images").select("id", { count: "exact", head: true }),
        supabase
          .from("inquiries")
          .select("id", { count: "exact", head: true })
          .eq("is_read", false),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        rooms: rooms.count ?? 0,
        gallery: gallery.count ?? 0,
        unreadInquiries: unread.count ?? 0,
        totalInquiries: total.count ?? 0,
      });
    })();
  }, []);

  const tiles = [
    { label: "Rooms", value: stats.rooms, to: "/admin/rooms" },
    { label: "Gallery images", value: stats.gallery, to: "/admin/gallery" },
    {
      label: "Unread inquiries",
      value: stats.unreadInquiries,
      sub: `${stats.totalInquiries} total`,
      to: "/admin/inquiries",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every piece of content visible on the public site.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t.label}
            </p>
            <p className="mt-2 font-serif text-3xl text-foreground">{t.value}</p>
            {"sub" in t && t.sub && (
              <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
            )}
          </Link>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        <h2 className="font-serif text-base text-foreground">Image URLs</h2>
        <p className="mt-2">
          Image fields accept any HTTPS URL. For the launch handover, replace the stock
          <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-xs">asset:</code>
          references with the client's hosted photo URLs (the existing image CDN, an S3
          bucket, or Unsplash links). The Nightsbridge BBID is set in
          <code className="mx-1 rounded bg-secondary px-1 py-0.5 text-xs">
            src/lib/site-config.ts
          </code>
          .
        </p>
      </div>
    </div>
  );
}
