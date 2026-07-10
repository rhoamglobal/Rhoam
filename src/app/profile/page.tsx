"use client";

import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Phone,
  Mail,
  
} from "lucide-react";
import {
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";
import { useState, useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const CONTACT_EMAIL = "rhoam.global@gmail.com";

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
            href="https://instagram.com"
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
              <FaInstagram className="text-[#ff5a5f]" size={15} />
            </span>
            Instagram
          </a>

          <a
            href="https://x.com/rhoam_global"
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
              <FaXTwitter className="text-[#ff5a5f]" size={15} />
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
