export default function TopBar({ setSearch }: { setSearch: (v: string) => void }) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xl">
      <input
        placeholder="Search location, title..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 rounded-full shadow-lg border outline-none"
      />
    </div>
  );
}