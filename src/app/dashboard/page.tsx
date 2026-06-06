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
    .single();

  let handle = profile?.handle;

  // Auto-create a profile if it's missing (for users created before the database trigger)
  if (!profile) {
    const defaultHandle = user.email
      ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") + "_" + Math.random().toString(36).substring(2, 6)
      : "user_" + Math.random().toString(36).substring(2, 6);
    
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ id: user.id, handle: defaultHandle.substring(0, 15) })
      .select()
      .single();
    
    handle = newProfile?.handle || defaultHandle;
  }

  // Get user's bookmarks
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const bookmarks = bookmarksData || [];

  return (
    <div className="min-h-screen bg-[#06060a] relative">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-900/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#06060a]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔖</span>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              BOOKMARKS
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
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
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
