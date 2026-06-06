import { createClient } from "@supabase/supabase-js";

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Lazily gets or creates the Supabase Admin client using the service role key.
 * This prevents build-time failures when environment variables are not present.
 */
export function getSupabaseAdmin() {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      const missingKeys = [];
      if (!url) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!key) missingKeys.push("SUPABASE_SERVICE_ROLE_KEY");

      // Safe debugging list (checks what keys exist without revealing sensitive values)
      const envKeys = Object.keys(process.env).filter(
        (k) => k.includes("SUPABASE") || k.includes("RESEND")
      );

      throw new Error(
        `Missing environment variable(s): ${missingKeys.join(", ")}. Loaded related keys: [${envKeys.join(", ")}]`
      );
    }

    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClient;
}
