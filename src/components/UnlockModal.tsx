"use client";

import { Z_CLASS } from "@/lib/zIndex";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Phone, ShieldCheck, Infinity as InfinityIcon, AlertTriangle } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getModalPanelMotion } from "@/lib/motionPresets";

type Props = {
  open: boolean;
  price: number;
  propertyTitle: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const perks = [
  { icon: Phone, label: "Direct phone number, no middleman" },
  { icon: ShieldCheck, label: "Landlord verified by Rhoam" },
  { icon: InfinityIcon, label: "Pay once, keep access forever" },
];

export default function UnlockModal({
  open,
  price,
  propertyTitle,
  loading,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const { panelRef } = useDialogA11y({
    open,
    onClose: onCancel,
    closeOnEscape: !loading,
  });
  const panelMotion = getModalPanelMotion(usePrefersReducedMotion());

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${Z_CLASS.criticalModal} flex items-end sm:items-center justify-center`}>
          {/* overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          {/* card */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unlock-modal-title"
            tabIndex={-1}
            {...panelMotion}
            className="
              relative w-full sm:max-w-sm
              bg-white
              rounded-t-[32px] sm:rounded-[32px]
              shadow-2xl
              p-7 pb-8
              sm:mb-0
            "
          >
            {/* icon */}
            <div
              className="
                h-14 w-14 rounded-2xl
                bg-[#FF6B6B]/10
                flex items-center justify-center
                mb-5
              "
            >
              <Lock size={24} className="text-[#FF6B6B]" strokeWidth={2.2} />
            </div>

            <h2 id="unlock-modal-title" className="text-xl font-semibold text-gray-900 leading-snug">
              Unlock contact for
              <br />
              <span className="text-gray-500 font-normal">
                {propertyTitle}
              </span>
            </h2>

            {/* price */}
            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-gray-900">
                ₦{price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400">one-time</span>
            </div>

            {/* perks */}
            <ul className="mt-6 space-y-3">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <span
                    className="
                      h-8 w-8 shrink-0 rounded-full
                      bg-gray-50 border border-gray-100
                      flex items-center justify-center
                    "
                  >
                    <Icon size={14} className="text-[#FF6B6B]" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            {error && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2 px-3.5 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm"
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-400 text-center">
              Covered by our{" "}
              <a
                href="/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF6B6B] font-medium underline underline-offset-2"
              >
                refund & dispute policy
              </a>
            </p>

            {/* actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={onCancel}
                disabled={loading}
                className="
                  flex-1 py-3.5 rounded-2xl
                  bg-gray-100 text-gray-700 font-medium
                  hover:bg-gray-200
                  disabled:opacity-50
                  transition
                "
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className="
                  flex-1 py-3.5 rounded-2xl
                  bg-[#FF6B6B] text-white font-medium
                  shadow-lg shadow-[#FF6B6B]/30
                  hover:bg-[#ff5252]
                  disabled:opacity-60
                  transition
                  flex items-center justify-center gap-2
                "
              >
                {loading ? "Redirecting…" : error ? "Try again" : "Unlock now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
