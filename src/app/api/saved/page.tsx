import { createClient } from "@supabase/supabase-js";

export default async function SavedPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // TEMP USER (replace later with auth)
  const userId = "guest-user-1";

  const { data: saved } = await supabase
    .from("saved_properties")
    .select("property_id");

  const ids = saved?.map((s) => s.property_id) || [];

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .in("id", ids);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-semibold mb-6 text-[#FF6B6B]">
        Saved Properties
      </h1>

      {properties?.length === 0 && (
        <p className="text-gray-500">No saved properties yet.</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {properties?.map((p) => (
          <a
            key={p.id}
            href={`/property/${p.id}`}
            className="border rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <img
              src={p.images?.[0]}
              className="h-40 w-full object-cover"
            />

            <div className="p-3">
              <p className="font-semibold">
                ₦{p.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{p.title}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}