"use client";

import { useRouter } from "next/navigation";
import { Heart, LogOut, Home } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { isSaved } from "@/lib/saved";
// protected routes
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const savedCount = isSaved().length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">
                Welcome 👋
              </h1>

              <p className="text-white/90">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Saved Properties */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#ff5a5f]/10 p-3 rounded-2xl">
                  <Heart className="text-[#ff5a5f]" />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Saved Properties
                  </h2>

                  <p className="text-sm text-gray-500">
                    {savedCount} saved homes
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/saved")}
                className="text-[#ff5a5f] font-semibold"
              >
                View
              </button>
            </div>
          </div>

          {/* Become landlord */}
          <div className="bg-gradient-to-br from-[#ff5a5f] to-[#ff7b7f]
            rounded-3xl p-6 text-white shadow-xl">

            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Home />
              </div>

              <h2 className="text-xl font-bold">
                Become a Landlord
              </h2>
            </div>

            <p className="text-white/90 mb-5">
              List your hostel, apartment or lodge on Rhoam and reach students faster.
            </p>

            <button
              className="bg-white text-[#ff5a5f] px-5 py-3 rounded-2xl
              font-semibold shadow-md"
            >
              Start Listing
            </button>
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