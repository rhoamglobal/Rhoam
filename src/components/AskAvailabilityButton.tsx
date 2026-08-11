"use client";

import { useState } from "react";
import { HelpCircle, Loader2 } from "lucide-react";

type Props = {
  propertyId: string;
};

// Only ever rendered when AvailabilityBadge's tier is "unclear" — a
// recently-confirmed listing has no reason to ping a caretaker who just
// answered this. See PropertyClient's usage for that gating.
export default function AskAvailabilityButton({ propertyId }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    if (state === "loading" || state === "sent") return;
    setState("loading");

    try {
      const res = await fetch("/api/availability-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Couldn't send that right now.");
        setState("error");
        return;
      }

      setMessage(
        data.alreadyPinged
          ? "Already asked recently — waiting on a response."
          : "Asked! We'll update this listing as soon as they respond."
      );
      setState("sent");
    } catch {
      setMessage("Couldn't reach our servers. Please try again.");
      setState("error");
    }
  };

  if (state === "sent" || state === "error") {
    return (
      <p
        className={`text-xs text-right ${
          state === "error" ? "text-red-500" : "text-gray-500"
        }`}
      >
        {message}
      </p>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="flex items-center gap-1.5 text-xs font-medium text-[#ff5a5f] hover:text-[#f24d52] transition disabled:opacity-60"
    >
      {state === "loading" ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <HelpCircle size={13} />
      )}
      {state === "loading" ? "Asking…" : "Ask if it's still available"}
    </button>
  );
}
