"use client";

import { SearchX, WifiOff, MapPinned } from "lucide-react";
import { Z_CLASS } from "@/lib/zIndex";

type Props =
  | {
      variant: "error";
      onRetry: () => void;
    }
  | {
      variant: "narrowed-empty";
      onReset: () => void;
    }
  | {
      variant: "cold-start-empty";
    };

// Three distinct messages for what used to be one silent blank map
// (RHM-114/115):
//   - "error": the request itself failed — retry-capable, not "no results"
//   - "narrowed-empty": the user's own filters/search/category produced
//     zero matches — offer to reset, since matches likely exist elsewhere
//   - "cold-start-empty": nothing is narrowed at all and there's still
//     nothing here — Rhoam genuinely hasn't reached this area yet. This
//     one stays out of the user's way on purpose: no modal card, no form
//     to fill in, just a small non-blocking hint so panning/zooming to
//     explore uncovered areas never feels gated.
export default function MapEmptyState(props: Props) {
  if (props.variant === "cold-start-empty") {
    return (
      <div
        className={`pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 ${Z_CLASS.mapEmptyState} px-4`}
      >
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-white px-4 py-2">
          <MapPinned size={14} className="text-[#ff5a5f]" />
          <span className="text-xs font-medium text-gray-600">
            Nothing here yet — keep exploring
          </span>
        </div>
      </div>
    );
  }

  const content = (() => {
    switch (props.variant) {
      case "error":
        return {
          icon: <WifiOff size={22} className="text-[#ff5a5f]" />,
          title: "Couldn't load listings",
          body: "Something went wrong reaching our servers. Check your connection and try again.",
          action: (
            <button
              onClick={props.onRetry}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#ff5a5f] text-white text-sm font-semibold shadow-lg shadow-[#ff5a5f]/25 hover:bg-[#f24d52] transition"
            >
              Retry
            </button>
          ),
        };
      case "narrowed-empty":
        return {
          icon: <SearchX size={22} className="text-[#ff5a5f]" />,
          title: "No matches here",
          body: "Nothing fits your current search and filters in this area. Try widening them.",
          action: (
            <button
              onClick={props.onReset}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#ff5a5f] text-white text-sm font-semibold shadow-lg shadow-[#ff5a5f]/25 hover:bg-[#f24d52] transition"
            >
              Reset search & filters
            </button>
          ),
        };
    }
  })();

  return (
    <div className={`pointer-events-none absolute inset-0 ${Z_CLASS.mapEmptyState} flex items-center justify-center px-6`}>
      <div className="pointer-events-auto max-w-xs w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] border border-white p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-[#fff1f1] flex items-center justify-center mb-3">
          {content.icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{content.title}</h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{content.body}</p>
        {content.action}
      </div>
    </div>
  );
}
