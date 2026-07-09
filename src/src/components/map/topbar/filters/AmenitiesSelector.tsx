"use client";

import { amenities } from "@/lib/amenities";

type Props = {
  selected: string[];
  onChange: (value: string[]) => void;
};

export default function AmenitiesSelector({
  selected,
  onChange,
}: Props) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((x) => x !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {amenities.map((amenity) => {
        const Icon = amenity.icon;
        const active = selected.includes(amenity.key);

        return (
          <button
            key={amenity.key}
            onClick={() => toggle(amenity.key)}
            className={`
              flex items-center gap-2
              rounded-full
              px-4
              py-3
              transition-all
              duration-200
              border

              ${
                active
                  ? "bg-[#ff5a5f] text-white border-[#ff5a5f] shadow-lg shadow-[#ff5a5f]/25"
                  : "bg-white border-gray-200 hover:border-[#ff5a5f] hover:bg-[#fff6f6]"
              }
            `}
          >
            <Icon size={17} />

            <span className="text-sm font-medium">
              {amenity.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}