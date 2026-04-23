import Image from "next/image";

type Property = {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
};

async function getProperty(id: string): Promise<Property | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/property/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await getProperty(params.id);

  if (!property) {
    return <div className="p-10">Property not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Image */}
      <div className="relative w-full h-[350px] rounded-3xl overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          alt="Property"
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="mt-6 space-y-4">
        <h1 className="text-3xl font-semibold">{property.title}</h1>

        <p className="text-2xl font-bold text-[#ff5a5f]">
          ₦{property.price.toLocaleString()}
        </p>

        <p className="text-gray-600">
          Located at coordinates: {property.latitude}, {property.longitude}
        </p>

        {/* Contact Button */}
        <button className="mt-6 px-6 py-3 rounded-full bg-[#ff5a5f] text-white font-medium shadow-md hover:shadow-lg transition">
          Contact Landlord
        </button>
      </div>
    </div>
  );
}