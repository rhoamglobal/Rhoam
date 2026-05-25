"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
      <div className="w-full max-w-md bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold text-center text-[#ff5a5f] mb-6">
          Welcome Back
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 border rounded-xl mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 border rounded-xl mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-[#ff5a5f] text-white py-4 rounded-xl font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}