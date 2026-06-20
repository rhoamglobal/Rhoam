"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/navigation/BottomNav";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide nav on property pages
  const hideNav =
    pathname.startsWith("/property/") || pathname.startsWith("/login") || pathname.startsWith("/signup")
    || pathname.startsWith("/onboarding");
    

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