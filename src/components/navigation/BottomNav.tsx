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
    <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-6">
      <nav className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-transform active:scale-95"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-colors duration-200 ${
                  isActive
                    ? "text-[#FF5A5F]"
                    : "text-gray-400"
                }`}
              />
              <span
                className={`mt-1 text-[10px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[#FF5A5F]"
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
