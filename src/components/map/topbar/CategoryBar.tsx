"use client";

import {
  Hotel,
  Building2,
  Home,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";
import { Z_CLASS } from "@/lib/zIndex";

type Props = {
  active: string;
  setActive: (value: string) => void;
  // Rendered in a fixed slot at the right edge of the row — outside the
  // scrollable chip container, so it stays in place while chips scroll
  // underneath/behind it instead of scrolling away with them.
  trailing?: React.ReactNode;
};

export const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Hotels", icon: Hotel },
  { name: "Student lodges", icon: GraduationCap },
  { name: "Apartment", icon: Building2 },
];

export default function CategoryBar({ active, setActive, trailing }: Props) {
  return (
    <div className={`absolute top-[78px] left-0 w-full ${Z_CLASS.categoryBar} flex items-center`}>
      <div
        className="flex-1 min-w-0 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,black_92%,transparent_100%)]"
      >
        <div className="flex gap-4 px-6 py-3 w-max">
          {CATEGORIES.map(({ name, icon: Icon }) => {
            const isActive = active === name;

            return (
              <button
                key={name}
                onClick={() => setActive(name)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap
                  backdrop-blur-xl border transition-all duration-300
                  ${
                    isActive
                      ? "bg-[#ff5a5f] text-white border-[#ff5a5f] shadow-lg scale-105"
                      : "bg-white/70 text-gray-700 border-gray-300 hover:border-[#ff5a5f] hover:text-[#ff5a5f] hover:scale-105"
                  }
                `}
              >
                <Icon size={16} />
                {name}
              </button>
            );
          })}
          {/* Spacer so the fade mask has room to fade the last real chip
              out before the trailing slot, rather than clipping it. */}
          {trailing && <div className="w-2 shrink-0" />}
        </div>
      </div>

      {trailing && (
        <div className="shrink-0 pr-4 pl-1">{trailing}</div>
      )}
    </div>
  );
}