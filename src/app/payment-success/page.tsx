"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentStatus loading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference = searchParams.get("reference");

  // reference format: unlock_propertyId_userId_timestamp
  const propertyId = reference ? reference.split("_")[1] : null;
  const destination = propertyId
    ? `/property/${propertyId}`
    : "/profile/unlocked";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      } else {
        setErrorMessage(data.message || "Unknown error");
      }

      setLoading(false);
    };

    verifyPayment();
  }, [reference]);

  // Auto-advance back to the property they just unlocked, so the person
  // doesn't have to tap through to call/WhatsApp the landlord.
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      router.push(destination);
    }, 1800);

    return () => clearTimeout(timer);
  }, [success, router, destination]);

  return (
    <PaymentStatus
      loading={loading}
      success={success}
      errorMessage={errorMessage}
      onViewUnlocked={() => router.push(destination)}
      onHome={() => router.push("/")}
    />
  );
}

function PaymentStatus({
  loading,
  success = false,
  errorMessage,
  onViewUnlocked,
  onHome,
}: {
  loading: boolean;
  success?: boolean;
  errorMessage?: string | null;
  onViewUnlocked?: () => void;
  onHome?: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {loading ? (
        <>
          <h1 className="mb-3 text-2xl font-bold">
            Verifying payment...
          </h1>
          <p className="text-gray-500">
            Please wait while we unlock your contact.
          </p>
        </>
      ) : success ? (
        <>
          <h1 className="mb-4 text-3xl font-bold">
            Contact Unlocked
          </h1>

          <p className="mb-6 text-gray-600">
            Your payment has been confirmed successfully.
          </p>

          <button
            onClick={onViewUnlocked}
            className="rounded-full bg-[#FF6B6B] px-6 py-3 text-white"
          >
            Back to Property
          </button>

          <p className="mt-4 text-xs text-gray-400">
            Taking you there automatically…
          </p>
        </>
      ) : (
        <>
          <h1 className="mb-4 text-3xl font-bold">
            Verification Failed
          </h1>

          <p className="mb-6 text-gray-600">
            We could not verify your payment
            {errorMessage ? `: ${errorMessage}` : "."}
          </p>

          <button
            onClick={onHome}
            className="rounded-full bg-[#FF6B6B] px-6 py-3 text-white"
          >
            Go Back Home
          </button>
        </>
      )}
    </div>
  );
}
