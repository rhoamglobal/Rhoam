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

  const displayName =
    user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-[#f8f8f8] pb-28 px-5">

      {/* HERO */}
      <div className="bg-[#ff5a5f] px-6 pt-16 pb-10 rounded-b-[40px] text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white text-[#ff5a5f]
            flex items-center justify-center text-3xl font-bold shadow-lg">
            {user.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-white/80 text-sm">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold">
              {displayName}
            </h1>

            <p className="text-white/90 mt-1">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">
            Saved Homes
          </p>

          <h2 className="text-4xl font-bold text-[#ff5a5f]">
            {savedCount}
          </h2>
        </div>

        <div
          onClick={() => router.push("/profile/unlocked")}
          className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 cursor-pointer"
        >
          <p className="text-gray-500 text-sm mb-2">
            Unlocked Contacts
          </p>

          <h2 className="text-4xl font-bold text-[#ff5a5f]">
            {unlockCount}
          </h2>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-8 space-y-4">

        <button
          onClick={() => router.push("/saved")}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Heart className="text-[#ff5a5f]" size={20} />
            <span className="font-medium text-gray-900">
              Saved Properties
            </span>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>

        <button
          onClick={() => router.push("/profile/unlocked")}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Phone className="text-[#ff5a5f]" size={20} />
            <span className="font-medium text-gray-900">
              My Unlocks
            </span>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>
      </div>

      {/* COMPANY CONTACT */}
      <div className="mt-8 bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">
          Contact Rhoam
        </h2>

        <div className="space-y-4">

          <a
            href="mailto:support@rhoam.com"
            className="flex items-center gap-3 text-gray-700"
          >
            <Mail className="text-[#ff5a5f]" size={18} />
            rhoam.global@gmail.com
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            className="flex items-center gap-3 text-gray-700"
          >
            
            Instagram
          </a>

          <a
            href="https://x.com/rhoam_global"
            target="_blank"
            className="flex items-center gap-3 text-gray-700"
          >
            X (Twitter)
          </a>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-center gap-3 text-red-500 font-semibold"
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