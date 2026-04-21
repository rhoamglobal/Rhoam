"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function TopBar() {
  return (
    <div className="absolute top-0 left-0 w-full p-6 z-[1000] flex justify-center">
      <div className="flex items-center gap-3 bg-white shadow-xl rounded-full px-6 py-3 w-[600px]">
        <Search className="text-gray-500" />
        <input
          placeholder="Search for apartments, hostels, houses..."
          className="flex-1 outline-none text-sm"
        />
        <button className="flex items-center 
                  gap-2 border border-[#ff5a5f]  
                  rounded-full px-4 py-1.5 

                  hover:bg-[#ff5a5f]-100">
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>
    </div>
  );
}