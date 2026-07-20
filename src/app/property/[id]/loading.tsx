export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* HERO */}
      <div className="w-full h-[300px] sm:h-[380px] bg-gray-200" />

      {/* THUMBNAIL STRIP */}
      <div className="flex gap-2 px-6 mt-4 py-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-20 flex-shrink-0 rounded-xl bg-gray-200"
          />
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* TITLE + PRICE */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3">
            <div className="h-7 w-64 bg-gray-200 rounded-lg" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          <div className="h-11 w-28 bg-gray-200 rounded-full" />
        </div>

        {/* QUICK FACTS */}
        <div className="flex gap-3 mt-6">
          <div className="h-9 w-24 bg-gray-100 rounded-full" />
          <div className="h-9 w-32 bg-gray-100 rounded-full" />
        </div>

        {/* ABOUT */}
        <div className="mt-10 pt-8 border-t border-gray-100 space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
        </div>

        {/* AMENITIES */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-gray-100 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* ADDRESS */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="h-24 w-full bg-gray-100 rounded-2xl" />
        </div>
      </div>

      {/* CTA BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-11 w-36 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
