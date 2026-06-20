# Woodpecker Guesthouse

A 4-star guesthouse PWA for Woodpecker Guesthouse in Ficksburg, Free State, South Africa.

## Tech stack

- TanStack Start (React 19) + Vite
- Tailwind CSS v4
- Lovable Cloud (Supabase) — database, auth, storage
- Deployed via Lovable's Publish flow (`.lovable.app` + custom domains supported)

## Local development

```
bun install
bun dev
```

Environment variables (managed automatically in Lovable):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — client
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — server only

## Database schema (Phase 1)

All public-schema tables have Row Level Security enabled:

| Table | Public read | Public write | Admin |
| ----- | ----------- | ------------ | ----- |
| `rooms` | `is_published = true` | — | full CRUD |
| `gallery_images` | `is_published = true` | — | full CRUD |
| `site_content` | yes (key/value text blocks) | — | full CRUD |
| `inquiries` | — | `INSERT` only (contact form) | read / update / delete |
| `user_roles` | — | — | managed via SQL |

A `has_role(uid, 'admin')` security-definer function drives admin-only policies.

### Granting the admin role (Phase 2)

After the owner has signed up through Cloud → Users:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'OWNER_EMAIL_HERE';
```

## Nightsbridge booking integration

The booking URL is a single configurable constant in `src/lib/site-config.ts`:

```ts
export const NIGHTSBRIDGE_BBID = "00000"; // PLACEHOLDER
```

When Eureka confirms the real BBID, replace that one value — every Book button
and the `/book` page pick it up automatically. The booking iframe on `/book` is
lazy-loaded (only after user interaction) so it doesn't affect page Performance.

## Image management

Working stock photographs live in `src/assets/` and are referenced from the
database using `asset:<name>` keys (e.g. `asset:room-double`). When the client
provides their own licensed photos, the admin panel can upload them to Cloud
Storage and replace the `image_url` / `image_urls` values with the new URLs —
no code change.

## Site structure

| Route | File |
| ----- | ---- |
| `/` Home | `src/routes/index.tsx` |
| `/rooms` | `src/routes/rooms.tsx` |
| `/gallery` | `src/routes/gallery.tsx` |
| `/amenities` | `src/routes/amenities.tsx` |
| `/area` | `src/routes/area.tsx` |
| `/contact` | `src/routes/contact.tsx` |
| `/book` | `src/routes/book.tsx` |
| `/sitemap.xml` | `src/routes/sitemap[.]xml.ts` |

`public/robots.txt` allows all public pages and disallows `/admin`.
`public/manifest.webmanifest` provides PWA / Add-to-Home-Screen support.

## Phase 2 (next)

- `/admin` route + Supabase Auth login
- Admin CMS for rooms, gallery, site content, inquiries
- PWA icon set (192/512/maskable) and offline fallback page
- Lighthouse audit pass at 100/100/100/100
