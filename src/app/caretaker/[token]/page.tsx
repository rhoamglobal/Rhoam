"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type PropertyInfo = {
  id: string;
  title: string;
  is_available: boolean;
  last_confirmed_at: string | null;
};

export default function CaretakerStatusPage() {
  const params = useParams();
  const token = params?.token as string;

  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">(
    "loading"
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<null | "available" | "taken">(
    null
  );

  useEffect(() => {
    if (!token) return;

    fetch(`/api/caretaker/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        setProperty(data.property);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, [token]);

  const submit = async (isAvailable: boolean) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/caretaker/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });

      if (!res.ok) throw new Error("failed");

      setConfirmed(isAvailable ? "available" : "taken");
    } catch {
      setLoadState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg p-7 text-center">
        {loadState === "loading" && (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="animate-spin text-gray-300" size={28} />
          </div>
        )}

        {loadState === "error" && (
          <div className="py-6">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <XCircle size={22} className="text-red-400" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Link not found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              This link may have expired or been used incorrectly. Contact
              Rhoam if you think this is a mistake.
            </p>
          </div>
        )}

        {loadState === "ready" && property && !confirmed && (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Rhoam listing status
            </p>
            <h1 className="mt-1.5 text-lg font-semibold text-gray-900">
              {property.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Is this unit currently available to rent?
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => submit(true)}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-semibold disabled:opacity-50 hover:bg-emerald-600 transition"
              >
                Yes, still available
              </button>
              <button
                onClick={() => submit(false)}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-semibold disabled:opacity-50 hover:bg-gray-200 transition"
              >
                No, already taken
              </button>
            </div>

            <p className="mt-5 text-xs text-gray-400">
              You can bookmark this page to update it any time — no login
              needed.
            </p>
          </>
        )}

        {confirmed && (
          <div className="py-4">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={26} className="text-emerald-500" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Thanks — updated
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {confirmed === "available"
                ? "This listing now shows as available on Rhoam."
                : "This listing now shows as taken on Rhoam."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
