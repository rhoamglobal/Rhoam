"use client";

import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Phone,
  Mail,

} from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PostUnlockFeedbackBanner from "@/components/PostUnlockFeedbackBanner";

const CONTACT_EMAIL = "rhoam.global@gmail.com";

// lucide-react doesn't ship brand/logo icons (Instagram, X, etc. are
// trademarked marks, not generic glyphs), so these are small inline SVGs
// instead of a generic Mail icon standing in for both — that was the bug
// this fixes (RHM-105).
function InstagramIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function XIcon({ size = 15, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.5L4.6 22H1.5l8.2-9.3L1 2h7.1l4.9 5.9L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z" />
    </svg>
  );
}

// TODO(dev): replace with the real, live handles before shipping — these
// are the actual account URLs, not the generic homepage links the old
// code pointed at.
const INSTAGRAM_URL = "https://instagram.com/rhoam_global";
const X_URL = "https://x.com/rhoam_global";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [savedCount, setSavedCount] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      // saved count
      const { count: saved } = await supabase
        .from("saved_properties")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      // unlocked count
      const { count: unlocked } = await supabase
        .from("contact_unlocks")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      setSavedCount(saved || 0);
      setUnlockCount(unlocked || 0);
    };

    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="h-screen flex items-center justify-center">
          Loading...
        </div>
      </ProtectedRoute>
    );
  }

  const displayName = user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-28 px-5">
      {/* HERO */}
      <div className="bg-[#ff5a5f] px-6 pt-16 pb-10 rounded-b-[40px] text-white shadow-xl shadow-[#ff5a5f]/20">
        <div className="flex items-center gap-4">
          <div
            className="
              w-20 h-20 rounded-full
              bg-white text-[#ff5a5f]
              flex items-center justify-center
              text-3xl font-bold
              shadow-lg
              ring-4 ring-white/25
            "
          >
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-white/80 text-sm">Welcome back</p>

            <h1 className="text-3xl font-bold tracking-tight">
              {displayName}
            </h1>

            <p className="text-white/90 mt-1 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <PostUnlockFeedbackBanner />

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 -mt-2 pt-8">
        <button
          onClick={() => router.push("/saved")}
          className="
            bg-white rounded-3xl p-5 text-left
            shadow-sm border border-gray-100
            hover:shadow-md hover:-translate-y-0.5
            transition-all duration-200
          "
        >
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Heart size={14} className="text-[#ff5a5f]" />
            Saved Homes
          </div>

          <h2 className="text-4xl font-bold text-[#ff5a5f]">
            {savedCount}
          </h2>
        </button>

        <button
          onClick={() => router.push("/profile/unlocked")}
          className="
            bg-white rounded-3xl p-5 text-left
            shadow-sm border border-gray-100
            hover:shadow-md hover:-translate-y-0.5
            transition-all duration-200
          "
        >
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Phone size={14} className="text-[#ff5a5f]" />
            Unlocked Contacts
          </div>

          <h2 className="text-4xl font-bold text-[#ff5a5f]">
            {unlockCount}
          </h2>
        </button>
      </div>

      {/* COMPANY CONTACT */}
      <div className="mt-8 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">Contact Rhoam</h2>

        <div className="space-y-1">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="
              flex items-center gap-3 text-gray-700
              -mx-2 px-2 py-2.5 rounded-xl
              hover:bg-gray-50
              transition
            "
          >
            <span className="h-8 w-8 rounded-full bg-[#ff5a5f]/8 flex items-center justify-center shrink-0">
              <Mail className="text-[#ff5a5f]" size={15} />
            </span>
            {CONTACT_EMAIL}
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-3 text-gray-700
              -mx-2 px-2 py-2.5 rounded-xl
              hover:bg-gray-50
              transition
            "
          >
            <span className="h-8 w-8 rounded-full bg-[#ff5a5f]/8 flex items-center justify-center shrink-0">
              <InstagramIcon size={15} className="text-[#ff5a5f]" />
            </span>
            Instagram
          </a>

          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-3 text-gray-700
              -mx-2 px-2 py-2.5 rounded-xl
              hover:bg-gray-50
              transition
            "
          >
            <span className="h-8 w-8 rounded-full bg-[#ff5a5f]/8 flex items-center justify-center shrink-0">
              <XIcon size={15} className="text-[#ff5a5f]" />
            </span>
            X (Twitter)
          </a>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="
            w-full bg-white rounded-3xl p-5
            shadow-sm border border-gray-100
            flex items-center justify-center gap-3
            text-red-500 font-semibold
            hover:bg-red-50/50
            transition
          "
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="text-center text-gray-400 text-sm mt-6">
        Rhoam v1.0
      </div>
    </div>
  );
}
