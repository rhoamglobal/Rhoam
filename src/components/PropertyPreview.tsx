"use client"

import { useRouter } from "next/navigation"

type Property = {
  id: string
  title: string
  price: number
}

export default function PropertyPreview({
  property,
  onClose,
}: {
  property: Property | null
  onClose: () => void
}) {
  const router = useRouter()

  if (!property) return null

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[3000]">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
        {/* Image */}
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          alt="Property"
          className="w-full h-44 object-cover"
        />

        {/* Content */}
        <div className="p-4">
          <h2 className="font-semibold text-lg leading-tight">
            {property.title}
          </h2>

          <p className="text-[#ff5a5f] font-extrabold text-xl mt-1">
            ₦{property.price.toLocaleString()}
          </p>

          {/* Preview Button */}
          <button
            onClick={() => router.push(`/property/${property.id}`)}
            className="mt-3 w-full py-2 rounded-full text-sm font-medium border border-zinc-300 hover:border-black hover:bg-black hover:text-white transition"
          >
            Preview Lodge
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-zinc-500 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  )
}