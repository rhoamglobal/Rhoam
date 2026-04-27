// app/property/[id]/page.tsx

async function getProperty(id: string) {
  const res = await fetch(`http://localhost:3000/api/property/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch property");
  }

  return res.json();
}

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await getProperty(params.id);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">{property.title}</h1>
      <p className="text-xl mt-2">₦{property.price}</p>

      <div className="mt-6">
        <p>Latitude: {property.latitude}</p>
        <p>Longitude: {property.longitude}</p>
        <p>Category: {property.category}</p>
      </div>
    </div>
  );
}