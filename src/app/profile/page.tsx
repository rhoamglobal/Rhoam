"use client";

import { useRouter } from "next/navigation";
import { Heart, LogOut, Home } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

// protected routes
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  



  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => {
    const fetchSavedCount = async () => {
      if (!user) return;
  
      const { count } = await supabase
        .from("saved_properties")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);
  
      setSavedCount(count || 0);
    };
  
    fetchSavedCount();
  }, [user]);

  
  

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }
  const displayName =
  user.email?.split("@")[0] || "User";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] pb-28">
        {/* Header */}
        <div className="bg-[#ff5a5f] px-6 pt-16 pb-10 rounded-b-[40px] text-white shadow-xl">
          <div className="flex items-center gap-4">
            {/* Avatar */}
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
        {/* stats section */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Saved */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Saved Homes</p>
              <h2 className="text-3xl font-bold text-[#ff5a5f]">
                {savedCount}
              </h2>
            </div>

            {/* Viewed */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Properties Viewed</p>
              <h2 className="text-3xl font-bold text-[#ff5a5f]">
                {savedCount}
              </h2>
            </div>
          </div>
        </div>

        


        {/* Quick Actions */}
        <div className=" space-y-5">
          {/* Saved Properties */}
          <button
            onClick={() => router.push("/saved")}
            className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium">
              ❤️ Saved Properties
            </span>

            <span className="text-[#ff5a5f]">
              →
            </span>
          </button>

          <button
            className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium">
              ⚙️ Account Settings
            </span>

            <span className="text-[#ff5a5f]">
              →
            </span>
          </button>

          <button
            className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <span className="font-medium">
              ❓ Help & Support
            </span>

            <span className="text-[#ff5a5f]">
              →
            </span>
          </button>

          {/* Become landlord */}
          <div className="bg-gradient-to-br from-[#ff5a5f] to-[#ff7b7f]
            rounded-3xl p-6 text-white shadow-xl">

            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Home />
              </div>

              <h2 className="text-xl font-bold">
                Earn With Rhoam
              </h2>
            </div>

            <p className="text-white/90 mb-5">
            List your property on Rhoam and connect directly with students searching for accommodation.
            </p>

            <button
              className="bg-white text-[#ff5a5f] px-5 py-3 rounded-2xl
              font-semibold shadow-md"
            >
              Start Listing
            </button>
          </div>

          <div className="text-center text-gray-400 text-sm py-2">
            Rhoam v1.0
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-white rounded-3xl p-5 shadow-sm border
            border-gray-100 flex items-center justify-center gap-3
            text-red-500 font-semibold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}