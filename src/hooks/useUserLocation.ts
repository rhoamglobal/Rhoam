"use client";

import { useEffect, useState } from "react";

export type UserLocation = {
  lat: number;
  lng: number;
  accuracy: number;
} | null;

export type LocationStatus =
  | "idle"
  | "prompt"
  | "granted"
  | "denied"
  | "unavailable";

// One-shot geolocation fix (not watchPosition — a housing search doesn't
// need live tracking, and continuous watching drains battery on mobile
// for no real benefit here). Resolves once on mount; if the user wants a
// fresher fix later (e.g. after moving), that's a deliberate future
// "locate me" button re-triggering this, not automatic tracking.
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(null);
  // Lazy initializer instead of a synchronous setStatus() call at the
  // top of the effect below — keeps every setState call confined to an
  // actual async callback from the geolocation API itself.
  const [status, setStatus] = useState<LocationStatus>(() =>
    typeof navigator !== "undefined" && "geolocation" in navigator
      ? "prompt"
      : "unavailable"
  );

  useEffect(() => {
    if (status !== "prompt") return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("granted");
      },
      () => {
        setLocation(null);
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [status]);

  return { location, status };
}
