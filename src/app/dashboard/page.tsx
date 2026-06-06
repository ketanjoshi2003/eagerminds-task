import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookmarksManager from "./BookmarksManager";

export const metadata: Metadata = {
  title: "Dashboard — Bookmarks",
  description: "Manage your saved bookmarks and collections.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();

  // If no profile or no handle, redirect to onboarding
  if (!profile?.handle) {
    redirect("/onboarding");
  }

  const handle = profile.handle;

  // Get user's bookmarks
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bookmarks = bookmarksData || [];

  return (
    <div className="min-h-screen bg-[#06060a] relative overflow-hidden">
      {/* Layered background glow effects */}
      <div className="absolute top-[-200px] left-[10%] h-[600px] w-[600px] rounded-full bg-violet-900/8 blur-[180px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] h-[500px] w-[500px] rounded-full bg-indigo-900/8 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[30%] h-[400px] w-[400px] rounded-full bg-fuchsia-900/6 blur-[140px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#06060a]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-wide text-white">
              Bookmarks
            </span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              formAction={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/login");
              }}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        <BookmarksManager
          initialBookmarks={bookmarks}
          handle={handle || ""}
          displayName={user.user_metadata?.display_name || ""}
          email={user.email || ""}
        />
      </main>
    </div>
  );
}
