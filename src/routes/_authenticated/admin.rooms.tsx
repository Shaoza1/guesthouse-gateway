import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/rooms")({
  component: AdminRooms,
});

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  bed_configuration: string;
  sleeps: number;
  price_indicator: string | null;
  amenities: string[];
  image_urls: string[];
  sort_order: number;
  is_published: boolean;
};

const EMPTY: Omit<Row, "id"> = {
  slug: "",
  name: "",
  description: "",
  bed_configuration: "",
  sleeps: 2,
  price_indicator: "",
  amenities: [],
  image_urls: [],
  sort_order: 0,
  is_published: true,
};

function AdminRooms() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setMsg(error.message);
    else setRows((data ?? []) as Row[]);
  }
  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setDraft(EMPTY);
    setEditing(null);
    setCreating(true);
  }
  function startEdit(r: Row) {
    setDraft({ ...r });
    setEditing(r);
    setCreating(false);
  }
  function cancel() {
    setEditing(null);
    setCreating(false);
  }

  async function save() {
    setMsg(null);
    const payload = {
      ...draft,
      price_indicator: draft.price_indicator || null,
      amenities: draft.amenities,
      image_urls: draft.image_urls,
    };
    if (creating) {
      const { error } = await supabase.from("rooms").insert(payload);
      if (error) return setMsg(error.message);
    } else if (editing) {
      const { error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", editing.id);
      if (error) return setMsg(error.message);
    }
    cancel();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this room?")) return;
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  const isForm = creating || editing;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Published rooms appear on the public Rooms page.
          </p>
        </div>
        {!isForm && (
          <button
            onClick={startCreate}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
          >
            + New room
          </button>
        )}
      </header>

      {msg && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {msg}
        </p>
      )}

      {isForm ? (
        <RoomForm
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          isNew={creating}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Sleeps</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
                  <td className="px-4 py-3">{r.sleeps}</td>
                  <td className="px-4 py-3">{r.sort_order}</td>
                  <td className="px-4 py-3">
                    {r.is_published ? (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Live
                      </span>
                    ) : (
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => startEdit(r)}
                      className="mr-2 text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No rooms yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RoomForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  isNew,
}: {
  draft: Omit<Row, "id">;
  setDraft: (d: Omit<Row, "id">) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  function field<K extends keyof Omit<Row, "id">>(k: K, v: Omit<Row, "id">[K]) {
    setDraft({ ...draft, [k]: v });
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-4 rounded-lg border border-border bg-card p-6"
    >
      <h2 className="font-serif text-lg">{isNew ? "New room" : "Edit room"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label label="Name">
          <input
            required
            value={draft.name}
            onChange={(e) => field("name", e.target.value)}
            className={inputCls}
          />
        </Label>
        <Label label="Slug (URL key)">
          <input
            required
            value={draft.slug}
            onChange={(e) => field("slug", e.target.value)}
            className={inputCls}
          />
        </Label>
        <Label label="Bed configuration">
          <input
            value={draft.bed_configuration}
            onChange={(e) => field("bed_configuration", e.target.value)}
            className={inputCls}
          />
        </Label>
        <Label label="Sleeps">
          <input
            type="number"
            min={1}
            value={draft.sleeps}
            onChange={(e) => field("sleeps", Number(e.target.value))}
            className={inputCls}
          />
        </Label>
        <Label label="Price indicator">
          <input
            placeholder="e.g. From R950 pp"
            value={draft.price_indicator ?? ""}
            onChange={(e) => field("price_indicator", e.target.value)}
            className={inputCls}
          />
        </Label>
        <Label label="Sort order">
          <input
            type="number"
            value={draft.sort_order}
            onChange={(e) => field("sort_order", Number(e.target.value))}
            className={inputCls}
          />
        </Label>
      </div>
      <Label label="Description">
        <textarea
          rows={4}
          value={draft.description}
          onChange={(e) => field("description", e.target.value)}
          className={inputCls}
        />
      </Label>
      <Label label="Amenities (one per line)">
        <textarea
          rows={4}
          value={draft.amenities.join("\n")}
          onChange={(e) =>
            field(
              "amenities",
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          className={inputCls}
        />
      </Label>
      <Label label="Image URLs (one per line — http(s):// or asset:key)">
        <textarea
          rows={3}
          value={draft.image_urls.join("\n")}
          onChange={(e) =>
            field(
              "image_urls",
              e.target.value
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          className={inputCls}
        />
      </Label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.is_published}
          onChange={(e) => field("is_published", e.target.checked)}
        />
        Published (visible on public site)
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Label({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
