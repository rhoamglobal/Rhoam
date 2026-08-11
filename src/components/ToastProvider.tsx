"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Z_CLASS } from "@/lib/zIndex";

type ToastType = "error" | "success";

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: ToastType = "error") => {
    setToast({ message, type, visible: true });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/*
        Deliberately the app's topmost z-index tier (see src/lib/zIndex.ts):
        a toast can fire while a modal is open (e.g. the "already unlocked"
        sync message while UnlockModal is up), and it needs to stay visible
        rather than render behind that modal's backdrop.

        aria-live="assertive" for errors since those need immediate
        announcement (e.g. a failed payment); "polite" for success so it
        doesn't interrupt whatever the screen reader is already reading.
        Previously this had no aria-live at all, so none of these state
        changes were ever announced to screen reader users.
      */}
      {toast && (
        <div
          role="status"
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl text-white shadow-lg ${Z_CLASS.toast} ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
