// Centralizes the "spring entrance vs. respect reduced-motion" choice
// that would otherwise need repeating inside every modal that uses
// Framer Motion. When reduced motion is requested, panels still fade in/
// out (so state changes aren't jarring or invisible) but skip the
// y-translate + scale + spring bounce that's the actual motion-sickness
// trigger for vestibular-sensitive users.
export function getModalPanelMotion(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12 },
    };
  }

  return {
    initial: { opacity: 0, y: 40, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 340, damping: 30 },
  };
}

// Same idea for the centered (non-bottom-sheet) SmartFilters card, which
// uses a slightly different travel distance than the bottom-sheet modals.
export function getCenteredModalMotion(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.12 },
    };
  }

  return {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 380, damping: 32 },
  };
}
