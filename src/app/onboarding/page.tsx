"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Carry the "return to this page after auth" target through to
  // signup/login, so unlocking a contact while logged out doesn't strand
  // the person back at the homepage after they sign in.
  const query = redirect
    ? `?redirect=${encodeURIComponent(redirect)}`
    : "";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">


      {/* main card */}
      <div >

        {/* top accent line */}
        <div className="w-16 h-1 bg-[#ff5a5f] rounded-full mb-10" />

        {/* illustration */}
        <div className="flex justify-center mb-8
        object-contain dark:brightness-110 ">
        <Image
          src="/onboarding-house.png"
          alt="Rhoam onboarding"
          width={280}
          height={280}
          className="object-contain"
        />
        </div>

        {/* text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            Welcome to <span className="text-[#ff5a5f]">Rhoam</span>
          </h1>

          <p className="mt-4 text-gray-500 text-base leading-relaxed">
            Easily discover hostels, apartments, and student stays around you.
          </p>
        </div>

        {/* CTA */}
        <Link href={`/signup${query}`}>
          <button className="w-full mt-10 py-4 rounded-full bg-[#ff5a5f] text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition">
            Get Started
          </button>
        </Link>

        {/* skip */}
        <button
          onClick={() => router.push(redirect || "/")}
          className="w-full mt-5 text-gray-400 font-medium"
        >
          Skip
        </button>

        {/* login */}
        <div className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={`/login${query}`}
            className="text-[#ff5a5f] font-semibold"
          >
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
