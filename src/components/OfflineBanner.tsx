"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Z_CLASS } from "@/lib/zIndex";

// Rendered once at the layout level so every screen (map, property,
// saved, profile — not just login/signup, which previously had the only
// connectivity feedback in the app) gets consistent offline messaging.
// Sits above ordinary map/nav chrome but below modals — losing
// connectivity mid-modal is already surfaced by that action's own error
// handling, so this banner doesn't need to outrank a modal to be useful.
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 w-full ${Z_CLASS.mapControls} flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-medium py-2 pt-[calc(env(safe-area-inset-top)+8px)]`}
    >
      <WifiOff size={13} />
      You&rsquo;re offline — some features won&rsquo;t work until you reconnect.
    </div>
  );
}
