"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Map", icon: Map },
    { href: "/saved", label: "Saved", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1000]">
      <nav className="relative flex items-center gap-8 px-10 py-4 rounded-full
        bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40">

        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-16"
            >
              {/* Active bubble */}
              {isActive && (
                <span className="absolute -top-3 w-14 h-14 bg-rhoam-primary/15 rounded-full blur-md animate-pulse" />
              )}

              <Icon
                size={26}
                className={`transition-all duration-300 ${
                  isActive
                    ? "text-[#ff5a5f] scale-125"
                    : "text-gray-400"
                }`}
              />

              <span
                className={`mt-1 text-xs transition-all duration-300 ${
                  isActive
                    ? "text-[#ff5a5f] font-semibold"
                    : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}