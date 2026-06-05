import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard — Bookmarks",
  description: "Manage your saved bookmarks and collections.",
};

/**
 * Protected page — the proxy (middleware) redirects unauthenticated
 * visitors to /login before this component even renders. This
 * server-side check is an additional safety net.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0b10] px-6">
      <div className="text-center">
        <span className="text-5xl">🔖</span>
        <h1 className="mt-4 text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-slate-400">
          Welcome,{" "}
          <span className="font-medium text-violet-400">
            {user.user_metadata?.display_name || user.email}
          </span>
        </p>
        <p className="mt-6 text-sm text-slate-500">
          Bookmarks data and collections will appear here.
        </p>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            formAction={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/login");
            }}
            className="mt-8 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
