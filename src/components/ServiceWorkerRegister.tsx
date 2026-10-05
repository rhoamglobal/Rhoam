"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-critical — the app works fine without the service worker,
      // it just loses offline/install capability. Not worth surfacing
      // to the user or retrying aggressively.
    });
  }, []);

  return null;
}
