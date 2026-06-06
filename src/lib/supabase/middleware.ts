import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session and writes updated tokens
 * back to the response cookies. This must run in the proxy (middleware)
 * so that expired sessions are refreshed before any page renders.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Forward updated cookies to the request so downstream
          // Server Components can read the refreshed session.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          // Write cookies to the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );

          // Apply cache-busting headers to prevent CDNs from
          // caching responses that set auth cookies.
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value)
            );
          }
        },
      },
    }
  );

  // IMPORTANT: Call getUser() to trigger token refresh.
  // Do NOT use getSession() — it reads from cookies without
  // validating the token against the Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard and /onboarding — redirect unauthenticated users to /login
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/onboarding"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
