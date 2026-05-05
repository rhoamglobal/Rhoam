"use client";

type Props = {
  visible: boolean;
  onClick: () => void;
};

export default function SearchThisAreaButton({ visible, onClick }: Props) {
  if (!visible) return null;

  return (
    <div className="absolute top-29 left-1/2 -translate-x-1/2 z-[1000]">
      <button
        onClick={onClick}
        className="bg-white shadow-xl px-6 py-3 rounded-full font-semibold border hover:scale-105 transition"
      >
        Search this area
      </button>
    </div>
  );
}