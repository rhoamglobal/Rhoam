"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  redirect?: string | null;
  disabled?: boolean;
};

// Shared by both /login and /signup — OAuth doesn't distinguish between
// "sign up" and "sign in", Supabase creates the account on first use
// automatically, so one component covers both screens.
//
// Known v1 limitation, flagged rather than silently handled: if someone
// already has an email/password account and then signs in with OAuth
// under the same email, Supabase's default behavior depends on project
// auth settings (may create a second, separate account rather than
// linking to the existing one). Account-linking wasn't in scope for
// this pass — punting on it per the earlier open decision, but worth
// revisiting before this sees real signups at volume.
export default function OAuthButtons({ redirect, disabled }: Props) {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "apple" | null
  >(null);

  const signInWith = async (provider: "google" | "apple") => {
    if (loadingProvider) return;
    setLoadingProvider(provider);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirect) callbackUrl.searchParams.set("redirect", redirect);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });

    // Only reachable on failure to even *start* the OAuth redirect
    // (e.g. provider not enabled in Supabase project settings). On
    // success the browser navigates away before this line matters.
    if (error) {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signInWith("google")}
        disabled={disabled || !!loadingProvider}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon size={18} />
        {loadingProvider === "google" ? "Redirecting…" : "Continue with Google"}
      </button>

      <button
        type="button"
        onClick={() => signInWith("apple")}
        disabled={disabled || !!loadingProvider}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-black text-white font-medium hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <AppleIcon size={18} />
        {loadingProvider === "apple" ? "Redirecting…" : "Continue with Apple"}
      </button>

      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or use email</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
    </div>
  );
}

// Brand marks: lucide-react doesn't ship trademarked logos, so these are
// small inline SVGs, same approach used for Instagram/X on the profile
// page. Google's is multi-color per their brand guidelines; Apple's is
// a single-color glyph on a black button per Apple's HIG.
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.365 1.43c0 1.14-.462 2.11-1.03 2.83-.62.79-1.63 1.4-2.63 1.32-.13-1.12.46-2.15 1.02-2.83.63-.79 1.68-1.36 2.64-1.32zM20.77 17.24c-.4.93-.6 1.34-1.11 2.16-.72 1.15-1.73 2.58-2.99 2.6-1.11.02-1.4-.73-2.9-.72-1.5.01-1.82.73-2.93.71-1.26-.02-2.22-1.3-2.94-2.45-2.02-3.2-2.23-6.95-.98-8.95.88-1.42 2.28-2.25 3.6-2.25 1.34 0 2.19.74 3.3.74 1.08 0 1.74-.74 3.29-.74 1.17 0 2.42.64 3.31 1.75-2.91 1.6-2.44 5.75.35 7.15z" />
    </svg>
  );
}
