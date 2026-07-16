"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Phone, MessageCircle, X } from "lucide-react";

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
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="
              relative w-full sm:max-w-sm
              bg-white
              rounded-t-[32px] sm:rounded-[32px]
              shadow-2xl
              p-7 pb-8
            "
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
