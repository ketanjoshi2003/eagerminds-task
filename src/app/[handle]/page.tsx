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

  // Create a server client (runs in standard server component context, no session required for public reads)
  const supabase = await createClient();

  // 1. Fetch user profile by handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, created_at")
    .eq("handle", decodedHandle)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // 2. Fetch public bookmarks for this user
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("id, title, url, created_at")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const bookmarks = bookmarksData || [];

  return (
    <div className="min-h-screen bg-[#06060a] text-white relative flex flex-col justify-between">
      {/* Glow blobs */}
      <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <main className="max-w-3xl w-full mx-auto px-6 py-16 relative z-10 flex-grow">
        {/* Profile Card Header */}
        <div className="text-center pb-10 border-b border-white/5 mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-4xl shadow-xl shadow-violet-500/10 mb-4">
            🔖
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            @{profile.handle}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Public Bookmarks Collection
          </p>
        </div>

        {/* Public Bookmarks List */}
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center">
              <span className="text-3xl block mb-2">📦</span>
              <p className="text-slate-400 font-medium">No public bookmarks shared yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Bookmarks saved by @{profile.handle} are currently private.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookmarks.map((b) => (
                <a
                  key={b.id}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-white/5 bg-[#0e0e15] p-5 hover:border-violet-500/30 hover:bg-violet-950/5 transition duration-200 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-violet-300 transition duration-150">
                        {b.title}
                      </h3>
                      <span className="text-xs text-violet-400/80 break-all block group-hover:underline">
                        {b.url}
                      </span>
                    </div>
                    <span className="text-slate-500 group-hover:text-violet-400 transition duration-150 text-xl font-bold">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full border-t border-white/5 py-8 text-center relative z-10">
        <p className="text-xs text-slate-500">
          Powered by{" "}
          <a
            href="/signup"
            className="font-semibold text-violet-400 hover:text-violet-300 hover:underline"
          >
            Bookmarks
          </a>{" "}
          — Save and share your favorite links.
        </p>
      </footer>
    </div>
  );
}
