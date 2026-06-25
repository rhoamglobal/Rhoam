"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/unlock/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      }

      setLoading(false);
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6">
      {loading ? (
        <>
          <h1 className="text-2xl font-bold mb-3">
            Verifying payment...
          </h1>
          <p className="text-gray-500">
            Please wait while we unlock your contact.
          </p>
        </>
      ) : success ? (
        <>
          <h1 className="text-3xl font-bold mb-4">
            Contact Unlocked 🎉
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment has been confirmed successfully.
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full"
          >
            Go Back Home
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">
            Verification Failed
          </h1>

          <p className="text-gray-600 mb-6">
            We could not verify your payment.
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-[#FF6B6B] text-white px-6 py-3 rounded-full"
          >
            Go Back Home
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}