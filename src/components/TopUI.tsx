'use client'

import { Search, SlidersHorizontal } from 'lucide-react'

export default function TopUI() {
  return (
    <div className="absolute top-0 left-0 w-full p-4 z-[1000]">
      {/* Search + Filter */}
      <div className="flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-lg px-4 py-3">
        <Search className="w-5 h-5 text-zinc-500" />

        <input
          placeholder="Search by area, school, street..."
          className="flex-1 bg-transparent outline-none text-sm"
        />

        {/* Filter button (your O region) */}
        <button className="bg-coral-500 text-white rounded-full p-2">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Property types */}
      <div className="flex gap-3 overflow-x-auto mt-4">
        {[ 'all','Hostel', 'Shortlet', 'Apartment', 'Self Contain', 'Shared Flat'].map(
          (type) => (
            <button
              key={type}
              className="whitespace-nowrap bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow text-sm"
            >
              {type}
            </button>
          )
        )}
      </div>
    </div>
  )
}