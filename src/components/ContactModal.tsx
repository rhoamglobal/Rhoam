"use client";

import { Z_CLASS } from "@/lib/zIndex";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, MessageCircle, X, Flag } from "lucide-react";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getModalPanelMotion } from "@/lib/motionPresets";

type ContactPerson = {
  role: string;
  name?: string | null;
  phone?: string | null;
  waLink?: string | null;
};

type Props = {
  open: boolean;
  landlordPhone?: string | null;
  landlordWaLink?: string | null;
  caretakerName?: string | null;
  caretakerPhone?: string | null;
  caretakerWaLink?: string | null;
  onClose: () => void;
  onReportIssue?: () => void;
};

function ContactRow({ role, name, phone, waLink }: ContactPerson) {
  if (!phone) return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <div>
        <p className="text-xs text-gray-400">
          {role}
          {name ? ` · ${name}` : ""}
        </p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">
          {phone}
        </p>
      </div>

      <div className="flex gap-2 shrink-0">
        <a
          href={`tel:${phone}`}
          className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition"
          aria-label={`Call ${role.toLowerCase()}`}
        >
          <Phone size={16} />
        </a>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition"
            aria-label={`WhatsApp ${role.toLowerCase()}`}
          >
            <MessageCircle size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ContactModal({
  open,
  landlordPhone,
  landlordWaLink,
  caretakerName,
  caretakerPhone,
  caretakerWaLink,
  onClose,
  onReportIssue,
}: Props) {
  const { panelRef } = useDialogA11y({ open, onClose });
  const panelMotion = getModalPanelMotion(usePrefersReducedMotion());

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 ${Z_CLASS.criticalModal} flex items-end sm:items-center justify-center`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
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
              <h2 id="contact-modal-title" className="text-xl font-semibold text-gray-900">
                Contact details
              </h2>

              <button
                onClick={onClose}
                aria-label="Close"
                className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <ContactRow
                role="Landlord"
                phone={landlordPhone}
                waLink={landlordWaLink}
              />

              <ContactRow
                role="Caretaker"
                name={caretakerName}
                phone={caretakerPhone}
                waLink={caretakerWaLink}
              />
            </div>

            {onReportIssue && (
              <button
                onClick={() => {
                  onClose();
                  onReportIssue();
                }}
                className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-[#ff5a5f] transition py-2"
              >
                <Flag size={14} />
                Report an issue with this contact
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
