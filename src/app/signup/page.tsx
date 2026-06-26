"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuthErrorMessage } from "@/lib/getAuthErrorMessage";
import { isValidEmail } from "@/lib/auth_utils";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const handleSignup = async () => {
    if (!isOnline) {
      setErrorMsg("You are offline. Please reconnect.");
      return;
    }
  
    setLoading(true);
    setErrorMsg("");
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      setLoading(false);
  
      setErrorMsg(getAuthErrorMessage(error));
      setShake(true);
      setTimeout(() => setShake(false), 400);
  
      return;
    }
  
    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          email,
        });
  
      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
      }
    }
  
    setLoading(false);
  
    router.push("/login");
  };
  const canSubmit =
    email &&
    password &&
    !emailError &&
    !passwordError &&
    isOnline &&
    !loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 relative overflow-hidden">

      <div className="absolute w-[700px] h-[700px] bg-[#ff5a5f]/10 blur-[120px] rounded-full top-[-250px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-black/5 blur-[140px] rounded-full bottom-[-250px] right-[-200px]" />

      {!isOnline && (
        <div className="absolute top-5 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl">
          You are offline
        </div>
      )}

      <div className="relative w-full max-w-md">

        <div
          className={`bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-3xl p-8 ${
            shake ? "animate-shake" : ""
          }`}
        >

          <div className="text-center mb-10">
            <h1 className="text-4xl font-semibold text-[#ff5a5f]">
              Rhoam
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Find your next home faster
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-5">

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                className={`mt-2 w-full px-5 py-4 rounded-2xl bg-gray-50 border outline-none transition
                  ${emailError ? "border-red-300" : "border-gray-100 focus:border-[#ff5a5f]"}`}
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);

                  if (val && !isValidEmail(val)) {
                    setEmailError("Invalid email format");
                  } else {
                    setEmailError("");
                  }
                }}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500">Password</label>
              <input
                type="password"
                className={`mt-2 w-full px-5 py-4 rounded-2xl bg-gray-50 border outline-none transition
                  ${passwordError ? "border-red-300" : "border-gray-100 focus:border-[#ff5a5f]"}`}
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);

                  if (val && val.length < 6) {
                    setPasswordError("Min 6 characters");
                  } else {
                    setPasswordError("");
                  }
                }}
              />
              {passwordError && (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

          </div>

          <button
            onClick={handleSignup}
            disabled={!canSubmit}
            className="mt-8 w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-md shadow-[#ff5a5f]/20 transition
              disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? "Creating account..." : "Continue"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ff5a5f] font-medium">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
