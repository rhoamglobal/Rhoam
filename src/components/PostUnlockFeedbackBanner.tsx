"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

type Pending = { propertyId: string; propertyTitle: string };

const RESPONSE_OPTIONS: { value: string; label: string }[] = [
  { value: "found_place", label: "Found a place" },
  { value: "still_looking", label: "Still looking" },
  { value: "no_response", label: "Couldn't reach them" },
  { value: "listing_wrong", label: "Listing was wrong" },
];

// One-shot: shows at most one prompt, and once answered (or dismissed)
// doesn't nag again this session. No penalty for ignoring it — this is
// closing a loop for our own data, not something the user owes us.
export default function PostUnlockFeedbackBanner() {
  const [pending, setPending] = useState<Pending | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetch("/api/unlock-feedback/pending")
      .then((res) => (res.ok ? res.json() : { pending: null }))
      .then((data) => setPending(data.pending))
      .catch(() => setPending(null));
  }, []);

  if (!pending || dismissed) return null;

  const respond = async (value: string) => {
    setAnswered(true);
    try {
      await fetch("/api/unlock-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: pending.propertyId, response: value }),
      });
    } catch {
      // Non-critical — if this fails, the prompt just resurfaces next
      // visit, which is an acceptable fallback rather than blocking on it.
    }
  };

  if (answered) {
    return (
      <div className="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
        <CheckCircle2 size={16} />
        Thanks for letting us know!
      </div>
    );
  }

  return (
    <div className="mt-6 px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-900">
          Did &ldquo;{pending.propertyTitle}&rdquo; work out?
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 h-6 w-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition"
        >
          <X size={13} className="text-gray-400" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {RESPONSE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => respond(opt.value)}
            className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-[#ff5a5f] hover:text-[#ff5a5f] transition"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
