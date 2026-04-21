"use client";

export default function PropertyCard({
  property,
  onClose,
}: {
  property: any;
  onClose: () => void;
}) {
  if (!property) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[92%] bg-white rounded-2xl shadow-xl z-[1200] p-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">{property.title}</h2>
          <p className="text-sm text-gray-500">{property.address}</p>
        </div>
        <button onClick={onClose}>✕</button>
      </div>

      <p className="mt-2 text-sm line-clamp-2">{property.description}</p>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-coral-500 font-bold text-lg">
          ₦{property.price.toLocaleString()}
        </span>

        <button className="bg-[#FF6F61] text-white px-4 py-2 rounded-full text-sm">
          Contact Landlord
        </button>
      </div>
    </div>
  );
}