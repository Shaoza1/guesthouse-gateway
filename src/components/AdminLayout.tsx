import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_NAV: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/rooms", label: "Rooms" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/content", label: "Site content" },
  { to: "/admin/inquiries", label: "Inquiries" },
];

export function AdminLayout({
  children,
  email,
}: {
  children: ReactNode;
  email?: string | null;
}) {
  const navigate = useNavigate();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-serif text-base font-semibold">
              Woodpecker
            </Link>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{email}</span>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              View site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to as "/admin"}
                activeOptions={{ exact: item.exact }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function useAdminGate() {
  const navigate = useNavigate();
  const [state, setState] = useState<{
    status: "loading" | "ok" | "denied";
    email?: string | null;
  }>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;
      if (!roles) {
        setState({ status: "denied", email: userData.user.email });
      } else {
        setState({ status: "ok", email: userData.user.email });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return state;
}
