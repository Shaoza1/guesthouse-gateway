import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Room = {
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
};

export type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string | null;
  sort_order: number;
};

export type SiteContent = Record<string, Record<string, unknown>>;

export const roomsQuery = () =>
  queryOptions({
    queryKey: ["rooms"],
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          "id,slug,name,description,bed_configuration,sleeps,price_indicator,amenities,image_urls,sort_order",
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Room[];
    },
    staleTime: 1000 * 60,
  });

export const galleryQuery = () =>
  queryOptions({
    queryKey: ["gallery"],
    queryFn: async (): Promise<GalleryImage[]> => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,image_url,alt_text,caption,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as GalleryImage[];
    },
    staleTime: 1000 * 60,
  });

export const siteContentQuery = () =>
  queryOptions({
    queryKey: ["site_content"],
    queryFn: async (): Promise<SiteContent> => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key,value");
      if (error) throw error;
      const out: SiteContent = {};
      for (const row of data ?? []) {
        out[row.key as string] = (row.value as Record<string, unknown>) ?? {};
      }
      return out;
    },
    staleTime: 1000 * 60,
  });

export function pickString(
  content: SiteContent,
  key: string,
  field: string,
  fallback = "",
): string {
  const v = content[key]?.[field];
  return typeof v === "string" ? v : fallback;
}
