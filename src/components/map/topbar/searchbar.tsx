"use client";
import { useEffect, useState } from "react";

export default function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  const [input, setInput] = useState(search);

  // Sync with parent search
  useEffect(() => {
    setInput(search);
  }, [search]);
  

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xl flex gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search location, title..."
        className="flex-1 p-3 rounded-full shadow-lg border outline-none
                    bg-white/70 text-gray-700 border-gray-300"
      />

      <button
        onClick={() => setSearch(input)}
        className="px-5 rounded-full bg-[#ff5a5f] text-white font-semibold"
      >
        Search
      </button>
    </div>
  );
}