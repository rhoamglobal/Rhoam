"use client";

import { createContext, useContext, useState } from "react";

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: any) {
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
    visible: boolean;
  } | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
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

export const useToast = () => useContext(ToastContext);