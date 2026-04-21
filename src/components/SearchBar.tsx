'use client'

export default function SearchBar() {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-[1000]">
      <div className="bg-white rounded-full shadow-xl px-6 py-4 flex items-center gap-3">
        <div className="text-rhoam-coral text-lg">🔍</div>
        <div className="text-gray-500 text-sm">
          Search by school, area, or apartment
        </div>
      </div>
    </div>
  )
}