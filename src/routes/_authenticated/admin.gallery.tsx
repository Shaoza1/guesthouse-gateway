import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/assets";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGallery,
});

type Img = {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  sort_order: number;
  is_published: boolean;
};

function AdminGallery() {
  const [rows, setRows] = useState<Img[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    image_url: "",
    alt_text: "",
    caption: "",
    sort_order: 0,
  });

  async function load() {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setMsg(error.message);
    else setRows((data ?? []) as Img[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.from("gallery_images").insert({
      ...form,
      caption: form.caption || null,
    });
    if (error) return setMsg(error.message);
    setForm({ image_url: "", alt_text: "", caption: "", sort_order: 0 });
    load();
  }

  async function update(id: string, patch: Partial<Img>) {
    const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) setMsg(error.message);
    else load();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl">Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Manage photos shown on the public Gallery page.
        </p>
      </header>

      {msg && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {msg}
        </p>
      )}

      <form
        onSubmit={add}
        className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2"
      >
        <input
          required
          placeholder="Image URL (http(s):// or asset:key)"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className={inputCls}
        />
        <input
          required
          placeholder="Alt text (describe the photo)"
          value={form.alt_text}
          onChange={(e) => setForm({ ...form, alt_text: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Caption (optional)"
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className={inputCls}
        />
        <input
          type="number"
          placeholder="Sort order"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
          className={inputCls}
        />
        <div className="sm:col-span-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95">
            Add image
          </button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="aspect-[4/3] bg-secondary">
              <img
                src={resolveImage(r.image_url)}
                alt={r.alt_text}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-3 text-sm">
              <input
                value={r.alt_text}
                onChange={(e) => update(r.id, { alt_text: e.target.value })}
                className={inputCls}
              />
              <input
                value={r.caption ?? ""}
                placeholder="Caption"
                onChange={(e) =>
                  update(r.id, { caption: e.target.value || null })
                }
                className={inputCls}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={r.is_published}
                    onChange={(e) =>
                      update(r.id, { is_published: e.target.checked })
                    }
                  />
                  Published
                </label>
                <input
                  type="number"
                  value={r.sort_order}
                  onChange={(e) =>
                    update(r.id, { sort_order: Number(e.target.value) })
                  }
                  className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs"
                />
                <button
                  onClick={() => remove(r.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!rows.length && (
          <p className="text-sm text-muted-foreground">No images yet.</p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "block w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
