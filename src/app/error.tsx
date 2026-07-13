"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        route:
          typeof window !== "undefined"
            ? window.location.pathname
            : "unknown",
        context: { digest: error.digest },
      }),
    }).catch(() => {
      // If reporting itself fails, there's nothing else to do here —
      // the person still needs to see the recovery screen below.
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mb-6">
        <AlertTriangle className="text-[#FF6B6B]" size={28} />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">
        Something went wrong
      </h1>

      <p className="mt-2 text-gray-500 max-w-sm">
        That's on us, not you — we've logged it. Try again, or head back
        home.
      </p>

      <div className="flex gap-3 mt-8">
        <button
          onClick={reset}
          className="
            px-6 py-3 rounded-full
            bg-[#FF6B6B] text-white font-medium
            shadow-lg shadow-[#FF6B6B]/25
            hover:bg-[#ff5252]
            transition
          "
        >
          Try again
        </button>

        <button
          onClick={() => router.push("/")}
          className="
            px-6 py-3 rounded-full
            bg-gray-100 text-gray-700 font-medium
            hover:bg-gray-200
            transition
          "
        >
          Go home
        </button>
      </div>
    </div>
  );
}
