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
  const [showAddForm, setShowAddForm] = useState(false);

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

  // Derived stats
  const publicCount = bookmarks.filter((b) => b.is_public).length;
  const privateCount = bookmarks.length - publicCount;

  // Copy Public Link
  const copyPublicLink = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract domain from URL for display
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
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

      const newBookmark = await addBookmark(formData);
      if (newBookmark) {
        setBookmarks([newBookmark, ...bookmarks]);
      }
      setNewTitle("");
      setNewUrl("");
      setNewIsPublic(false);
      setShowAddForm(false);
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

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-7xl px-6 lg:px-8 py-10 mx-auto text-white">
      {/* Hero Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-violet-400 tracking-wide uppercase">
              Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                {displayName || email.split("@")[0]}
              </span>
            </h1>
            <p className="text-base text-slate-400 max-w-lg">
              Manage your bookmarks and share your curated collection with the
              world.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyPublicLink}
              className="flex items-center gap-2 cursor-pointer rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
            >
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied!" : "Share Profile"}
            </button>

            <a
              href={`/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 shadow-lg shadow-violet-600/20 active:scale-[0.98]"
            >
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Public Page
            </a>
          </div>
        </div>

        {/* Profile handle pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-slate-400">
            Your handle:{" "}
            <span className="font-semibold text-white">@{handle}</span>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Bookmarks
          </p>
          <p className="text-3xl font-bold text-white">{bookmarks.length}</p>
        </div>
        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Public
          </p>
          <p className="text-3xl font-bold text-emerald-400">{publicCount}</p>
        </div>
        <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Private
          </p>
          <p className="text-3xl font-bold text-slate-400">{privateCount}</p>
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="space-y-6">
        {/* Section Header with Add button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Bookmarks</h2>
            <p className="text-sm text-slate-500 mt-1">
              {bookmarks.length === 0
                ? "Get started by adding your first bookmark"
                : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showAddForm ? "rotate-45" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {showAddForm ? "Close" : "Add Bookmark"}
          </button>
        </div>

        {/* Collapsible Add Form */}
        {showAddForm && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-8 backdrop-blur-sm animate-in">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              New Bookmark
            </h3>

            <form onSubmit={handleAdd} className="space-y-5">
              {formError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supabase Documentation"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://supabase.com/docs"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsPublic}
                      onChange={(e) => setNewIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                  </label>
                  <div>
                    <span className="block text-sm font-medium text-white">
                      Public
                    </span>
                    <span className="block text-xs text-slate-500">
                      Visible on your public profile
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Bookmark"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bookmark Cards */}
        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-violet-400"
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
            <h3 className="text-lg font-semibold text-white mb-1">
              No bookmarks yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Click the &ldquo;Add Bookmark&rdquo; button above to save your
              first link and start building your collection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className={`group rounded-2xl border p-6 transition-all duration-200 ${
                  editingId === b.id
                    ? "border-violet-500/40 bg-violet-500/[0.04] ring-1 ring-violet-500/20"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                {editingId === b.id ? (
                  /* EDIT MODE */
                  <form onSubmit={handleSaveEdit} className="space-y-5">
                    {editError && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                        {editError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="block w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          URL
                        </label>
                        <input
                          type="url"
                          required
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="block w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={editIsPublic}
                            onChange={(e) =>
                              setEditIsPublic(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          Public
                        </span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="cursor-pointer rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:brightness-110 transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* VIEW MODE */
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Favicon circle */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-violet-300">
                        {b.title.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center flex-wrap gap-2.5">
                        <h3 className="font-semibold text-base text-white truncate">
                          {b.title}
                        </h3>
                        {b.is_public ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-500 border border-slate-500/20">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Private
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-400/80 hover:text-violet-300 transition truncate"
                        >
                          {getDomain(b.url)}
                        </a>
                        <span className="text-slate-700">·</span>
                        <span className="text-slate-600 text-xs">
                          {formatDate(b.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 text-slate-400 hover:text-white transition-all"
                        title="Open link"
                      >
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
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                      <button
                        onClick={() => startEdit(b)}
                        className="cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 text-slate-400 hover:text-white transition-all"
                        title="Edit"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="cursor-pointer rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 p-2.5 text-red-400/70 hover:text-red-400 transition-all"
                        title="Delete"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
  );
}
