"use client";

import { Map as MapIcon, List } from "lucide-react";

type View = "map" | "list";

// Lives in CategoryBar's fixed trailing slot now (see CategoryBar.tsx) —
// not floating at the bottom of the screen. Sized to match the category
// pills next to it and colored the same brand coral as an active chip,
// so it reads as part of that same control row rather than a separate
// floating element.
export default function ViewToggle({
  view,
  onChange,
}: {
  view: View;
  onChange: (view: View) => void;
}) {
  return (
    <button
      onClick={() => onChange(view === "map" ? "list" : "map")}
      className="
        flex items-center gap-1.5
        bg-[#ff5a5f] text-white
        px-4 py-2.5 rounded-full
        shadow-md shadow-[#ff5a5f]/25
        text-sm font-semibold whitespace-nowrap
        transition hover:bg-[#f24d52]
      "
    >
      {view === "map" ? (
        <>
          <List size={16} />
          List
        </>
      ) : (
        <>
          <MapIcon size={16} />
          Map
        </>
      )}
    </button>
  );
}
