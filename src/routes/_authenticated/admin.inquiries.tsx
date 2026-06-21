import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/inquiries")({
  component: AdminInquiries,
});

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

function AdminInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  async function load() {
    let q = supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (filter === "unread") q = q.eq("is_read", false);
    const { data, error } = await q;
    if (error) setMsg(error.message);
    else setRows((data ?? []) as Inquiry[]);
  }
  useEffect(() => {
    load();
  }, [filter]);

  async function toggleRead(id: string, is_read: boolean) {
    const { error } = await supabase
      .from("inquiries")
      .update({ is_read })
      .eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this inquiry?")) return;
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl">Inquiries</h1>
          <p className="text-sm text-muted-foreground">
            Messages submitted through the public Contact form.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {(["unread", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md border px-3 py-1.5 ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-secondary"
              }`}
            >
              {f === "unread" ? "Unread" : "All"}
            </button>
          ))}
        </div>
      </header>

      {msg && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {msg}
        </p>
      )}

      <div className="space-y-3">
        {rows.map((r) => (
          <article
            key={r.id}
            className={`rounded-lg border bg-card p-5 ${
              r.is_read ? "border-border" : "border-primary/40"
            }`}
          >
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-semibold">{r.name}</h2>
                <p className="text-xs text-muted-foreground">
                  <a className="hover:text-foreground" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                  {r.phone && ` • ${r.phone}`}
                </p>
              </div>
              <time className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </time>
            </header>
            <p className="mt-3 whitespace-pre-wrap text-sm">{r.message}</p>
            <div className="mt-4 flex gap-2 text-xs">
              <button
                onClick={() => toggleRead(r.id, !r.is_read)}
                className="rounded-md border border-input bg-background px-3 py-1.5 hover:bg-secondary"
              >
                Mark {r.is_read ? "unread" : "read"}
              </button>
              <a
                href={`mailto:${r.email}?subject=Re: Woodpecker Guesthouse inquiry`}
                className="rounded-md border border-input bg-background px-3 py-1.5 hover:bg-secondary"
              >
                Reply
              </a>
              <button
                onClick={() => remove(r.id)}
                className="ml-auto rounded-md px-3 py-1.5 text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {!rows.length && (
          <p className="text-sm text-muted-foreground">No inquiries.</p>
        )}
      </div>
    </div>
  );
}
