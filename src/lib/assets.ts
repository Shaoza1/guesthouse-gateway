// Maps the seed-data asset keys (e.g. "asset:room-double") to bundled images
// so the admin can later swap an asset reference for a real Storage URL
// (e.g. "https://.../storage/v1/object/public/...") with no code change.

import heroGarden from "@/assets/hero-garden.jpg";
import roomDouble from "@/assets/room-double.jpg";
import roomFamily from "@/assets/room-family.jpg";
import roomTwin from "@/assets/room-twin.jpg";
import pool from "@/assets/pool.jpg";
import gardenWater from "@/assets/garden-water.jpg";
import breakfast from "@/assets/breakfast.jpg";
import braai from "@/assets/braai.jpg";

const ASSET_MAP: Record<string, string> = {
  "hero-garden": heroGarden,
  "room-double": roomDouble,
  "room-family": roomFamily,
  "room-twin": roomTwin,
  pool,
  "garden-water": gardenWater,
  breakfast,
  braai,
};

export function resolveImage(value: string | undefined | null): string {
  if (!value) return heroGarden;
  if (value.startsWith("asset:")) {
    const key = value.slice(6);
    return ASSET_MAP[key] ?? heroGarden;
  }
  return value;
}

export { heroGarden };
