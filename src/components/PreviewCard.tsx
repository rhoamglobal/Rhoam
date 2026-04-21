export default function PreviewCard({ property }: { property: any }) {
  if (!property) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[92%] bg-white rounded-2xl shadow-2xl overflow-hidden z-[1000]">
      <img src={property.image} className="h-44 w-full object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{property.title}</h3>
        <p className="text-sm text-gray-500">Verified by Rhoam</p>
        <p className="mt-1 font-bold" style={{ color: "#FF5A5F" }}>
          ₦{property.price}
        </p>
      </div>
    </div>
  );
}