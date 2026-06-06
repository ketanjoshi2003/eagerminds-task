import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `@${handle}'s Public Bookmarks`,
    description: `Browse public bookmarks saved by @${handle}.`,
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params;
  const decodedHandle = decodeURIComponent(handle).toLowerCase().trim();

  const supabase = await createClient();

  // 1. Fetch user profile by handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, created_at")
    .eq("handle", decodedHandle)
    .maybeSingle();

  if (!profile) {
    // Clean 404 for non-existent handles
    return (
      <div className="min-h-screen bg-[#06060a] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-200px] left-[20%] h-[500px] w-[500px] rounded-full bg-violet-900/8 blur-[160px] pointer-events-none" />
        <div className="text-center px-6 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            @{decodedHandle} not found
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
            This handle doesn&apos;t exist yet. Want to claim it?
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:brightness-110"
          >
            Create an account
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  // 2. Fetch public bookmarks for this user
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("id, title, url, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const bookmarks = bookmarksData || [];

  // Extract domain helper
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-white relative flex flex-col">
      {/* Background effects */}
      <div className="absolute top-[-200px] right-[15%] h-[600px] w-[600px] rounded-full bg-violet-900/8 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-900/6 blur-[160px] pointer-events-none" />

      <main className="max-w-2xl w-full mx-auto px-6 py-16 relative z-10 flex-grow">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/[0.06] text-3xl font-bold text-violet-300 mb-5">
            {profile.handle.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            @{profile.handle}
          </h1>
          <p className="text-sm text-slate-500">
            {bookmarks.length} public bookmark{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Bookmarks List */}
        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.01] p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">
              No public bookmarks yet
            </p>
            <p className="text-xs text-slate-600">
              @{profile.handle} hasn&apos;t shared any bookmarks publicly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/10"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/15 border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:from-violet-500/25 group-hover:to-indigo-500/25 transition-all">
                  <span className="text-sm font-bold text-violet-300">
                    {b.title.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white group-hover:text-violet-300 transition truncate">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {getDomain(b.url)}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.04] py-8 text-center relative z-10">
        <p className="text-xs text-slate-600">
          Powered by{" "}
          <a
            href="/signup"
            className="font-semibold text-violet-500 hover:text-violet-400 transition"
          >
            Bookmarks
          </a>{" "}
          — Save and share your favorite links.
        </p>
      </footer>
    </div>
  );
}
