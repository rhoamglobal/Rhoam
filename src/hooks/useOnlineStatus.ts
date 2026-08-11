"use client";

import { useEffect, useState } from "react";

// Previously this exact online/offline listener pattern was duplicated
// locally inside login and signup only — meaning the map, property,
// saved, and profile screens gave zero connectivity feedback. Lifted
// here so one hook backs both the global banner (RHM-122) and any
// screen-specific logic that still wants direct access to the flag
// (e.g. login/signup blocking submission while offline).
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
