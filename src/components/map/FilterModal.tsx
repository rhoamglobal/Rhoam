"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function FilterModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
  }) => void;
}) {
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[2000] flex items-center justify-center">
      <div className="bg-white w-[400px] rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">Filters</h2>

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

        <label className="text-sm">Min Price (₦)</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(Number(e.target.value))}
          className="w-full border p-2 rounded-md mb-4"
        />

        <label className="text-sm">Max Price (₦)</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full border p-2 rounded-md mb-6"
        />

        <button
          onClick={() => {
            onApply({ category, minPrice, maxPrice });
            onClose();
          }}
          className="w-full bg-[#ff5a5f] text-white py-2 rounded-lg"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}