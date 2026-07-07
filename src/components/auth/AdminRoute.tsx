"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      // Wait for auth provider
      if (authLoading) return;

      // Not logged in
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", user.id)
          .single();


          console.log("SUPABASE ERROR", error);


        if (error || !data) {
          setAllowed(false);
        } else {
          setAllowed(true);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        setAllowed(false);
      }

      setLoading(false);
    };

    checkAdmin();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking permissions...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Access Denied
        </h1>

        <p className="text-gray-500">
          You are not an administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}