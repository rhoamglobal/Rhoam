"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, ChevronLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isValidEmail } from "@/lib/auth_utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = email && !emailError && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);

    // Deliberately not distinguishing "no account with this email" from
    // "email sent" in the UI — confirming/denying account existence here
    // is an account-enumeration leak, and the neutral message below is
    // the correct behavior regardless of whether the email exists.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6 relative overflow-hidden">
      <div className="absolute w-[700px] h-[700px] bg-[#ff5a5f]/10 blur-[120px] rounded-full top-[-250px] right-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-black/5 blur-[140px] rounded-full bottom-[-250px] left-[-200px]" />

      <Link
        href="/login"
        aria-label="Back to login"
        className="absolute top-6 left-6 h-10 w-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition z-10"
      >
        <ChevronLeft size={18} />
      </Link>

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

          {submitted ? (
            <div className="text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-[#ff5a5f]/10 flex items-center justify-center mb-5">
                <Mail size={24} className="text-[#ff5a5f]" strokeWidth={2.2} />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Check your inbox
              </h1>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                If an account exists for <strong>{email}</strong>, we've
                sent a link to reset your password. It'll expire after a
                short while, so use it soon.
              </p>

              <Link
                href="/login"
                className="mt-8 inline-block w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 text-center">
                Reset your password
              </h1>
              <p className="text-gray-500 mt-2 text-sm text-center">
                Enter the email on your account and we'll send you a link
                to set a new password.
              </p>

              <div className="mt-8">
                <label className="text-xs font-medium text-gray-500">
                  Email
                </label>
                <div className="relative mt-2 rounded-2xl">
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      setEmailError(
                        val && !isValidEmail(val)
                          ? "Invalid email format"
                          : ""
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">
                    {emailError}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="mt-8 w-full py-4 rounded-2xl bg-[#ff5a5f] text-white font-medium shadow-lg shadow-[#ff5a5f]/25 transition
                  disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#ff4d52] hover:scale-[1.01] active:scale-[0.99]
                  flex items-center justify-center gap-2"
              >
                {loading ? "Sending…" : "Send reset link"}
                {!loading && <ArrowRight size={16} />}
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered it?{" "}
                <Link href="/login" className="text-[#ff5a5f] font-semibold">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
