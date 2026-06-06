"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Server Action: Log in an existing user with email + password.
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

/**
 * Server Action: Register a new user with email + password.
 * On success, fires a welcome email via the /api/welcome-email route.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();
  const headersList = await headers();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const origin = headersList.get("origin") || headersList.get("host") || "";
  const protocol = origin.startsWith("localhost") ? "http" : "https";
  const baseUrl = origin.startsWith("http") ? origin : `${protocol}://${origin}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Fire welcome email (non-blocking)

  try {
    fetch(`${baseUrl}/api/welcome-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
  } catch {
    // Non-critical — don't block signup on email failure
    console.error("Failed to trigger welcome email");
  }

  // If email confirmation is required, redirect to a check-email page
  // Otherwise redirect to dashboard
  if (data?.user?.identities?.length === 0) {
    redirect(`/signup?error=${encodeURIComponent("An account with this email already exists.")}`);
  }

  redirect("/signup?message=Check your email to confirm your account");
}
