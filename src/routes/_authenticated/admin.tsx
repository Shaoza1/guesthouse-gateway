import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout, useAdminGate } from "@/components/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Woodpecker Guesthouse" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const gate = useAdminGate();

  if (gate.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading admin…
      </div>
    );
  }
  if (gate.status === "denied") {
    return (
      <AdminLayout email={gate.email}>
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="font-serif text-2xl">Not authorized</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account exists but does not have admin access. Ask the owner to grant
            the admin role.
          </p>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout email={gate.email}>
      <Outlet />
    </AdminLayout>
  );
}
