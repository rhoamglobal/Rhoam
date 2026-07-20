"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuthErrorMessage } from "@/lib/getAuthErrorMessage";
import { isValidEmail } from "@/lib/auth_utils";
import { Mail, Lock, Eye, EyeOff, WifiOff, ArrowRight, ChevronLeft } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [shake, setShake] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

    router.push(
      redirect
        ? `/login?redirect=${encodeURIComponent(redirect)}`
        : "/login"
    );
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

      {/* subtle brand motif — mirrored from the login page for a
          consistent pair, same map-pin language as the launch poster */}
      <svg
        viewBox="0 0 300 300"
        className="absolute -top-10 -right-16 w-72 h-72 opacity-[0.04] pointer-events-none select-none"
      >
        <circle cx="150" cy="118" r="98" fill="#ff5a5f" />
        <polygon points="88,150 212,150 150,258" fill="#ff5a5f" />
      </svg>

      {/* back to map */}
      <Link
        href="/"
        aria-label="Back to map"
        className="absolute top-6 left-6 h-10 w-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition z-10"
      >
        <ChevronLeft size={18} />
      </Link>

      {!isOnline && (
        <div className="absolute top-5 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl">
          <WifiOff size={14} />
          You are offline
        </div>
      )}

      <div className="relative w-full max-w-md">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-3xl p-8 sm:p-10 transition ${
            shake ? "animate-shake" : ""
          }`}
        >

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col items-center mb-10"
          >
            <Image
              src="/logo-coral.png"
              alt="Rhoam"
              width={168}
              height={49}
              priority
              className="h-auto w-[168px]"
            />
            <p className="text-gray-500 mt-3 text-sm">
              Find your next home faster
            </p>
          </motion.div>

          {errorMsg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-5">

            <div>
              <label className="text-xs font-medium text-gray-500">
                Email
              </label>
              <div
                className={`relative mt-2 rounded-2xl transition-shadow ${
                  emailFocused ? "shadow-[0_0_0_4px_rgba(255,90,95,0.12)]" : ""
                }`}
              >
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border outline-none transition
                    ${emailError ? "border-red-300" : "border-gray-100 focus:border-[#ff5a5f]"}`}
                  value={email}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
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
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500">
                Password
              </label>
              <div
                className={`relative mt-2 rounded-2xl transition-shadow ${
                  passwordFocused ? "shadow-[0_0_0_4px_rgba(255,90,95,0.12)]" : ""
                }`}
              >
                <Lock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border outline-none transition
                    ${passwordError ? "border-red-300" : "border-gray-100 focus:border-[#ff5a5f]"}`}
                  value={password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">{passwordError}</p>
              )}
            </div>

          </div>

          <button
            onClick={handleSignup}
            disabled={!canSubmit}
            className="mt-8 w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-lg shadow-[#ff5a5f]/25 transition
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ff4d52] hover:scale-[1.01] active:scale-[0.99]
              flex items-center justify-center gap-2"
          >
            {loading ? "Creating account…" : "Continue"}
            {!loading && <ArrowRight size={16} />}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href={
                redirect
                  ? `/login?redirect=${encodeURIComponent(redirect)}`
                  : "/login"
              }
              className="text-[#ff5a5f] font-semibold"
            >
              Login
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
