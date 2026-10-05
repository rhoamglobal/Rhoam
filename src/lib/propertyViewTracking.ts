const KEY = "rhoam-property-view-count";

// Fires whenever the count changes, so InstallPrompt (mounted once in
// the root layout and never remounted during normal SPA navigation)
// can react in real time rather than only checking once on first load.
const EVENT_NAME = "rhoam:property-viewed";

export function recordPropertyView(): number {
  if (typeof window === "undefined") return 0;
  try {
    const next = Number(localStorage.getItem(KEY) || "0") + 1;
    localStorage.setItem(KEY, String(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    return next;
  } catch {
    // localStorage can throw in some privacy modes — the install
    // prompt simply won't trigger from view count in that case, not
    // worth failing the page over.
    return 0;
  }
}

export function getPropertyViewCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(KEY) || "0");
  } catch {
    return 0;
  }
}

export function onPropertyViewed(callback: (count: number) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<number>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
