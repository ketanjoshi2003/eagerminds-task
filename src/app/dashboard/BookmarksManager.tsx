"use client";

import { useState } from "react";
import { addBookmark, updateBookmark, deleteBookmark } from "@/app/actions/bookmarks";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  is_public: boolean;
  created_at: string;
}

interface BookmarksManagerProps {
  initialBookmarks: Bookmark[];
  handle: string;
  displayName: string;
  email: string;
}

export default function BookmarksManager({
  initialBookmarks,
  handle,
  displayName,
  email,
}: BookmarksManagerProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [copied, setCopied] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editError, setEditError] = useState("");

  // Copy Public Link
  const copyPublicLink = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add Bookmark Handler
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    if (!newTitle.trim() || !newUrl.trim()) {
      setFormError("Title and URL are required.");
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("url", newUrl);
      formData.append("is_public", newIsPublic ? "true" : "false");

      await addBookmark(formData);

      // Refresh list locally (optimistic or simple state sync)
      // Since revalidatePath resets the page, we could reload or just update state.
      // A full page reload/refresh is simple, but we can also just construct a temp item
      // to keep user experience instantaneous, or window.location.reload()
      window.location.reload();
    } catch (err: any) {
      setFormError(err.message || "Failed to add bookmark.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Bookmark Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bookmark?")) return;

    try {
      await deleteBookmark(id);
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete bookmark.");
    }
  };

  // Start Edit Handler
  const startEdit = (b: Bookmark) => {
    setEditingId(b.id);
    setEditTitle(b.title);
    setEditUrl(b.url);
    setEditIsPublic(b.is_public);
    setEditError("");
  };

  // Save Edit Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");

    if (!editTitle.trim() || !editUrl.trim()) {
      setEditError("Title and URL are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", editingId!);
      formData.append("title", editTitle);
      formData.append("url", editUrl);
      formData.append("is_public", editIsPublic ? "true" : "false");

      await updateBookmark(formData);

      setBookmarks(
        bookmarks.map((b) =>
          b.id === editingId
            ? { ...b, title: editTitle, url: editUrl, is_public: editIsPublic }
            : b
        )
      );
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.message || "Failed to update bookmark.");
    }
  };

  return (
    <div className="w-full max-w-5xl px-4 py-8 mx-auto text-white">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome back, {displayName || email}
          </h1>
          <p className="mt-1 text-slate-400">
            Handle: <span className="text-violet-400 font-semibold">@{handle}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={copyPublicLink}
            className="flex items-center gap-2 cursor-pointer rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition-all hover:bg-violet-500/20 active:scale-[0.98]"
          >
            <span>{copied ? "Copied! 📋" : "Copy Public Profile Link 🔗"}</span>
          </button>
          <a
            href={`/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 shadow-lg shadow-violet-500/25"
          >
            View Public Page
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Add Bookmark Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-[#0e0e15] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-600/5 blur-[50px] pointer-events-none" />
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🔖</span> Add New Bookmark
            </h2>

            <form onSubmit={handleAdd} className="space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Bookmark Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supabase Documentation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://supabase.com/docs"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-violet-500/50"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="block text-sm font-medium">Public Access</span>
                  <span className="block text-xs text-slate-400">
                    Visible on your public profile page
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPublic}
                    onChange={(e) => setNewIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full cursor-pointer rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Save Bookmark"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Bookmarks List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>📚</span> Your Saved Bookmarks ({bookmarks.length})
          </h2>

          {bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
              <span className="text-4xl block mb-2">📥</span>
              <p className="text-slate-400 font-medium">No bookmarks saved yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the form on the left to save your first bookmark.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-5 transition-all duration-200 bg-[#0e0e15] ${
                    editingId === b.id
                      ? "border-violet-500 ring-2 ring-violet-500/20"
                      : "border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-violet-950/10"
                  }`}
                >
                  {editingId === b.id ? (
                    /* EDIT MODE */
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      {editError && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                          {editError}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="block w-full rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            required
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="block w-full rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsPublic}
                            onChange={(e) => setEditIsPublic(e.target.checked)}
                            className="rounded border-white/10 bg-white/5 text-violet-600 focus:ring-0"
                          />
                          <span className="text-xs font-medium text-slate-300">
                            Public (visible on public profile)
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* VIEW MODE */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-bold text-lg text-white">
                            {b.title}
                          </h3>
                          {b.is_public ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
                              Private
                            </span>
                          )}
                        </div>
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-violet-400 hover:text-violet-300 hover:underline break-all block"
                        >
                          {b.url}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center self-end">
                        <button
                          onClick={() => startEdit(b)}
                          className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
