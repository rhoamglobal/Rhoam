"use client";

export default function Categories({ active, setActive }: any) {
  const categories = [
    "All",
    "Hotels",
    "Student Apartments",
    "Apartments",
    "Shortlets",
  ];

  return (
    <div className="absolute top-[72px] left-0 w-full z-[1000]">
      <div className="flex gap-3 overflow-x-auto px-6 py-3 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border backdrop-blur-md transition
              ${
                active === cat
                  ? "bg-[#ff5a5f] text-white border-[#ff5a5f]"
                  : "bg-white/80 text-gray-700 border-gray-300 hover:border-[#ff5a5f] hover:text-[#ff5a5f]"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}