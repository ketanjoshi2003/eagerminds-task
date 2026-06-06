"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export async function claimHandle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const handle = (formData.get("handle") as string)?.trim().toLowerCase();

  // Validate format
  if (!handle || !HANDLE_REGEX.test(handle)) {
    return {
      error:
        "Handle must be 3–30 characters and contain only letters, numbers, or underscores.",
    };
  }

  // Check if user already has a handle
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile?.handle) {
    redirect("/dashboard");
  }

  // Check uniqueness
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (taken) {
    return { error: "This handle is already taken. Try another one." };
  }

  // Upsert the profile (insert if doesn't exist, update if the trigger created a row without handle)
  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, handle }, { onConflict: "id" });

  if (upsertError) {
    return { error: upsertError.message };
  }

  redirect("/dashboard");
}

export async function checkHandleAvailability(handle: string) {
  const supabase = await createClient();

  if (!handle || !HANDLE_REGEX.test(handle)) {
    return { available: false, error: "Invalid format" };
  }

  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle.toLowerCase().trim())
    .maybeSingle();

  return { available: !taken, error: null };
}
