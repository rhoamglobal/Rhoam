"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-[#ff5a5f] mb-8">
          Welcome Back
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 border rounded-2xl mb-4 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 border rounded-2xl mb-6 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#ff5a5f] hover:opacity-90 transition text-white py-4 rounded-2xl font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}