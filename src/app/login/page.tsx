import type { Metadata } from "next";
import { login } from "@/app/actions/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log In — Bookmarks",
  description:
    "Sign in to your Bookmarks account to access your saved links and collections.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <div className="flex min-h-screen">
      {/* ——— Left: decorative panel ——— */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#0f0a1e] via-[#1a103a] to-[#0e1630]">
        {/* Ambient glow blobs */}
        <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-indigo-500/20 blur-[100px]" />

        <div className="relative z-10 max-w-md px-10 text-center">
          <span className="text-6xl">🔖</span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Your links,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              beautifully organized.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Save anything from the web, tag it, search it — and never lose a
            link again.
          </p>
        </div>
      </div>

      {/* ——— Right: login form ——— */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[#0b0b10]">
        <div className="w-full max-w-sm">
          {/* Mobile-only branding */}
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">🔖</span>
            <h1 className="mt-2 text-xl font-semibold text-white">
              Bookmarks
            </h1>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your dashboard.
          </p>

          {/* Error / Info banners */}
          {error && (
            <div
              id="login-error"
              className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div
              id="login-message"
              className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {decodeURIComponent(message)}
            </div>
          )}

          <form action={login} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="relative w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
