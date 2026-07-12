"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Phone, ArrowRight, Home, CheckCircle2, MessageCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type UnlockedPropertyDetails = {
  id: string;
  title: string;
  price: number;
  image_url: string;
  images?: string[];
  landlord_phone: string;
  landlord_whatsapp?: string;
  caretaker_name?: string;
  caretaker_phone?: string;
  caretaker_whatsapp?: string;
  school_tag: string;
  location: string;
};

type UnlockedProperty = {
  id: number;
  property_id: string;
  // Supabase's inferred type for a joined foreign table can come back as
  // either the object itself or an array containing it, depending on how
  // the relationship is detected. Handling both here instead of assuming
  // one shape is what actually broke this page's build once already.
  properties: UnlockedPropertyDetails | UnlockedPropertyDetails[] | null;
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-48 w-full bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function UnlockedPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<UnlockedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnlocked = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("contact_unlocks")
        .select(
          `
          id,
          property_id,
          properties (
            id,
            title,
            price,
            image_url,
            images,
            landlord_phone,
            landlord_whatsapp,
            caretaker_name,
            caretaker_phone,
            caretaker_whatsapp,
            school_tag,
            location
          )
        `
        )
        .returns<UnlockedProperty[]>();

      if (data) {
        setProperties(data);
      }

      setLoading(false);
    };

    fetchUnlocked();
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] px-5 py-8 pb-24">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mb-8">
          Unlocked contacts
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : !properties.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-[#fff1f1] flex items-center justify-center mb-5">
              <Home className="text-[#ff5a5f]" size={28} />
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              No unlocked contacts yet
            </h2>

            <p className="text-gray-500 text-center mt-2 max-w-sm">
              Unlock landlord contacts to access them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((item) => {
              const property = Array.isArray(item.properties)
                ? item.properties[0]
                : item.properties;

              if (!property) return null;

              const image =
                property.images?.[0] ||
                property.image_url ||
                "/placeholder.jpg";

              return (
                <div
                  key={item.id}
                  className="
                    bg-white rounded-3xl overflow-hidden
                    shadow-sm border border-gray-100
                    hover:shadow-md hover:-translate-y-0.5
                    transition-all duration-200
                  "
                >
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image
                      src={image}
                      alt={property.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 600px"
                      className="object-cover"
                    />

                    <span
                      className="
                        absolute top-3 left-3
                        flex items-center gap-1
                        px-3 py-1 rounded-full
                        bg-white/95 backdrop-blur-sm
                        text-emerald-600 text-xs font-medium
                        shadow-sm
                      "
                    >
                      <CheckCircle2 size={12} />
                      Unlocked
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-900">
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
                      {property.landlord_whatsapp && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          · WhatsApp: {property.landlord_whatsapp}
                        </span>
                      )}
                    </p>

                    <div className="flex gap-3 mt-5">
                      <a
                        href={`tel:${property.landlord_phone}`}
                        className="
                          flex-1 py-3 rounded-full
                          bg-green-500 hover:bg-green-600
                          text-white font-medium
                          shadow-lg shadow-green-500/25
                          flex items-center justify-center gap-2
                          transition
                        "
                      >
                        <Phone size={16} />
                        Call
                      </a>

                      {property.landlord_whatsapp && (
                        <a
                          href={`https://wa.me/${property.landlord_whatsapp.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="
                            flex-1 py-3 rounded-full
                            bg-[#25D366] hover:bg-[#20bd5a]
                            text-white font-medium
                            shadow-lg shadow-[#25D366]/25
                            flex items-center justify-center gap-2
                            transition
                          "
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                      )}

                      <button
                        onClick={() =>
                          router.push(`/property/${property.id}`)
                        }
                        className="
                          flex-1 py-3 rounded-full
                          border border-[#ff5a5f] text-[#ff5a5f]
                          font-medium
                          hover:bg-[#fff1f1]
                          flex items-center justify-center gap-2
                          transition
                        "
                      >
                        View
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {(property.caretaker_phone ||
                      property.caretaker_name) && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          Caretaker
                          {property.caretaker_name
                            ? ` · ${property.caretaker_name}`
                            : ""}
                        </p>

                        {property.caretaker_phone && (
                          <p className="text-sm font-medium text-gray-800 mt-1">
                            {property.caretaker_phone}
                          </p>
                        )}

                        <div className="flex gap-3 mt-3">
                          {property.caretaker_phone && (
                            <a
                              href={`tel:${property.caretaker_phone}`}
                              className="
                                flex-1 py-2.5 rounded-full
                                bg-green-500 hover:bg-green-600
                                text-white text-sm font-medium
                                flex items-center justify-center gap-2
                                transition
                              "
                            >
                              <Phone size={14} />
                              Call
                            </a>
                          )}

                          {property.caretaker_whatsapp && (
                            <a
                              href={`https://wa.me/${property.caretaker_whatsapp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="
                                flex-1 py-2.5 rounded-full
                                bg-[#25D366] hover:bg-[#20bd5a]
                                text-white text-sm font-medium
                                flex items-center justify-center gap-2
                                transition
                              "
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
