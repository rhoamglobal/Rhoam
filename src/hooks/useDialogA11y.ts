"use client";

import { useEffect, useRef } from "react";

type Options = {
  open: boolean;
  onClose: () => void;
  /**
   * Set to false while a critical async action is in flight (e.g. mid-
   * payment) so Escape can't dismiss the modal out from under it. Defaults
   * to true.
   */
  closeOnEscape?: boolean;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Previously each of the app's modals (Unlock, Contact, Report,
// SmartFilters, ConfirmModal) was a bespoke implementation with no
// role="dialog", no focus trap, and no Escape handling — meaning
// keyboard/screen-reader users could tab out of an open modal into the
// page behind it, and had no way to close it except finding the visible
// Cancel/X button. This hook centralizes that behavior once instead of
// re-solving it (or missing it) in five separate components.
//
// Usage: attach the returned `panelRef` to the actual modal panel
// element (the card/sheet, not the backdrop), and add
// `role="dialog" aria-modal="true" aria-labelledby={someHeadingId}` to
// that same element in the consuming component.
export function useDialogA11y({ open, onClose, closeOnEscape = true }: Options) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // A short delay lets the entrance animation (Framer Motion spring/
    // fade) mount the panel before we try to move focus into it — moving
    // focus on the same tick can occasionally race the initial render.
    const focusTimer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable[0] ?? panel).focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null); // visible only

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      // Return focus to whatever triggered the modal (e.g. the "Unlock"
      // button), rather than leaving focus stranded on <body>.
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, closeOnEscape]);

  return { panelRef };
}
