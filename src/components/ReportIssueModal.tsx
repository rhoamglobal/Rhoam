"use client";

import { Z_CLASS } from "@/lib/zIndex";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getModalPanelMotion } from "@/lib/motionPresets";

type IssueType = "wrong_number" | "listing_gone" | "other";

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: "wrong_number", label: "The number is wrong or unreachable" },
  { value: "listing_gone", label: "The listing is already taken" },
  { value: "other", label: "Something else" },
];

type Props = {
  open: boolean;
  propertyId: string;
  onClose: () => void;
};

export default function ReportIssueModal({ open, propertyId, onClose }: Props) {
  const [issueType, setIssueType] = useState<IssueType | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { panelRef } = useDialogA11y({
    open,
    onClose: () => handleClose(),
    closeOnEscape: !submitting,
  });
  const panelMotion = getModalPanelMotion(usePrefersReducedMotion());

  const reset = () => {
    setIssueType(null);
    setNote("");
    setError("");
    setSubmitted(false);
  };

  const handleClose = () => {
    onClose();
    // Delay the reset past the exit animation so the form doesn't visibly
    // flash back to its initial state while the sheet is still sliding away.
    setTimeout(reset, 250);
  };

  const handleSubmit = async () => {
    if (!issueType || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/unlock-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, issueType, note }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Couldn't submit your report.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't submit your report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${Z_CLASS.criticalModal} flex items-end sm:items-center justify-center`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            tabIndex={-1}
            {...panelMotion}
            className="
              relative w-full sm:max-w-sm
              bg-white
              rounded-t-[32px] sm:rounded-[32px]
              shadow-2xl
              p-7 pb-8
            "
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="report-modal-title" className="text-xl font-semibold text-gray-900">
                {submitted ? "Report received" : "Report an issue"}
              </h2>

              <button
                onClick={handleClose}
                aria-label="Close"
                className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-2">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Thanks for flagging this — we'll look into it and follow up
                  if we need anything else from you.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 w-full py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-5">
                  Let us know what went wrong with this contact. We review
                  every report and this helps us keep listings accurate.
                </p>

                <div className="space-y-2">
                  {ISSUE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setIssueType(opt.value)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border transition text-sm font-medium
                        ${
                          issueType === opt.value
                            ? "border-[#ff5a5f] bg-[#fff1f1] text-gray-900"
                            : "border-gray-100 bg-gray-50/60 text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything else we should know? (optional)"
                  rows={3}
                  maxLength={1000}
                  className="mt-4 w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-[#ff5a5f] transition text-sm resize-none"
                />

                <p className="mt-3 text-xs text-gray-400">
                  See our{" "}
                  <a
                    href="/refund-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff5a5f] font-medium underline underline-offset-2"
                  >
                    refund & dispute policy
                  </a>{" "}
                  for how reports are handled.
                </p>

                {error && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!issueType || submitting}
                  className="mt-5 w-full py-3.5 rounded-2xl bg-[#ff5a5f] text-white font-semibold shadow-lg shadow-[#ff5a5f]/25 transition
                    disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f24d52]"
                >
                  {submitting ? "Submitting…" : "Submit report"}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
