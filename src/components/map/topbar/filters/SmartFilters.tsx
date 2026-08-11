"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FilterSection from "./FilterSection";
import PriceRange from "./PriceRange";
import RoomSelector from "./RoomSelector";
import AmenitiesSelector from "./AmenitiesSelector";
import { X } from "lucide-react";
import { Z_CLASS } from "@/lib/zIndex";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { getCenteredModalMotion } from "@/lib/motionPresets";

export type Filters = {
  minPrice: string;
  maxPrice: string;
  rooms: string;
  availableOnly: boolean;
  amenities: string[];
};

export const emptyFilters: Filters = {
  minPrice: "",
  maxPrice: "",
  rooms: "",
  availableOnly: false,
  amenities: [],
};

export function countActive(f: Filters) {
  return (
    (f.minPrice ? 1 : 0) +
    (f.maxPrice ? 1 : 0) +
    (f.rooms && f.rooms !== "Any" ? 1 : 0) +
    (f.availableOnly ? 1 : 0) +
    (f.amenities?.length || 0)
  );
}

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClose: () => void;
};

export default function SmartFilters({
  filters,
  setFilters,
  onClose,
}: Props) {
  // Previously every control here called setFilters directly, so the map
  // was already re-filtering live behind the modal — but the "Apply
  // Filters" button implied a deferred commit that never actually
  // happened. It was a button that did nothing but close the sheet.
  //
  // Fixed by buffering edits in local draft state. Nothing reaches the
  // map/parent until Apply is pressed, so that button now does real
  // work, and dismissing without Apply (X, overlay tap, Escape) discards
  // the draft instead of silently having already applied it.
  const [draft, setDraft] = useState<Filters>(filters);

  const activeCount = countActive(draft);

  const cancel = () => {
    setDraft(filters); // discard unsaved edits
    onClose();
  };

  const apply = () => {
    setFilters(draft);
    onClose();
  };

  const { panelRef } = useDialogA11y({ open: true, onClose: cancel });
  const panelMotion = getCenteredModalMotion(usePrefersReducedMotion());

  return (
    <>
      {/* Background */}
      <motion.div
        onClick={cancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className={`fixed inset-0 bg-black/35 backdrop-blur-sm ${Z_CLASS.modalBackdrop}`}
      />

      {/* Filter Card */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-modal-title"
        tabIndex={-1}
        {...panelMotion}
        className={`
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

          ${Z_CLASS.modalPanel}

          overflow-hidden
        `}
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
            <div className="flex items-center gap-2">
              <h2 id="filters-modal-title" className="text-2xl font-bold text-gray-900">
                Filters
              </h2>
              {activeCount > 0 && (
                <span className="text-xs font-semibold text-[#ff5a5f] bg-[#fff1f1] px-2 py-1 rounded-full">
                  {activeCount} selected
                </span>
              )}
            </div>

            <button
              onClick={cancel}
              aria-label="Close filters"
              className="
                h-10
                w-10
                rounded-full
                bg-gray-100
                hover:bg-gray-200
                flex items-center justify-center
                transition
              "
            >
              <X size={18} />
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
          {/* PRICE */}

          <FilterSection title="Price Range">
            <PriceRange
              min={draft.minPrice}
              max={draft.maxPrice}
              onMinChange={(minPrice) =>
                setDraft((prev) => ({
                  ...prev,
                  minPrice,
                }))
              }
              onMaxChange={(maxPrice) =>
                setDraft((prev) => ({
                  ...prev,
                  maxPrice,
                }))
              }
            />
          </FilterSection>

          {/* ROOMS */}

          <FilterSection title="Rooms">
            <RoomSelector
              value={draft.rooms}
              onChange={(rooms) =>
                setDraft((prev) => ({
                  ...prev,
                  rooms,
                }))
              }
            />
          </FilterSection>

          {/* AMENITIES */}

          <FilterSection title="Amenities">
            <AmenitiesSelector
              selected={draft.amenities || []}
              onChange={(amenities) =>
                setDraft((prev) => ({
                  ...prev,
                  amenities,
                }))
              }
            />
          </FilterSection>

          {/* AVAILABLE */}

          <FilterSection title="Availability">
            <label className="flex items-center justify-between">
              <span className="font-medium text-gray-900">
                Available only
              </span>

              <input
                type="checkbox"
                checked={draft.availableOnly}
                onChange={(e) =>
                  setDraft((prev) => ({
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
            onClick={() => setDraft(emptyFilters)}
            className="
              text-gray-500
              hover:text-black
              font-medium
              transition
            "
          >
            Reset
          </button>

          <button
            onClick={apply}
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
              active:scale-95
              transition
            "
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </>
  );
}
