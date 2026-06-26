"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

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

      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl text-white shadow-lg z-[9999] ${
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
