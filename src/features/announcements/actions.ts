"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Announcement, AnnouncementFormValues } from "./types";
import { CACHE_KEYS, keys } from "@/lib/cache/keys";

/**
 * Fetch all active announcements for public display
 * 🔥 Cached with unstable_cache and revalidated via CACHE_KEYS.announcements
 */
export const getActiveAnnouncements = unstable_cache(
  async (): Promise<Announcement[]> => {
    // 🔥 Use public client for global cache (no cookies/headers dependency)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }

    return data || [];
  },
  keys.announcements(),
  {
    tags: [CACHE_KEYS.announcements],
  }
);

/**
 * Admin: Get all announcements
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin announcements:", error);
    return [];
  }

  return data || [];
}

/**
 * Admin: Create an announcement
 */
export async function createAnnouncement(values: AnnouncementFormValues) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert([values])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidateTag(CACHE_KEYS.announcements, 'max');
  return data;
}

/**
 * Admin: Update an announcement
 */
export async function updateAnnouncement(id: string, values: Partial<AnnouncementFormValues>) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidateTag(CACHE_KEYS.announcements, 'max');
  return data;
}

/**
 * Admin: Delete an announcement
 */
export async function deleteAnnouncement(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/announcements");
  revalidateTag(CACHE_KEYS.announcements, 'max');
  return { success: true };
}
