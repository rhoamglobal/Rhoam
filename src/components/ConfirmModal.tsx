"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      
      {/* overlay */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 animate-fadeIn">

        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          {message}
        </p>

        <div className="flex gap-3 mt-6">

          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition"
          >
            {confirmText}
          </button>

        </div>
      </div>
    </div>
  );
}