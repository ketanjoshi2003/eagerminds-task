"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
 * On success, fires a welcome/confirmation email via the Resend API.
 */
export async function signup(formData: FormData) {
  try {
    const headersList = await headers();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const handle = (formData.get("handle") as string)?.toLowerCase()?.trim();

    const origin = headersList.get("origin") || headersList.get("host") || "";
    const protocol = origin.startsWith("localhost") ? "http" : "https";
    const baseUrl = origin.startsWith("http") ? origin : `${protocol}://${origin}`;

    // 1. Check if the handle is already taken in the profiles table
    const { data: existingProfile } = await getSupabaseAdmin()
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .maybeSingle();

    if (existingProfile) {
      redirect(`/signup?error=${encodeURIComponent("This handle is already taken.")}`);
    }

    // 2. Generate the confirmation link
    const adminClient = getSupabaseAdmin();
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          display_name: name,
          handle: handle,
        },
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    const hashedToken = data?.properties?.hashed_token;
    if (!hashedToken) {
      redirect(`/signup?error=${encodeURIComponent("Failed to generate verification link.")}`);
    }

    const verificationType = data?.properties?.verification_type || "signup";
    const actionLink = `${baseUrl}/auth/confirm?token_hash=${hashedToken}&type=${verificationType}`;

    // 3. Send the confirmation email via Resend API
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      if (data?.user?.id) {
        await adminClient.auth.admin.deleteUser(data.user.id);
      }
      redirect(`/signup?error=${encodeURIComponent("Email service (Resend) not configured on the server.")}`);
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Bookmarks <onboarding@resend.dev>",
          to: [email],
          subject: "Confirm your email - Bookmarks 🔖",
          html: `
            <!DOCTYPE html>
            <html>
              <body style="margin:0;padding:0;background-color:#0f0f14;font-family:sans-serif;">
                <div style="max-width:560px;margin:20px auto;background:#1a1a2e;border-radius:16px;padding:40px;border:1px solid rgba(139,92,246,0.2);color:#ffffff;">
                  <div style="font-size:36px;text-align:center;">🔖</div>
                  <h1 style="text-align:center;font-size:24px;color:#ffffff;">Confirm Your Account</h1>
                  <p style="color:#a0a0b8;line-height:1.6;font-size:16px;">
                    Hey <strong>${name || email.split('@')[0]}</strong>,<br/><br/>
                    Thanks for signing up! Please click the button below to confirm your email and access your dashboard.
                  </p>
                  <div style="text-align:center;margin:30px 0;">
                    <a href="${actionLink}" style="display:inline-block;padding:12px 30px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                      Confirm Email
                    </a>
                  </div>
                  <hr style="border:0;border-top:1px solid rgba(255,255,255,0.06);margin:20px 0;"/>
                  <p style="font-size:12px;color:#64648b;text-align:center;">
                    If you didn't create this account, you can safely ignore this email.
                  </p>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        console.error("Resend error:", errJson);
        throw new Error("Resend API failed");
      }
    } catch (err) {
      if (data?.user?.id) {
        const adminClient = getSupabaseAdmin();
        await adminClient.auth.admin.deleteUser(data.user.id);
      }
      redirect(`/signup?error=${encodeURIComponent("Could not send confirmation email. Please try again.")}`);
    }

    redirect("/signup?message=Check your email to confirm your account");
  } catch (err: any) {
    if (err && err.digest && err.digest.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Signup error details:", err);
    redirect(`/signup?error=${encodeURIComponent(err.message || "An unexpected server error occurred during signup.")}`);
  }
}
