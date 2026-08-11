"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import { getPasswordError } from "@/lib/auth_utils";

// Supabase's password-recovery flow lands here with a temporary session
// established via the emailed link (createBrowserClient/@supabase/ssr
// handles exchanging the URL fragment into a session automatically). We
// listen for the PASSWORD_RECOVERY auth event to distinguish "got here
// via a valid reset link" from "someone just navigated to this URL
// directly with no token" — the second case must not let anyone set a
// password with no verification at all.
function ResetPasswordForm() {
  const router = useRouter();

  const [tokenStatus, setTokenStatus] = useState<
    "checking" | "valid" | "invalid"
  >("checking");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setTokenStatus("valid");
      }
    });

    // Fallback: if we already have a session by the time this mounts
    // (event fired before the listener attached), treat that as valid
    // too, rather than getting stuck on "checking" forever.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setTokenStatus((prev) => (prev === "checking" ? "valid" : prev));
    });

    const timeout = setTimeout(() => {
      setTokenStatus((prev) => (prev === "checking" ? "invalid" : prev));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const canSubmit =
    password &&
    confirmPassword &&
    !passwordError &&
    !loading &&
    tokenStatus === "valid";

  const validate = (pwd: string, confirm: string) => {
    const lengthError = getPasswordError(pwd);
    if (lengthError) return lengthError;
    if (confirm && pwd !== confirm) return "Passwords don't match";
    return "";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Couldn't update your password. Try again.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 relative overflow-hidden">
      <div className="absolute w-[700px] h-[700px] bg-[#ff5a5f]/10 blur-[120px] rounded-full top-[-250px] right-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-black/5 blur-[140px] rounded-full bottom-[-250px] left-[-200px]" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-3xl p-8 sm:p-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex flex-col items-center mb-8"
          >
            <Image
              src="/logo-coral.png"
              alt="Rhoam"
              width={168}
              height={49}
              priority
              className="h-auto w-[168px]"
            />
          </motion.div>

          {tokenStatus === "checking" && (
            <div className="text-center text-gray-500 text-sm py-6">
              Verifying your reset link…
            </div>
          )}

          {tokenStatus === "invalid" && (
            <div className="text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                This link has expired
              </h1>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Reset links are only valid for a short time, or may have
                already been used. Request a new one to continue.
              </p>
              <Link
                href="/forgot-password"
                className="mt-8 inline-block w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-lg shadow-[#ff5a5f]/25 transition hover:bg-[#ff4d52]"
              >
                Request a new link
              </Link>
            </div>
          )}

          {tokenStatus === "valid" && done && (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Password updated
              </h1>
              <p className="mt-2 text-gray-500 text-sm">
                Taking you to login…
              </p>
            </div>
          )}

          {tokenStatus === "valid" && !done && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Set a new password
              </h1>
              <p className="text-gray-500 mt-2 text-sm text-center">
                Choose a new password for your account.
              </p>

              {errorMsg && (
                <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    New password
                  </label>
                  <div className="relative mt-2 rounded-2xl">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none transition focus:border-[#ff5a5f]"
                      value={password}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassword(val);
                        setPasswordError(validate(val, confirmPassword));
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
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Confirm new password
                  </label>
                  <div className="relative mt-2 rounded-2xl">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border outline-none transition
                        ${passwordError ? "border-red-300" : "border-gray-100 focus:border-[#ff5a5f]"}`}
                      value={confirmPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConfirmPassword(val);
                        setPasswordError(validate(password, val));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit();
                      }}
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {passwordError}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="mt-8 w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-lg shadow-[#ff5a5f]/25 transition
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ff4d52] hover:scale-[1.01] active:scale-[0.99]
                  flex items-center justify-center gap-2"
              >
                {loading ? "Updating…" : "Update password"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
