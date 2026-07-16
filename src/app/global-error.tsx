"use client";

import { useEffect } from "react";
import "./globals.css";

// This only fires if the ROOT layout itself throws — a much rarer case
// than error.tsx (which handles crashes in normal pages). Because it
// replaces the entire root layout, it needs its own <html>/<body> and
// its own import of the global stylesheet, or this page would render
// completely unstyled at exactly the moment it looks worst.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        route: "root-layout",
        context: { digest: error.digest },
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Something went wrong
          </h1>

          <p className="mt-2 text-gray-500 max-w-sm">
            We've logged it. Try reloading the page.
          </p>

          <button
            onClick={reset}
            className="
              mt-8 px-6 py-3 rounded-full
              bg-[#FF6B6B] text-white font-medium
              shadow-lg shadow-[#FF6B6B]/25
              hover:bg-[#ff5252]
              transition
            "
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
