import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center mb-6">
        <MapPinOff className="text-[#FF6B6B]" size={28} />
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">
        Page not found
      </h1>

      <p className="mt-2 text-gray-500 max-w-sm">
        This page doesn't exist, or the listing may have been taken down.
      </p>

      <Link
        href="/"
        className="
          mt-8 px-6 py-3 rounded-full
          bg-[#FF6B6B] text-white font-medium
          shadow-lg shadow-[#FF6B6B]/25
          hover:bg-[#ff5252]
          transition
        "
      >
        Back to the map
      </Link>
    </div>
  );
}
