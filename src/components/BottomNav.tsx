"use client";

export default function BottomNav() {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-white border-t z-[1000] flex justify-around py-3 text-sm">
      <button>Roam</button>
      <button>Favourite</button>
      <button>Profile</button>
    </div>
  );
}