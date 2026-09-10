"use client";

import { SearchX, WifiOff, Home } from "lucide-react";

type Props =
  | { variant: "error"; onRetry: () => void }
  | { variant: "no-results"; onReset: () => void }
  | { variant: "cold-start" };

// List view's own empty state — deliberately not the map's floating
// "modal card" (MapEmptyState): that design makes sense hovering over a
// map, but reads as an unfamiliar popup sitting in normal scrolling page
// content. This follows the plainer, more familiar "no results found"
// pattern used across most search/e-commerce pages: a simple centered
// icon, heading, short explanation, and a clear action — inline, no
// card border or shadow.
export default function ListEmptyState(props: Props) {
  const content = (() => {
    switch (props.variant) {
      case "error":
        return {
          icon: <WifiOff size={28} className="text-gray-400" />,
          title: "Something went wrong",
          body: "We couldn't load listings right now. Please check your connection and try again.",
          action: (
            <button
              onClick={props.onRetry}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#ff5a5f] text-white text-sm font-semibold hover:bg-[#f24d52] transition"
            >
              Try again
            </button>
          ),
        };
      case "no-results":
        return {
          icon: <SearchX size={28} className="text-gray-400" />,
          title: "No results found",
          body: "We couldn't find any properties matching your search. Try different keywords or adjust your filters.",
          action: (
            <button
              onClick={props.onReset}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#ff5a5f] text-white text-sm font-semibold hover:bg-[#f24d52] transition"
            >
              Clear filters
            </button>
          ),
        };
      case "cold-start":
        return {
          icon: <Home size={28} className="text-gray-400" />,
          title: "No listings yet",
          body: "We're still adding verified properties in this area. Check back soon.",
          action: null,
        };
    }
  })();

  return (
    <div className="py-16 px-6 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
        {content.body}
      </p>
      {content.action}
    </div>
  );
}
