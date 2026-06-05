import type { Metadata } from "next";
import { signup } from "@/app/actions/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign Up — Bookmarks",
  description:
    "Create a free Bookmarks account and start saving your favorite links today.",
};

export default async function SignupPage({
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
        <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-fuchsia-600/15 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

        <div className="relative z-10 max-w-md px-10 text-center">
          <span className="text-6xl">🔖</span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Start collecting
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              what matters to you.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Join thousands who trust Bookmarks to keep their web organized,
            searchable, and always within reach.
          </p>
        </div>
      </div>

      {/* ——— Right: signup form ——— */}
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Free forever. No credit card required.
          </p>

          {/* Error / Success banners */}
          {error && (
            <div
              id="signup-error"
              className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {decodeURIComponent(error)}
            </div>
          )}
          {message && (
            <div
              id="signup-message"
              className="mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
            >
              {decodeURIComponent(message)}
            </div>
          )}

          <form action={signup} className="mt-8 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 shadow-sm outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Minimum 6 characters.
              </p>
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              className="relative w-full cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition-all hover:shadow-fuchsia-500/40 hover:brightness-110 active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
