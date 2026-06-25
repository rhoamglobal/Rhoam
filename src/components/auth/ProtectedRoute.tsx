"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/onboarding");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="flex flex-col items-center">
          
          {/* Coral pulse */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-[#ff7f50]/20 animate-ping" />
  
            <div
              className="
                w-16 h-16 rounded-2xl
                bg-[#ff5a5f]
                flex items-center justify-center
                shadow-lg
              "
            >
              
            </div>
          </div>
  
          {/* Brand */}
          <h2 className="mt-5 text-2xl font-bold text-gray-900">
            Rhoam
          </h2>
  
          {/* Loading dots */}
          <div className="flex gap-2 mt-3">
            <span className="w-2 h-2 bg-[#ff5a5f] rounded-full animate-bounce" />
            <span
              className="w-2 h-2 bg-[#ff5a5f] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-2 h-2 bg-[#ff5a5f] rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
  
          <p className="mt-4 text-gray-500 text-sm">
            please wait....
          </p>
        </div>
      </div>
    );

  }

  return <>{children}</>;
}