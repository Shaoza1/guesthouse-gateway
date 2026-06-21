import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContent,
});

type Row = { key: string; value: Record<string, unknown> };

function AdminContent() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("site_content")
      .select("key,value")
      .order("key", { ascending: true });
    if (error) {
      setMsg(error.message);
      return;
    }
    const r = (data ?? []) as Row[];
    setRows(r);
    setDrafts(
      Object.fromEntries(r.map((x) => [x.key, JSON.stringify(x.value, null, 2)])),
    );
  }
  useEffect(() => {
    load();
  }, []);

  async function save(key: string) {
    setMsg(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(drafts[key] ?? "{}");
    } catch (e: unknown) {
      setMsg(`${key}: invalid JSON — ${e instanceof Error ? e.message : String(e)}`);
      return;
    }
    const { error } = await supabase
      .from("site_content")
      .update({ value: parsed as never })
      .eq("key", key);
    if (error) setMsg(error.message);
    else setMsg(`Saved "${key}".`);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl">Site content</h1>
        <p className="text-sm text-muted-foreground">
          Edit headline copy, intros, and structured blocks used across the site. Each
          entry is a JSON object — keep field names intact.
        </p>
      </header>

      {msg && (
        <p className="rounded-md border border-border bg-secondary p-3 text-sm">{msg}</p>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.key} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-semibold">{r.key}</h2>
              <button
                onClick={() => save(r.key)}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-95"
              >
                Save
              </button>
            </div>
            <textarea
              value={drafts[r.key] ?? ""}
              onChange={(e) => setDrafts({ ...drafts, [r.key]: e.target.value })}
              rows={Math.min(20, (drafts[r.key]?.split("\n").length ?? 4) + 1)}
              className="mt-3 block w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
            />
          </div>
        ))}
        {!rows.length && (
          <p className="text-sm text-muted-foreground">No content keys yet.</p>
        )}
      </div>
    </div>
  );
}
