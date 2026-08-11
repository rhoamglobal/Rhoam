"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { Z_CLASS } from "@/lib/zIndex";

const STORAGE_KEY = "rhoam_value_prop_dismissed";

// Most first-time users tap "Skip" on onboarding out of habit, meaning
// the pitch never gets read there. This puts a one-line version of it
// where people actually land — dismissible and persisted so it doesn't
// nag every session once seen.
export default function ValuePropBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage can throw in some privacy modes — fail silently,
      // just don't show the banner rather than crash the map.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Same as above — non-critical if this doesn't persist.
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`absolute top-[150px] left-4 right-4 ${Z_CLASS.categoryBar} flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gray-900/90 backdrop-blur-md text-white shadow-lg`}
    >
      <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
      <p className="text-xs font-medium flex-1">
        Verified student housing — no scams, no middlemen.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition"
      >
        <X size={13} />
      </button>
    </div>
  );
}
