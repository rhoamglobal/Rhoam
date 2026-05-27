"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function AuthButton() {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    setLoading(false);
  };

  return (
    <button
      onClick={login}
      className="px-4 py-2 rounded-full bg-[#FF6B6B] text-white"
    >
      {loading ? "Loading..." : "Login"}
    </button>
  );
}