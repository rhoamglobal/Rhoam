"use client";

import {
  Hotel,
  Building2,
  Home,
  GraduationCap,
  LayoutGrid,
} from "lucide-react";

type Props = {
  active: string;
  setActive: (value: string) => void;
};

const CATEGORIES = [
  { name: "All", icon: LayoutGrid },
  { name: "Hotels", icon: Hotel },
  { name: "Student Apartments", icon: GraduationCap },
  { name: "Apartments", icon: Building2 },
  { name: "Shortlets", icon: Home },
];

export default function CategoryBar({ active, setActive }: Props) {
  return (
    <div className="absolute top-[78px] left-0 w-full z-[1000]">
      <div className="flex gap-4 overflow-x-auto px-6 py-3 scrollbar-hide">
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
      </div>
    </div>
  );
}