"use client";

import { useEffect, useState } from "react";

// Previously nothing in the app checked this — every spring/bounce/shake
// animation played at full strength regardless of the person's OS-level
// motion setting. Vestibular-sensitive users who've explicitly told
// their device "reduce motion" were getting it anyway.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
