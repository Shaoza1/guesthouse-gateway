import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public: does ANY admin exist? Used by /auth to show bootstrap form when empty.
export const hasAnyAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw error;
  return { hasAdmin: (count ?? 0) > 0 };
});

// Public ONLY when no admin yet — creates the first admin user.
// Idempotent guard: if an admin already exists, refuses.
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(10).max(128),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw cErr;
    if ((count ?? 0) > 0) {
      throw new Error("An admin already exists. Bootstrap is disabled.");
    }

    const { data: created, error: uErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (uErr) throw uErr;
    const userId = created.user?.id;
    if (!userId) throw new Error("Failed to create user");

    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (rErr) throw rErr;

    return { ok: true };
  });
