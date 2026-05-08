"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <Search className="text-gray-500" />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for apartments, hostels, houses..."
        className="flex-1 outline-none text-sm bg-transparent"
      />
    </div>
  );
}