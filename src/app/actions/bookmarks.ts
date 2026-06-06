"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_TITLE_LENGTH = 200;
const MAX_URL_LENGTH = 2048;

export async function addBookmark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = (formData.get("title") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";

  // Input validation
  if (!title || title.length === 0) {
    throw new Error("Title is required.");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
  }
  if (!url || url.length === 0) {
    throw new Error("URL is required.");
  }
  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL must be ${MAX_URL_LENGTH} characters or less.`);
  }
  // Basic URL format check
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format.");
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: user.id,
      title,
      url,
      is_public: isPublic,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return data;
}

export async function updateBookmark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim();
  const url = (formData.get("url") as string)?.trim();
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";

  // Input validation
  if (!id) {
    throw new Error("Bookmark ID is required.");
  }
  if (!title || title.length === 0) {
    throw new Error("Title is required.");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
  }
  if (!url || url.length === 0) {
    throw new Error("URL is required.");
  }
  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL must be ${MAX_URL_LENGTH} characters or less.`);
  }
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format.");
  }

  // Update scoped to the authenticated user — RLS also enforces this
  const { data, error } = await supabase
    .from("bookmarks")
    .update({
      title,
      url,
      is_public: isPublic,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // If no row was returned, the bookmark doesn't exist or doesn't belong to this user
  if (!data) {
    throw new Error("Bookmark not found or access denied.");
  }

  revalidatePath("/dashboard");
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!id) {
    throw new Error("Bookmark ID is required.");
  }

  // Delete scoped to the authenticated user — RLS also enforces this
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // If no row was returned, the bookmark doesn't exist or doesn't belong to this user
  if (!data) {
    throw new Error("Bookmark not found or access denied.");
  }

  revalidatePath("/dashboard");
}
