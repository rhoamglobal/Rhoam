"use client";

import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">
        Payment Successful 🎉
      </h1>

      <p className="text-gray-600 mb-6">
        Your contact unlock is being processed.
      </p>

      <button
        onClick={() => router.push("/")}
        className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full"
      >
        Go Home
      </button>
    </div>
  );
}