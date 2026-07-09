"use client";

import FilterSection from "./FilterSection";
import SchoolSelector from "./SchoolSelector";
import PriceRange from "./PriceRange";
import RoomSelector from "./RoomSelector";
import AmenitiesSelector from "./AmenitiesSelector";

type Filters = {
  category: string;
  school: string;
  minPrice: string;
  maxPrice: string;
  rooms: string;
  availableOnly: boolean;
  amenities?: string[];
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<
    React.SetStateAction<Filters>
  >;
  onClose: () => void;
};

export default function SmartFilters({
  filters,
  setFilters,
  onClose,
}: Props) {
  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className="
          fixed inset-0
          bg-black/35
          backdrop-blur-sm
          z-[9998]
          animate-in fade-in duration-200
        "
      />

      {/* Filter Card */}
      <div
        className="
          fixed
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2

          w-[95vw]
          max-w-xl

          max-h-[88vh]

          bg-white
          rounded-[32px]
          shadow-2xl

          z-[9999]

          overflow-hidden

          animate-in zoom-in-95 fade-in duration-200
        "
      >
        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-20
            bg-white
            border-b
            border-gray-100
            px-7
            py-5
          "
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Filters
            </h2>

            <button
              onClick={onClose}
              className="
                h-10
                w-10
                rounded-full
                bg-gray-100
                hover:bg-gray-200
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}

        <div
          className="
            overflow-y-auto
            px-7
            pb-40
            max-h-[70vh]
          "
        >
          {/* SCHOOL */}

          <FilterSection title="School">
            <SchoolSelector
              value={filters.school}
              onChange={(school) =>
                setFilters((prev) => ({
                  ...prev,
                  school,
                }))
              }
            />
          </FilterSection>

          {/* PRICE */}

          <FilterSection title="Price Range">
            <PriceRange
              min={filters.minPrice}
              max={filters.maxPrice}
              onMinChange={(minPrice) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice,
                }))
              }
              onMaxChange={(maxPrice) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice,
                }))
              }
            />
          </FilterSection>

          {/* ROOMS */}

          <FilterSection title="Rooms">
            <RoomSelector
              value={filters.rooms}
              onChange={(rooms) =>
                setFilters((prev) => ({
                  ...prev,
                  rooms,
                }))
              }
            />
          </FilterSection>

          {/* AMENITIES */}

          <FilterSection title="Amenities">
            <AmenitiesSelector
              selected={filters.amenities || []}
              onChange={(amenities) =>
                setFilters((prev) => ({
                  ...prev,
                  amenities,
                }))
              }
            />
          </FilterSection>

          {/* AVAILABLE */}

          <FilterSection title="Availability">
            <label className="flex items-center justify-between">
              <span className="font-medium">
                Available only
              </span>

              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    availableOnly:
                      e.target.checked,
                  }))
                }
                className="
                  h-5
                  w-5
                  accent-[#ff5a5f]
                "
              />
            </label>
          </FilterSection>
        </div>

        {/* FOOTER */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0

            border-t
            bg-white

            px-7
            py-5

            flex
            justify-between
            items-center
          "
        >
          <button
            onClick={() =>
              setFilters({
                category: "",
                school: "",
                minPrice: "",
                maxPrice: "",
                rooms: "",
                availableOnly: false,
                amenities: [],
              })
            }
            className="
              text-gray-500
              hover:text-black
              font-medium
            "
          >
            Reset
          </button>

          <button
            onClick={onClose}
            className="
              bg-[#ff5a5f]
              text-white

              px-8
              py-3

              rounded-full

              font-semibold

              shadow-lg
              shadow-[#ff5a5f]/30

              hover:scale-[1.02]
              transition
            "
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}