// Single source of truth for stacking order across the app. Previously
// z-index values were hardcoded independently in ~15 places (850, 900,
// 1000, 1900, 2000, 9998, 9999, 10000, chosen ad hoc as each component
// was built) with no documented scale — the kind of setup where adding
// one more overlapping UI element eventually produces a modal-behind-
// modal bug that's painful to trace back to its cause.
//
// Layers, low to high:
//   mapEmptyState            - "no results" overlay sitting on the map
//   categoryBar               - category pills, just under the search bar
//   mapControls                - search bar container, bottom nav, "search
//                                this area" button, sticky list headers
//   propertyStickyHeader      - property page's scroll-triggered header
//   propertyFloatingControls  - property page back/save/map buttons, the
//                                map preview card, and the search bar's
//                                own internal stacking context
//   modalBackdrop             - the dimmed background behind a modal
//   modalPanel                - the modal card/sheet itself
//   criticalModal             - payment/contact/report sheets — these sit
//                                above ordinary modals since they carry
//                                real-money or trust-sensitive actions
//   toast                     - deliberately the topmost layer of all:
//                                a toast (e.g. "payment already confirmed")
//                                must never be visually hidden behind a
//                                modal that happens to be open when it fires
//
// Numeric values are kept identical to what was already in use wherever
// possible, specifically so this refactor doesn't change real stacking
// behavior anywhere except the one deliberate fix noted above (toast).
export const Z_INDEX = {
  mapEmptyState: 850,
  categoryBar: 900,
  mapControls: 1000,
  propertyStickyHeader: 1900,
  propertyFloatingControls: 2000,
  modalBackdrop: 9998,
  modalPanel: 9999,
  criticalModal: 10000,
  toast: 10500,
} as const;

// Tailwind (v4, auto content-detection) generates a utility class for any
// literal `z-[...]` string it finds in scanned source text — it doesn't
// need that string to be statically assigned to a className in the same
// file. Keeping the literal strings here, matching the numeric values
// above 1:1, means every consumer imports one name and Tailwind still
// generates the right CSS; nobody needs to remember or retype the number.
export const Z_CLASS = {
  mapEmptyState: "z-[850]",
  categoryBar: "z-[900]",
  mapControls: "z-[1000]",
  propertyStickyHeader: "z-[1900]",
  propertyFloatingControls: "z-[2000]",
  modalBackdrop: "z-[9998]",
  modalPanel: "z-[9999]",
  criticalModal: "z-[10000]",
  toast: "z-[10500]",
} as const;
