"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 relative overflow-hidden">

      {/* ambient coral glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#ff5a5f]/15 blur-[120px] rounded-full top-[-120px] right-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-[#ff5a5f]/10 blur-[100px] rounded-full bottom-[-120px] left-[-120px]" />

      {/* main card */}
      <div className="relative z-10 w-full max-w-md bg-white border border-gray-100 rounded-[38px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] px-8 py-10">

        {/* top accent line */}
        <div className="w-16 h-1 bg-[#ff5a5f] rounded-full mb-10" />

        {/* illustration */}
        <div className="flex justify-center mb-8">
          <Image
            src="/onboarding-house.png"
            alt="Rhoam onboarding"
            width={220}
            height={220}
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
        <Link href="/signup">
          <button className="w-full mt-10 py-4 rounded-full bg-[#ff5a5f] text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition">
            Get Started
          </button>
        </Link>

        {/* skip */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-5 text-gray-400 font-medium"
        >
          Skip
        </button>

        {/* login */}
        <div className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#ff5a5f] font-semibold"
          >
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}