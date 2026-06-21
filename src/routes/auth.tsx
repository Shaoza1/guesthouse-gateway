import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasAnyAdmin, bootstrapFirstAdmin } from "@/lib/admin-auth.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in — Woodpecker Guesthouse" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(hasAnyAdmin);
  const bootstrap = useServerFn(bootstrapFirstAdmin);

  const [mode, setMode] = useState<"loading" | "signin" | "bootstrap">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate({ to: "/admin" });
        return;
      }
      try {
        const res = await checkAdmin({});
        if (!cancelled) setMode(res.hasAdmin ? "signin" : "bootstrap");
      } catch {
        if (!cancelled) setMode("signin");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkAdmin, navigate]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  async function handleBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await bootstrap({ data: { email, password } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Bootstrap failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <h1 className="mt-4 font-serif text-2xl text-foreground">
          {mode === "bootstrap" ? "Create first admin" : "Admin sign in"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "bootstrap"
            ? "No admin exists yet. Create the owner account now."
            : "Sign in to manage rooms, gallery and content."}
        </p>

        {mode === "loading" ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            onSubmit={mode === "bootstrap" ? handleBootstrap : handleSignIn}
            className="mt-6 space-y-4"
          >
            <label className="block">
              <span className="text-xs font-medium text-foreground">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-foreground">Password</span>
              <input
                type="password"
                required
                minLength={mode === "bootstrap" ? 10 : 6}
                autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {mode === "bootstrap" && (
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Min 10 chars. Checked against known breach lists.
                </span>
              )}
            </label>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "bootstrap" ? "Create admin" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
