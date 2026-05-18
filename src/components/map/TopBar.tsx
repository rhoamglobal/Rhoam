"use client";

import { useState } from "react";

export default function SearchBar({
  setSearch,
}: {
  setSearch: (v: string) => void;
}) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    setSearch(input); // ✅ only fires when button is clicked
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xl flex gap-2">
      <input
        placeholder="Search school, price, category..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-3 rounded-full shadow-lg border outline-none"
      />

      <button
        onClick={handleSubmit}
        className="px-6 rounded-full bg-[#ff5a5f] text-white font-semibold shadow-lg"
      >
        Search
      </button>
    </div>
  );
}