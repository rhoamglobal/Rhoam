"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SearchSuggestions from "../search/SearchSuggestions";
import { Property } from "../types";
import { schools } from "@/lib/schools";
import { Search, SlidersHorizontal, X } from "lucide-react";

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

  useEffect(() => {
    if (!input.trim()) {
      return;
    }

    let cancelled = false;

    const fetchSuggestions = async () => {
      const res = await fetch(
        `/api/search-suggestions?q=${encodeURIComponent(input)}`
      );

      const data = await res.json();

      if (!cancelled) {
        setProperties(data);
      }
    };

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [input]);

  const text = input.toLowerCase();
  const visibleProperties = useMemo(
    () => (input.trim() ? properties : []),
    [input, properties]
  );

  const schoolMatches = useMemo(
    () =>
      !input.trim()
        ? schools.slice(0, 5)
        : schools.filter((school) =>
            school.aliases.some((alias) =>
              alias.includes(text)
            )
          ),
    [input, text]
  );

  const locationMatches = useMemo(
    () =>
      visibleProperties
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
        ),
    [visibleProperties, text]
  );

  const submitSearch = () => {
    setSearch(input.trim());
    setIsFocused(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative z-[2000] mx-auto mt-4 w-full max-w-2xl px-3 sm:px-4"
    >
      <div
        className={`
          overflow-hidden border border-white/80 bg-white/95
          shadow-[0_24px_70px_rgba(15,23,42,0.18)]
          backdrop-blur-xl transition-all duration-300
          ${
            isFocused
              ? "rounded-[24px] ring-1 ring-[#ff5a5f]/20"
              : "rounded-full"
          }
        `}
      >
        <div className="flex items-center gap-2 p-2">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff1f1] text-[#ff5a5f]">
            <Search size={18} />
          </div>

          <input
            value={input}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitSearch();
              }
            }}
            placeholder="Search school, area or apartment..."
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
          />

          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                setSearch("");
                setProperties([]);
              }}
              aria-label="Clear search"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={17} />
            </button>
          )}

          <button
            type="button"
            onClick={submitSearch}
            aria-label="Search"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ff5a5f] text-white shadow-lg shadow-[#ff5a5f]/25 transition hover:bg-[#f24d52] active:scale-95"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {isFocused && (
          <SearchSuggestions
            schools={schoolMatches}
            locations={locationMatches}
            properties={visibleProperties}
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
