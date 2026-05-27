"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 relative overflow-hidden">

      {/* ambient background */}
      <div className="absolute w-[700px] h-[700px] bg-[#ff5a5f]/10 blur-[120px] rounded-full top-[-250px] right-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-black/5 blur-[140px] rounded-full bottom-[-250px] left-[-200px]" />

      {/* auth card */}
      <div className="relative w-full max-w-md">

        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-3xl p-8">

          {/* brand */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold text-[#ff5a5f] tracking-tight">
              Rhoam
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              Welcome back to your home search
            </p>
          </div>

          {/* inputs */}
          <div className="space-y-5">

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff5a5f] outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-[#ff5a5f] outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

          </div>

          {/* button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-md shadow-[#ff5a5f]/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>

          {/* footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-[#ff5a5f] font-medium">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}