import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HandleForm from "./HandleForm";

export const metadata: Metadata = {
  title: "Choose Your Handle — Bookmarks",
  description: "Pick a unique handle for your public profile.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // If user already has a handle, skip onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.handle) {
    redirect("/dashboard");
  }

  // Suggest a handle based on their email
  const suggestedHandle = user.email
    ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").substring(0, 20).toLowerCase()
    : "";

  return (
    <div className="min-h-screen bg-[#06060a] relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute top-[-200px] left-[20%] h-[600px] w-[600px] rounded-full bg-violet-900/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[20%] h-[500px] w-[500px] rounded-full bg-indigo-900/8 blur-[160px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-600/20 mb-5">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Choose your handle
          </h1>
          <p className="text-base text-slate-400 max-w-sm mx-auto">
            This will be your unique public URL where anyone can see your shared
            bookmarks.
          </p>
        </div>

        {/* Handle Form Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8">
          <HandleForm suggestedHandle={suggestedHandle} />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          You can&apos;t change your handle later, so choose wisely!
        </p>
      </main>
    </div>
  );
}
