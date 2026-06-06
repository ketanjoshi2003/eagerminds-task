"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addBookmark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    title,
    url,
    is_public: isPublic,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function updateBookmark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const isPublic = formData.get("is_public") === "true" || formData.get("is_public") === "on";

  const { error } = await supabase
    .from("bookmarks")
    .update({
      title,
      url,
      is_public: isPublic,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function deleteBookmark(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
