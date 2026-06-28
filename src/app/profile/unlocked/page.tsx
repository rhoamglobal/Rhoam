"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Phone, ArrowRight, Home } from "lucide-react";

type UnlockedProperty = {
  id: number;
  property_id: string;
  properties: {
    id: string;
    title: string;
    price: number;
    image_url: string;
    images?: string[];
    landlord_phone: string;
    school_tag: string;
    location: string;
  }[];
};

export default function UnlockedPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<
    UnlockedProperty[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnlocked = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("contact_unlocks")
        .select(`
          id,
          property_id,
          properties (
            id,
            title,
            price,
            image_url,
            landlord_phone,
            school_tag,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("UNLOCKED:", data);
      console.log("ERROR:", error);

      if (data) {
        setProperties(data as UnlockedProperty[]);
      }

      setLoading(false);
    };

    fetchUnlocked();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        Loading unlocked contacts...
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-[#fff1f1] flex items-center justify-center mb-5">
          <Home className="text-[#ff5a5f]" size={28} />
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          No unlocked contacts yet
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Unlock landlord contacts to access them here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-5 py-8 pb-20">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Unlocked Contacts
      </h1>

      <div className="space-y-4">
      {properties.map((item) => {
        const property = item.properties[0];

        if (!property) return null;

        return (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100"
            >
              <div className="relative h-48 w-full">
              <Image
                src={
                    (property.images?.length
                    ? property.images[0]
                    : property.image_url || property.images?.[0]) || "/placeholder.jpg"
                }
                alt={property.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
                />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  {property.title}
                </h2>

                <p className="text-[#ff5a5f] font-bold mt-1">
                  ₦{property.price.toLocaleString()}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {property.school_tag} • {property.location}
                </p>

                <p className="text-sm font-medium text-gray-800 mt-3">
                  {property.landlord_phone}
                </p>

                <div className="flex gap-3 mt-5">
                  <a
                    href={`tel:${property.landlord_phone}`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Call
                  </a>

                  <button
                    onClick={() =>
                      router.push(`/property/${property.id}`)
                    }
                    className="flex-1 border border-[#ff5a5f] text-[#ff5a5f] py-3 rounded-2xl flex items-center justify-center gap-2"
                  >
                    View
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}