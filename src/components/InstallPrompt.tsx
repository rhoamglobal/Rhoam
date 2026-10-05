"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Share } from "lucide-react";
import { Z_CLASS } from "@/lib/zIndex";
import { getPropertyViewCount, onPropertyViewed } from "@/lib/propertyViewTracking";

const DISMISSED_KEY = "rhoam-install-prompt-dismissed";
// "After they've browsed a few properties" — not on landing.
const VIEW_THRESHOLD = 3;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as "MacIntel" in desktop mode — the touch-points
  // check is the standard workaround for telling it apart from an
  // actual Mac.
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [isIos, setIsIos] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [dismissed, setDismissed] = useState(true); // safe default until checked
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // already installed — nothing to do

    try {
      // Safe pattern, same reasoning as the other documented exceptions
      // in this codebase: this result doesn't feed back into any of
      // this effect's own dependencies (there are none — empty array),
      // so it can't cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(localStorage.getItem(DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }

    setIsIos(isIosDevice());
    setViewCount(getPropertyViewCount());

    const unsubscribe = onPropertyViewed((count) => setViewCount(count));

    // Android/Chrome: capture the browser's native prompt instead of
    // letting it fire automatically — we show our own branded banner
    // first and trigger the real prompt from that, once someone's
    // actually browsed a bit rather than the instant they land.
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setShowIosSteps(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Non-critical if this doesn't persist — worst case the banner
      // reappears next session.
    }
  };

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  const canShow =
    !dismissed && viewCount >= VIEW_THRESHOLD && (isIos || deferredPrompt !== null);

  if (!canShow) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 ${Z_CLASS.modalPanel} max-w-md mx-auto`}
    >
      <div className="bg-[#ff5a5f] rounded-3xl shadow-[0_12px_40px_rgba(255,90,95,0.35)] p-5 text-white">
        {!showIosSteps ? (
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 bg-white/10">
              <Image src="/icon-192.png" alt="" width={48} height={48} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base">Take RHOAM with you</h3>
              <p className="text-sm text-white/90 mt-0.5 leading-snug">
                Install the RHOAM app for faster access to homes, shortlets
                and hotels.
              </p>
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 rounded-full bg-white text-[#ff5a5f] text-sm font-semibold hover:bg-white/90 transition"
                >
                  Install RHOAM
                </button>
                <button
                  onClick={dismiss}
                  className="text-sm font-medium text-white/80 hover:text-white transition"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          // iOS has no programmatic install — walk through the manual
          // Share -> Add to Home Screen steps instead.
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base">Add RHOAM to your Home Screen</h3>
              <p className="text-sm text-white/90 mt-1 leading-snug flex items-center gap-1.5 flex-wrap">
                Tap <Share size={14} className="inline" /> in Safari&apos;s toolbar,
                then choose <span className="font-semibold">Add to Home Screen</span>.
              </p>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 h-7 w-7 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
