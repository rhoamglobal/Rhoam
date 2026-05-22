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
    <nav
      className="
        fixed bottom-0 left-0 w-full z-[1000]
        bg-white border-t border-gray-200
        shadow-[0_-4px_20px_rgba(0,0,0,0.06)]
      "
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1"
            >
              <Icon
                size={24}
                className={`transition-all duration-200 ${
                  isActive ? "text-[#ff5a5f]" : "text-gray-400"
                }`}
              />

              <span
                className={`text-xs mt-1 ${
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
      </div>
    </nav>
  );
}