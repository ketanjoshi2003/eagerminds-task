"use client";

import { useState, useEffect, useCallback } from "react";
import { claimHandle, checkHandleAvailability } from "@/app/actions/onboarding";

interface HandleFormProps {
  suggestedHandle: string;
}

export default function HandleForm({ suggestedHandle }: HandleFormProps) {
  const [handle, setHandle] = useState(suggestedHandle);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const HANDLE_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

  // Debounced availability check
  const checkAvailability = useCallback(async (value: string) => {
    if (!value || !HANDLE_REGEX.test(value)) {
      setAvailable(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const result = await checkHandleAvailability(value);
      setAvailable(result.available);
    } catch {
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!handle || handle.length < 3) {
      setAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkAvailability(handle);
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, checkAvailability]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setHandle(value);
    setError("");
    setAvailable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!handle.trim()) {
      setError("Please enter a handle.");
      return;
    }

    if (handle.length < 3) {
      setError("Handle must be at least 3 characters.");
      return;
    }

    if (!HANDLE_REGEX.test(handle)) {
      setError("Only letters, numbers, and underscores are allowed.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("handle", handle);
      const result = await claimHandle(formData);
      if (result?.error) {
        setError(result.error);
      }
      // If no error, claimHandle will redirect to /dashboard
    } catch {
      // redirect throws, which is expected on success
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = handle.length >= 3 && HANDLE_REGEX.test(handle);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Handle Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your handle
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base font-medium select-none">
            @
          </span>
          <input
            type="text"
            value={handle}
            onChange={handleChange}
            maxLength={30}
            autoFocus
            placeholder="your_handle"
            className={`block w-full rounded-xl border bg-white/[0.04] pl-9 pr-12 py-3.5 text-base text-white placeholder-slate-600 outline-none transition-all
              ${
                error
                  ? "border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
                  : available === true
                    ? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                    : available === false
                      ? "border-red-500/40 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
                      : "border-white/10 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              }`}
          />

          {/* Status indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checking ? (
              <svg
                className="animate-spin h-5 w-5 text-slate-500"
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
            ) : available === true ? (
              <svg
                className="w-5 h-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : available === false ? (
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : null}
          </div>
        </div>

        {/* Feedback messages */}
        <div className="mt-2 min-h-[20px]">
          {error ? (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
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
              {error}
            </p>
          ) : available === true ? (
            <p className="text-sm text-emerald-400 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              @{handle} is available!
            </p>
          ) : available === false ? (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              @{handle} is already taken
            </p>
          ) : isValid && !checking ? null : handle.length > 0 &&
            handle.length < 3 ? (
            <p className="text-xs text-slate-500">
              At least 3 characters required
            </p>
          ) : null}
        </div>
      </div>

      {/* Preview */}
      {isValid && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-slate-500 mb-1">
            Your public profile URL
          </p>
          <p className="text-sm text-white font-medium">
            {origin}
            <span className="text-violet-400">/{handle}</span>
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !isValid || available === false || checking}
        className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
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
            Claiming handle...
          </span>
        ) : (
          "Claim @" + (handle || "handle")
        )}
      </button>

      {/* Rules hint */}
      <div className="flex items-start gap-3 text-xs text-slate-600">
        <svg
          className="w-4 h-4 shrink-0 mt-0.5 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          Letters, numbers, and underscores only. 3–30 characters.
        </span>
      </div>
    </form>
  );
}
