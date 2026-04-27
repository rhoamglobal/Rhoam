"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

type Props = {
  onSearch: (value: string) => void;
  onFilter: (filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
  }) => void;
};

export default function TopBar({ onSearch, onFilter }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);

  function applyFilters() {
    onFilter({ category, minPrice, maxPrice });
    setShowFilters(false);
  }

  return (
    <>
      {/* Top Search Bar */}
      <div className="absolute top-0 left-0 w-full p-5 z-[1000] flex justify-center">
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl shadow-2xl rounded-full px-6 py-3 w-[650px] border border-gray-200">
          <Search className="text-gray-500" />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search for apartments, hostels, houses..."
            className="flex-1 outline-none text-sm bg-transparent"
          />

          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#ff5a5f] text-white hover:opacity-90 transition cursor-pointer"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="bg-white w-[400px] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowFilters(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            {/* Category */}
            <label className="text-sm">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2 rounded-md mb-4"
            >
              <option value="all">All</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="land">Land</option>
              <option value="shop">Shop</option>
            </select>

            {/* Min Price */}
            <label className="text-sm">Min Price (₦)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full border p-2 rounded-md mb-4"
            />

            {/* Max Price */}
            <label className="text-sm">Max Price (₦)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full border p-2 rounded-md mb-6"
            />

            <button
              onClick={applyFilters}
              className="w-full bg-[#ff5a5f] text-white py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}