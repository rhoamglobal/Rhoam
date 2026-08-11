"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/navigation/BottomNav";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide nav on property pages and all unauthenticated auth screens
  const hideNav =
    pathname.startsWith("/property/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/refund-policy") ||
    pathname.startsWith("/caretaker/");


  return (
    <>
      <main
        style={{
          paddingBottom: hideNav ? 0 : "0px",
        }}
      >
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </>
  );
}