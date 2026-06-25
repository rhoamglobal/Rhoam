"use client";

import { useEffect, useRef, useState } from "react";
import SearchSuggestions from "../search/SearchSuggestions";
import { Property } from "../types";
import { schools } from "@/lib/schools";

export default function SearchBar({
  search,
  setSearch,
  setFlyTarget,
}: {
  search: string;
  setSearch: (v: string) => void;
  setFlyTarget: (
    target: {
      latitude: number;
      longitude: number;
    } | null
  ) => void;
}) {
  const [input, setInput] = useState(search);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput(search);
  }, [search]);

  // close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // fetch properties
  useEffect(() => {
    if (!input.trim()) {
      setProperties([]);
      return;
    }

    const fetchSuggestions = async () => {
      const res = await fetch(
        `/api/search-suggestions?q=${input}`
      );

      const data = await res.json();
      setProperties(data);
    };

    fetchSuggestions();
  }, [input]);

  const text = input.toLowerCase();

  // schools show by default when focused
  const schoolMatches =
    !input.trim()
      ? schools
      : schools.filter((school) =>
          school.aliases.some((alias) =>
            alias.includes(text)
          )
        );

  // locations deduplicated
  const locationMatches = properties
    .filter((property) =>
      property.location?.toLowerCase().includes(text)
    )
    .map((property) => ({
      name: property.location,
      lat: property.latitude,
      lng: property.longitude,
    }))
    .filter(
      (v, i, arr) =>
        arr.findIndex((x) => x.name === v.name) === i
    );

  return (
    <div
      ref={wrapperRef}
      className="
        relative w-full max-w-xl mx-auto px-4 mt-4 z-[2000]
        rounded-xl
      "
    >
      {/* unified shell */}
      <div
        className={`
          bg-white shadow-xl border-2 border-gray-100
          overflow-hidden transition-all
          ${
            isFocused
              ? "rounded-[28px]"
              : "rounded-full"
          }
        `}
      >
        {/* input row */}
        <div className="flex items-center gap-2 p-2">
          <input
            value={input}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search school, area or apartment..."
            className="
              flex-1 px-4 py-3
              outline-none bg-transparent
              text-gray-800
            "
          />

          <button
            onClick={() => setSearch(input)}
            className="
              px-5 py-3 rounded-full
              bg-[#ff5a5f]
              text-white font-medium
            "
          >
            Search
          </button>
        </div>

        {/* dropdown inside same card */}
        {isFocused && (
          <SearchSuggestions
            schools={schoolMatches}
            locations={locationMatches}
            properties={properties}
            onFlyTo={(target) => {
              setFlyTarget(target);
              setIsFocused(false);
            }}
            onPreview={() => {
              setIsFocused(false);
            }}
          />
        )}
      </div>
    </div>
  );
}